import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { getDb, sql } from "@/lib/db";

type ClientInput = {
  code?: unknown;
  name?: unknown;
  surname?: unknown;
  email?: unknown;
  mobile?: unknown;
};

type KycInput = Record<string, unknown>;

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function boolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function nullable(value: string): string | null {
  return value || null;
}

function validateKyc(body: KycInput) {
  const client = {
    code: text(body.Code, 20),
    category: text(body.Category, 15),
    title: text(body.Title, 10),
    name: text(body.Name, 200),
    surname: text(body.Surname, 50),
    ubo: text(body.UBO, 200),
    address: text(body.Address, 500),
    city: text(body.City, 100),
    vat: text(body.VAT, 50),
    telRes: text(body.TelRes, 20),
    telForeign: text(body.TelForegin, 20),
    telOff: text(body.TelOff, 20),
    fax: text(body.Fax, 20),
    mobile: text(body.Mobile, 20),
    qualification: text(body.Qualification, 100),
    email: text(body.EMail, 100),
    occupation: text(body.Occupation, 100),
    resident: boolean(body.Resident),
    nationality: text(body.Nationality, 100),
    countryCode: text(body.CountryCode, 10),
    passportNo: text(body.PassportNo, 50),
    nid: text(body.NID, 50),
    brn: text(body.BRN, 50),
    gender: text(body.Gender, 10),
    dob: text(body.DOB, 10),
    remarks: text(body.Remarks, 1000),
  };

  const errors: Record<string, string> = {};
  if (client.category === "Individual" && !client.ubo) client.ubo = `${client.surname} ${client.name}`.trim();
  if (!client.code) errors.Code = "Enter a client code and search for the client first.";
  if (client.category !== "Individual" && client.category !== "Company") errors.Category = "Select the category.";
  if (!client.title) errors.Title = "Select the proper title.";
  if (!client.name) errors.Name = "Enter the name.";
  if (client.category === "Individual" && !client.surname) errors.Surname = "Enter the surname.";
  if (!client.ubo) errors.UBO = "Enter the ultimate beneficial owner.";

  // The form exposes TelRes / Abroad as one field and sends foreign numbers
  // in TelForegin when that is the value loaded from the legacy schema.
  if (!client.mobile && !client.telRes && !client.telForeign) {
    errors.Mobile = "Enter a mobile or residential number.";
    errors.TelRes = "Enter a mobile or residential number.";
  }
  if (client.mobile && !/^5\d{7}$/.test(client.mobile)) errors.Mobile = "Mobile number must contain 8 digits and start with 5.";
  if (client.telRes && !/^\d{7}$/.test(client.telRes)) errors.TelRes = "Residential number must contain 7 digits.";
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) errors.EMail = "Enter a valid email address.";

  if (client.category === "Individual") {
    if (!client.gender || !["Male", "Female"].includes(client.gender)) errors.Gender = "Select the gender.";
    if (!client.dob || Number.isNaN(Date.parse(`${client.dob}T00:00:00`))) errors.DOB = "Enter a valid date of birth.";

    if (client.nationality.toLowerCase() === "mauritius") {
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{14}$/.test(client.nid)) errors.NID = "Mauritian National ID must be 14 alphanumeric characters containing letters and numbers.";
    } else if (client.passportNo.length < 9) {
      errors.PassportNo = "Passport number must contain at least 9 characters (letters, numbers or symbols).";
    }
  }
  // Whenever a passport number is entered it must have at least 9 characters (any letters, numbers or symbols).
  if (client.passportNo && client.passportNo.length < 9 && !errors.PassportNo) {
    errors.PassportNo = "Passport number must contain at least 9 characters (letters, numbers or symbols).";
  }

  if (client.category === "Company" && client.brn.length < 9) errors.BRN = "Business registration number must contain at least 9 characters.";

  // Column sizes of dbo.Client: a longer value would make SQL Server reject the whole KYC save.
  const columnLimits: Record<string, number> = { Surname: 50, City: 50, VAT: 15, TelRes: 15, TelForegin: 15, TelOff: 15, Fax: 15, Mobile: 15, Qualification: 50, EMail: 50, Occupation: 50, Nationality: 50, PassportNo: 15, NID: 15, BRN: 25, Remarks: 100 };
  for (const [field, max] of Object.entries(columnLimits)) {
    const raw = typeof body[field] === "string" ? (body[field] as string).trim() : "";
    if (raw.length > max && !errors[field]) errors[field] = `Maximum ${max} characters.`;
  }

  return { client, errors };
}

function databaseError(error: unknown) {
  console.error("Client database request failed", error);
  const message =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "The client database is unavailable.";

  return NextResponse.json({ error: message }, { status: 500 });
}

type Pool = Awaited<ReturnType<typeof getDb>>;

// Finds the client record that belongs to the signed-in user:
// 1) the client code on the latest policy this user created online (MotorMaster.Iuser = web:<userId>);
// 2) otherwise the single client whose e-mail or mobile matches the user's verified login e-mail / mobile.
async function findOwnClientCode(pool: Pool, userId: string): Promise<string | null> {
  try {
    const columns = new Set((await pool.request().query("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('dbo.MotorMaster')")).recordset.map((row: { name: string }) => row.name));
    const clientColumn = ["ClientCode", "Client"].find((name) => columns.has(name));
    if (clientColumn && columns.has("Iuser")) {
      const order = columns.has("Idate") ? "ORDER BY [Idate] DESC" : "";
      const policy = await pool.request().input("iuser", sql.VarChar(100), `web:${userId}`)
        .query(`SELECT TOP (1) [${clientColumn}] AS ClientCode FROM dbo.MotorMaster WHERE Iuser = @iuser AND LTRIM(RTRIM(ISNULL([${clientColumn}], ''))) NOT IN ('', 'WEB') ${order}`);
      const code = String(policy.recordset[0]?.ClientCode ?? "").trim();
      if (code) return code;
    }
  } catch (error) {
    console.warn("Own client lookup by policy failed", error);
  }

  const user = (await pool.request().input("userId", sql.UniqueIdentifier, userId)
    .query("SELECT Email, Mobile, EmailVerified, MobileVerified FROM dbo.WebUsers WHERE UserId = @userId")).recordset[0] as
    { Email: string | null; Mobile: string | null; EmailVerified: boolean; MobileVerified: boolean } | undefined;
  if (!user) return null;
  const email = user.EmailVerified && user.Email ? user.Email.trim().toLowerCase() : null;
  // Client.Mobile holds the 8-digit local number (5xxxxxxx); the login mobile is international (+2305xxxxxxx).
  const digits = user.MobileVerified && user.Mobile ? user.Mobile.replace(/\D/g, "") : "";
  const mobile = /^(230)?5\d{7}$/.test(digits) ? digits.slice(-8) : null;
  // The verified login e-mail belongs to this user, so clients with that e-mail are theirs. Earlier
  // versions created a new client on every visit; prefer one with completed KYC, then the latest one.
  if (email) {
    const byEmail = await pool.request().input("email", sql.VarChar(100), email).query(`
      SELECT TOP (1) c.Code FROM dbo.Client AS c
      LEFT JOIN dbo.ClientKYC AS kyc ON kyc.Code = c.Code
      WHERE LOWER(LTRIM(RTRIM(c.EMail))) = @email
      ORDER BY CASE WHEN kyc.Code IS NULL THEN 1 ELSE 0 END, COALESCE(c.UDate, c.Idate) DESC
    `);
    if (byEmail.recordset[0]) return String(byEmail.recordset[0].Code).trim();
  }
  if (!mobile) return null;
  const byMobile = await pool.request().input("mobile", sql.VarChar(20), mobile).query(`
    SELECT TOP (2) Code FROM dbo.Client
    WHERE REPLACE(REPLACE(LTRIM(RTRIM(Mobile)), ' ', ''), '-', '') = @mobile
  `);
  // A mobile number is only used when it matches exactly one client.
  return byMobile.recordset.length === 1 ? String(byMobile.recordset[0].Code).trim() : null;
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const mine = request.nextUrl.searchParams.get("mine") === "1";
  let code = text(request.nextUrl.searchParams.get("code"), 20);
  if (!code && !mine) {
    return NextResponse.json({ error: "A client code is required." }, { status: 400 });
  }

  try {
    const pool = await getDb();
    if (mine) {
      code = (await findOwnClientCode(pool, userId)) ?? "";
      // A first-time user has no client record yet: the form keeps its new-client format.
      if (!code) return NextResponse.json({ client: null });
    }
    const result = await pool
      .request()
      .input("code", sql.VarChar(20), code)
      .query(`
        SELECT TOP (1)
          c.Code, c.Category, c.Title, c.Name, c.Surname, c.UBO,
          c.Nationality, c.NID, c.PassportNo, c.VAT, c.DOB,
          c.Address, c.City, c.TelOff, c.TelRes, c.Mobile,
          c.TelForegin, c.Fax, c.EMail, c.Occupation, c.Qualification,
          c.SpClient, c.BlackList, c.BlackListInfo, c.Remarks, c.DecDate,
          c.Resident, c.CountryCode, c.Gender, c.BussRegNo AS BRN, c.AgentCode,
          account.CreditLimit,
          CAST(CASE WHEN kyc.Code IS NULL THEN 0 ELSE 1 END AS bit) AS HasKYC
        FROM dbo.Client AS c
        LEFT JOIN dbo.ClientKYC AS kyc ON kyc.Code = c.Code
        OUTER APPLY (
          SELECT TOP (1) sub.CreditLimit
          FROM dbo.SubLAccount AS sub
          WHERE sub.Code = c.Code
          ORDER BY sub.ID
        ) AS account
        WHERE c.Code = @code
      `);

    const client = result.recordset[0];
    if (!client) {
      if (mine) return NextResponse.json({ client: null });
      return NextResponse.json({ error: `Client ${code} was not found.` }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    return databaseError(error);
  }
}

export async function PUT(request: NextRequest) {
  if (!await getCurrentUserId()) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  let body: KycInput;
  try {
    body = (await request.json()) as KycInput;
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const { client, errors } = validateKyc(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Check the highlighted KYC fields.", errors }, { status: 400 });
  }

  let transaction: InstanceType<typeof sql.Transaction> | undefined;
  try {
    const pool = await getDb();
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

    const lock = await new sql.Request(transaction)
      .input("code", sql.VarChar(20), client.code)
      .query(`
        SELECT TOP (1) c.Code,
          CAST(CASE WHEN EXISTS (SELECT 1 FROM dbo.ClientKYC WITH (UPDLOCK, HOLDLOCK) WHERE Code = c.Code) THEN 1 ELSE 0 END AS bit) AS HasKYC
        FROM dbo.Client AS c WITH (UPDLOCK, HOLDLOCK)
        WHERE c.Code = @code
      `);

    if (!lock.recordset[0]) {
      await transaction.rollback();
      return NextResponse.json({ error: `Client ${client.code} was not found.` }, { status: 404 });
    }
    if (boolean(lock.recordset[0].HasKYC)) {
      await transaction.rollback();
      return NextResponse.json({ error: "This KYC is already completed. Contact Head Office for further changes." }, { status: 409 });
    }

    await writeKyc(transaction, client);

    await transaction.commit();
    return NextResponse.json({ client: { ...body, Code: client.code, HasKYC: true }, message: "KYC saved successfully." });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch { /* Transaction may already be closed. */ }
    }
    return databaseError(error);
  }
}

// Saves every KYC field (passport, NID, address, occupation, ...) on dbo.Client and records the
// completed KYC in dbo.ClientKYC. Used for existing clients (PUT) and new clients (POST).
async function writeKyc(transaction: InstanceType<typeof sql.Transaction>, client: ReturnType<typeof validateKyc>["client"]) {
    const savedAt = new Date();
    const request = new sql.Request(transaction)
      .input("code", sql.VarChar(20), client.code)
      .input("category", sql.VarChar(15), client.category)
      .input("title", sql.VarChar(10), client.title)
      .input("name", sql.VarChar(200), client.name)
      .input("surname", sql.VarChar(50), nullable(client.surname))
      .input("ubo", sql.VarChar(200), client.ubo)
      .input("address", sql.VarChar(500), nullable(client.address))
      .input("city", sql.VarChar(100), nullable(client.city))
      .input("vat", sql.VarChar(50), nullable(client.vat))
      .input("telRes", sql.VarChar(20), nullable(client.telRes))
      .input("telForeign", sql.VarChar(20), nullable(client.telForeign))
      .input("telOff", sql.VarChar(20), nullable(client.telOff))
      .input("fax", sql.VarChar(20), nullable(client.fax))
      .input("mobile", sql.VarChar(20), nullable(client.mobile))
      .input("qualification", sql.VarChar(100), nullable(client.qualification))
      .input("email", sql.VarChar(100), nullable(client.email))
      .input("occupation", sql.VarChar(100), nullable(client.occupation))
      .input("resident", sql.Bit, client.resident)
      .input("nationality", sql.VarChar(100), nullable(client.nationality))
      .input("countryCode", sql.VarChar(10), nullable(client.countryCode))
      .input("passportNo", sql.VarChar(50), nullable(client.passportNo))
      .input("nid", sql.VarChar(50), nullable(client.nid))
      .input("brn", sql.VarChar(50), nullable(client.brn))
      .input("gender", sql.VarChar(10), client.category === "Individual" ? client.gender : null)
      .input("dob", sql.Date, client.category === "Individual" ? new Date(`${client.dob}T00:00:00`) : null)
      .input("remarks", sql.VarChar(1000), nullable(client.remarks))
      .input("savedAt", sql.DateTime, savedAt)
      .input("savedBy", sql.VarChar(50), "motor-insurance-web");

    await request.query(`
      UPDATE dbo.Client SET
        Category = @category, Title = @title, Name = @name, Surname = @surname,
        UBO = @ubo, Address = @address, City = @city, VAT = @vat,
        TelRes = @telRes, TelForegin = @telForeign, TelOff = @telOff, Fax = @fax,
        Mobile = @mobile, Qualification = @qualification, EMail = @email,
        Occupation = @occupation, Resident = @resident, Nationality = @nationality,
        CountryCode = @countryCode, PassportNo = @passportNo, NID = @nid,
        BussRegNo = @brn, Gender = @gender, DOB = @dob, Remarks = @remarks,
        UDate = @savedAt, Uuser = @savedBy
      WHERE Code = @code;

      INSERT INTO dbo.ClientKYC (Code, Iuser, IDate)
      VALUES (@code, @savedBy, @savedAt);
    `);
}

export async function POST(request: NextRequest) {
  if (!await getCurrentUserId()) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  let body: KycInput;
  try {
    body = (await request.json()) as KycInput;
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const { client, errors } = validateKyc(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Check the highlighted KYC fields.", errors }, { status: 400 });
  }

  let transaction: InstanceType<typeof sql.Transaction> | undefined;
  try {
    const pool = await getDb();
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
    const result = await new sql.Request(transaction)
      .input("code", sql.VarChar(20), client.code)
      .input("category", sql.VarChar(15), client.category)
      .input("title", sql.VarChar(10), client.title)
      .input("name", sql.VarChar(200), client.name)
      .input("surname", sql.VarChar(50), nullable(client.surname))
      .input("email", sql.VarChar(50), nullable(client.email))
      .input("mobile", sql.VarChar(15), nullable(client.mobile))
      .input("createdAt", sql.DateTime, new Date())
      .input("createdBy", sql.VarChar(50), "motor-insurance-web")
      .query(`
        INSERT INTO dbo.Client (Code, Category, Title, Name, Surname, EMail, Mobile, Idate, Iuser)
        OUTPUT inserted.Code, inserted.Category, inserted.Title, inserted.Name, inserted.Surname,
               inserted.EMail, inserted.Mobile
        VALUES (@code, @category, @title, @name, @surname, @email, @mobile, @createdAt, @createdBy)
      `);
    // A new client's KYC was previously only partly saved (no passport, NID, address, ...).
    // Save every KYC field and mark the KYC as completed, in the same transaction.
    await writeKyc(transaction, client);
    await transaction.commit();

    return NextResponse.json({ client: { ...body, ...result.recordset[0], Code: client.code, HasKYC: true }, message: "KYC saved successfully." }, { status: 201 });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch { /* Transaction may already be closed. */ }
    }
    if (typeof error === "object" && error && "number" in error && error.number === 2627) {
      return NextResponse.json(
        { error: `Client code ${client.code} already exists. Search for it or choose another code.` },
        { status: 409 },
      );
    }
    return databaseError(error);
  }
}
