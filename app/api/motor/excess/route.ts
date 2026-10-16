import { NextResponse } from "next/server";
import { getDb, sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    
    const url = new URL(request.url, `http://${request.headers.get("host") || "localhost:3001"}`);
    const queryString = url.search.slice(1).replace(/\+/g, "%20");
    
    const params: Record<string, string> = {};
    const pairs = queryString.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
    
    const vehicleClass = params.vehicleClass || "";
    const vehicleType = params.vehicleType || "";
    const fuelType = params.fuelType || "";
    const make = params.make || "";
    const model = params.model || "";
    const sumInsured = parseFloat(params.sumInsured || "0");
    const manufactureDate = params.manufactureDate || "";
    const issueDate = params.issueDate || "";
    const seating = parseInt(params.seating || "0");
    const country = params.country || "MAURITIUS";
    const cylCapacity = parseFloat(params.cylCapacity || "0");
    const gvw = parseFloat(params.gvw || "0");
    const dateOfManufacture = params.dateOfManufacture || manufactureDate;
    const fromDate = params.fromDate || issueDate;
    const coverRequired = params.coverRequired || "";
    const coverReqIndex = coverRequired.toLowerCase().includes("comprehensive") ? 0 : 3;
    const status = params.status || "NEW";
    const isPrivateCar = vehicleClass.toUpperCase().includes("PRIVATE CAR");
    const tariffDate = params.tariffDate || new Date().toISOString().slice(0, 10);
    
    // Calculate Age from manufacturing date and from date of policy
    let calculatedAge = 0;
    if (dateOfManufacture && fromDate) {
      const mfgDate = new Date(dateOfManufacture);
      const fromDateObj = new Date(fromDate);
      calculatedAge = (fromDateObj.getTime() - mfgDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }
    
    let compulsoryExcess: string[] = [];
    let youngDriverExcess: string[] = [];
    let totalLossExcess: string | null = null;
    const tpfExcess: string[] = [];
    let addExcess: string | null = null;
    let success = true;
    let errorMsg = "";
    
    const issueDateStr = issueDate ? new Date(issueDate).toISOString().slice(0, 10) : "";
    const tariffDateStr = tariffDate ? new Date(tariffDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    
    // STEP 1: Total-Loss excess lookup (MotTotalLossExcess) + 10M sum-insured validation
    // Total Loss Excess only applies when Sum Insured >= 3,000,000
    if (sumInsured >= 3000000 && issueDateStr) {
      const tlResult = await db.request()
        .input("SumInsured", sumInsured)
        .input("IssueDate", issueDateStr)
        .query(`
          SELECT TOP 1 TLexcess 
          FROM MotTotalLossExcess 
          WHERE @SumInsured BETWEEN SumRange1 AND SumRange2
            AND @IssueDate BETWEEN Efffrom AND EffTo
            AND Status = 'O'
          ORDER BY SumRange1
        `);
      if (tlResult.recordset.length > 0) {
        totalLossExcess = String(tlResult.recordset[0].TLexcess || "");
      }
      
      // 10M sum-insured validation
      if (totalLossExcess && sumInsured > 10000000) {
        success = false;
        errorMsg = "HO REVIEW-10M";
        totalLossExcess = null;
        return NextResponse.json({ 
          compulsoryExcess: ["Select..."],
          youngDriverExcess: ["Select..."],
          totalLossExcess,
          tpfExcess: ["Select..."],
          addExcess,
          success,
          errorMsg
        });
      }
    } else {
      // Sum Insured < 3,000,000 or missing issue date - Total Loss Excess not applicable
      totalLossExcess = null;
    }
    
    // STEP 2: Resolve effective fuel type (Petrol/Electric + Coupe/Limited model override)
    let calcFuelType = fuelType === "Electric" ? "Electric" : "Petrol";
    if (model && (model.toUpperCase().includes("COUPE") || model.toUpperCase().includes("LIMITED"))) {
      calcFuelType = "Electric";
    }
    
    // STEP 3: Class-B tariff - "Only Make" (MotClassBVehList)
    if (make && sumInsured > 0 && issueDateStr) {
      const onlyMakeResult = await db.request()
        .input("Make", make.toUpperCase())
        .input("FuelType", calcFuelType)
        .input("SumInsured", sumInsured)
        .input("IssueDate", issueDateStr)
        .query(`
          SELECT TOP 1 ExcessComp, ExcessYoung
          FROM MotClassBVehList
          WHERE UPPER(Make) = UPPER(@Make)
            AND OnlyMake = 1
            AND @IssueDate BETWEEN EffDate AND ExpDate
            AND FuelType = @FuelType
            AND @SumInsured BETWEEN ISNULL(SumInsFrom, 0) AND ISNULL(SumInsTo, 999999999)
            AND Status = 'O'
          ORDER BY EffDate DESC
        `);
      
      if (onlyMakeResult.recordset.length > 0) {
        compulsoryExcess = [String(onlyMakeResult.recordset[0].ExcessComp || "")];
        youngDriverExcess = [String(onlyMakeResult.recordset[0].ExcessYoung || "")];
        
        if (!compulsoryExcess[0]) {
          success = false;
          errorMsg = "NO Class B-VERIFY";
        }
        
        return NextResponse.json({ 
          compulsoryExcess, 
          youngDriverExcess, 
          totalLossExcess, 
          tpfExcess: ["Select..."],
          addExcess,
          success,
          errorMsg
        });
      }
    }
    
    // STEP 4: Class-B tariff - "Make & Model" (MotClassBVehList)
    if (make && model && sumInsured > 0 && issueDateStr) {
      const makeModelResult = await db.request()
        .input("Make", make.toUpperCase())
        .input("Model", model.toUpperCase())
        .input("FuelType", calcFuelType)
        .input("SumInsured", sumInsured)
        .input("IssueDate", issueDateStr)
        .query(`
          SELECT TOP 1 ExcessComp, ExcessYoung
          FROM MotClassBVehList
          WHERE UPPER(Make) = UPPER(@Make)
            AND UPPER(Model) = UPPER(@Model)
            AND @IssueDate BETWEEN EffDate AND ExpDate
            AND FuelType = @FuelType
            AND @SumInsured BETWEEN ISNULL(SumInsFrom, 0) AND ISNULL(SumInsTo, 999999999)
            AND Status = 'O'
          ORDER BY EffDate DESC
        `);
      
      if (makeModelResult.recordset.length > 0) {
        compulsoryExcess = [String(makeModelResult.recordset[0].ExcessComp || "")];
        youngDriverExcess = [String(makeModelResult.recordset[0].ExcessYoung || "")];
        
        return NextResponse.json({ 
          compulsoryExcess, 
          youngDriverExcess, 
          totalLossExcess, 
          tpfExcess: ["Select..."],
          addExcess,
          success,
          errorMsg
        });
      }
    }
    
    // STEP 5: Electric-vehicle tariff (MotElectricExcess) - effective Apr-2026
    const isElectric = calcFuelType === "Electric";
    const isNotTwoWheelers = !vehicleClass.toUpperCase().includes("TWO WHEELER");
    
    if (isElectric && isNotTwoWheelers && sumInsured > 0) {
      const electricResult = await db.request()
        .input("SumInsured", sumInsured)
        .input("TariffDate", tariffDateStr)
        .query(`
          SELECT TOP 1 excess
          FROM MotElectricExcess
          WHERE @SumInsured BETWEEN sumrange1 AND SumRange2
            AND @TariffDate BETWEEN Efffrom AND EffTo
        `);
      
      if (electricResult.recordset.length > 0) {
        compulsoryExcess = [String(electricResult.recordset[0].excess || "")];
        youngDriverExcess = ["5000"];
      } else {
        success = false;
        errorMsg = "NO ELECTRIC TARIFF FOUND";
        compulsoryExcess = [];
        youngDriverExcess = [];
        return NextResponse.json({ 
          compulsoryExcess: ["Select..."], 
          youngDriverExcess: ["Select..."], 
          totalLossExcess, 
          tpfExcess: ["Select..."],
          addExcess,
          success,
          errorMsg
        });
      }
      
      return NextResponse.json({ 
        compulsoryExcess, 
        youngDriverExcess, 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    // STEP 6: General tariff path (MotTariffConfigMast + MotTariffMast)
    // Feet: val(trailer feet) = 0 as per requirement (TxtTrailerFeet.Text = 0)
    // Trailer override removed - feet parameter is always 0
    
    // Guard: if CoverReq index < 3 (Comprehensive) and SumInsured = 0, exit quietly
    if (coverReqIndex < 3 && sumInsured === 0) {
      return NextResponse.json({ 
        compulsoryExcess: ["Select..."], 
        youngDriverExcess: ["Select..."], 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    const blnCompCover = coverReqIndex < 3 ? 1 : 0;
    const effectiveSeating = seating || 0;
    
    // Guard: if both Seating and CC are 0, return error
    if (effectiveSeating === 0 && cylCapacity === 0) {
      success = false;
      errorMsg = "";
      return NextResponse.json({ 
        compulsoryExcess: ["Select..."], 
        youngDriverExcess: ["Select..."], 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    // 6a. Look up tariff configuration parameters
    const configResult = await db.request()
      .input("VehicleType", vehicleClass)
      .input("IssueDate", issueDateStr)
      .query(`
        SELECT TOP 1 
          ISNULL(Parameter1, '') as Parameter1,
          ISNULL(Parameter2, '') as Parameter2,
          ISNULL(Parameter3, '') as Parameter3,
          ISNULL(Parameter4, '') as Parameter4
        FROM MotTariffConfigMast
        WHERE UPPER(VehicleType) = UPPER(@VehicleType)
          AND @IssueDate BETWEEN Efffrom AND EffTo
      `);
    
    if (configResult.recordset.length === 0) {
      success = false;
      errorMsg = "NO Configuration details- VEHICLE TYPE";
      return NextResponse.json({ 
        compulsoryExcess: ["Select..."], 
        youngDriverExcess: ["Select..."], 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    const { Parameter1, Parameter2, Parameter3, Parameter4 } = configResult.recordset[0];
    
    if (!Parameter1 && !Parameter2 && !Parameter3 && !Parameter4) {
      success = false;
      errorMsg = "NO Configuration details- VEHICLE TYPE";
      return NextResponse.json({ 
        compulsoryExcess: ["Select..."], 
        youngDriverExcess: ["Select..."], 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    // 6b. Build dynamic condition
    let cond = "";
    
    if (Parameter1 === "Age") {
      cond = "@pAge BETWEEN SumInsFrom AND SumInsTo";
    } else if (Parameter1.toUpperCase() === "CC/KW") {
      cond = "@pCC BETWEEN SumInsFrom AND SumInsTo";
    } else if (Parameter1 === "Seating") {
      cond = "@pSeating BETWEEN SumInsFrom AND SumInsTo";
    } else if (Parameter1 === "Feet") {
      cond = "@pFeet BETWEEN SumInsFrom AND SumInsTo";
    } else if (Parameter1 === "MGW") {
      cond = "@pMGW BETWEEN SumInsFrom AND SumInsTo";
    } else if (Parameter1 === "SumInsured") {
      cond = "@pSum BETWEEN SumInsFrom AND SumInsTo";
    }
    
    let cond2 = "";
    if (Parameter2 === "Age") {
      cond2 = "@pAge BETWEEN CCFrom AND CCTo";
    } else if (Parameter2.toUpperCase() === "CC/KW") {
      cond2 = "@pCC BETWEEN CCFrom AND CCTo";
    } else if (Parameter2 === "Seating") {
      cond2 = "@pSeating BETWEEN CCFrom AND CCTo";
    } else if (Parameter2 === "Feet") {
      cond2 = "@pFeet BETWEEN CCFrom AND CCTo";
    } else if (Parameter2 === "MGW") {
      cond2 = "@pMGW BETWEEN CCFrom AND CCTo";
    } else if (Parameter2 === "SumInsured") {
      cond2 = "@pSum BETWEEN SumInsFrom AND SumInsTo";
    }
    
    if (cond2) {
      cond = cond ? cond + " AND " + cond2 : cond2;
    }
    
    if (Parameter3 === "Excess") {
      cond = cond ? cond + " AND Excess = @pExcess" : "Excess = @pExcess";
    }
    
    if (!cond) {
      cond = "1 = 1";
    }
    
    // 6c. Run the tariff lookup
    const excessParam = 0; // Per stored procedure note: @Excess = 0 for general path
    // Feet: val(trailer feet) = 0 as per requirement
    const feetParam = 0;
    
    const tariffResult = await db.request()
      .input("pClass", vehicleClass)
      .input("pIssDate", issueDateStr)
      .input("pCountry", country)
      .input("pAge", calculatedAge) // Calculated from manufacture date and from date
      .input("pCC", cylCapacity)
      .input("pSeating", effectiveSeating)
      .input("pFeet", feetParam) // val(trailer feet) = 0
      .input("pMGW", gvw)
      .input("pSum", sumInsured)
      .input("pExcess", excessParam)
      .query(`
        SELECT TOP 1
          Excess,
          Youngexcess,
          TPFExcess
        FROM MotTariffMast
        WHERE SubType = @pClass
          AND ${cond}
          AND @pIssDate BETWEEN Efffrom AND EffTo
          AND Country = @pCountry
      `);
    
    if (tariffResult.recordset.length > 0) {
      compulsoryExcess = [String(tariffResult.recordset[0].Excess || "")];
      youngDriverExcess = [String(tariffResult.recordset[0].Youngexcess || "")];
      tpfExcess.push(String(tariffResult.recordset[0].TPFExcess || ""));
    } else {
      success = false;
      errorMsg = "NO RATE AVAILABLE";
      return NextResponse.json({ 
        compulsoryExcess: ["Select..."], 
        youngDriverExcess: ["Select..."], 
        totalLossExcess, 
        tpfExcess: ["Select..."],
        addExcess,
        success,
        errorMsg
      });
    }
    
    // STEP 7: Additional excess for vehicles older than 10 years (MotExtenCompToMakes)
    if (isPrivateCar && dateOfManufacture && fromDate && sumInsured > 0 && issueDateStr) {
      const makeExists = await db.request()
        .input("Make", make.toUpperCase())
        .input("IssueDate", issueDateStr)
        .query(`
          SELECT 1 
          FROM MotExtenCompToMakes
          WHERE @IssueDate BETWEEN Effdate AND EffTo
            AND Make = @Make
        `);
      
      if (makeExists.recordset.length > 0) {
        const mfgDate = new Date(dateOfManufacture);
        const fromDateObj = new Date(fromDate);
        const ageYears = (fromDateObj.getTime() - mfgDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        
        if (ageYears >= 10) {
          addExcess = String(cylCapacity < 1001 ? 3000 : 5000);
        }
      }
    }
    
    const response = { 
      compulsoryExcess: compulsoryExcess.length > 0 ? compulsoryExcess : ["Select..."],
      youngDriverExcess: youngDriverExcess.length > 0 ? youngDriverExcess : ["Select..."],
      totalLossExcess,
      tpfExcess: tpfExcess.length > 0 ? tpfExcess : ["Select..."],
      addExcess,
      success,
      errorMsg
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Excess lookup failed", error);
    return NextResponse.json({ 
      compulsoryExcess: ["Select..."],
      youngDriverExcess: ["Select..."],
      totalLossExcess: null,
      tpfExcess: ["Select..."],
      addExcess: null,
      success: false,
      errorMsg: "Internal server error"
    }, { status: 200 });
  }
}