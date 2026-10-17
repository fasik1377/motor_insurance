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
    
    const country = params.country || "MAURITIUS";
    const issueDate = params.issueDate || new Date().toISOString().slice(0, 10);
    const isComprehensive = params.coverRequired === "Comprehensive" || params.coverRequired === "Comprehensive AutoPlus";
    const blnCompCover = isComprehensive ? 1 : 0;
    const vehicleStatus = params.vehicleStatus || "NEW";
    const vehicleClass = params.vehicleClass || "";
    const vehicleType = params.vehicleType || "";
    const age = parseFloat(params.age || "0");
    const seating = parseInt(params.seating || "0");
    let cc = parseFloat(params.cylCapacity || "0");
    const feet = parseInt(params.trailerFeet || "0");
    const excess = parseFloat(params.excess || "0");
    const sumInsured = parseFloat(params.sumInsured || "0");
    // The page sends the gross vehicle weight as "mgw"; "gvw" is accepted as a fallback.
    const mgw = parseFloat(params.mgw || params.gvw || "0");
    const isPrivateCar = vehicleClass.toUpperCase().includes("PRIVATE CAR") ? 1 : 0;

    // The "Missing Seating and CC" check is left to usp_GetPremiumRateMotor, which first
    // overrides CC for TRAILER / MOTOR TRADE and only then validates seating and CC.

    console.log("[Premium API] Calling stored procedure with:", {
      country, issueDate, blnCompCover, vehicleStatus, vehicleClass, vehicleType,
      age, seating, cc, feet, excess, sumInsured, mgw, isPrivateCar
    });

    const spRequest = db.request()
      .input("StrCountry", sql.NVarChar(50), country)
      .input("IssDate", sql.Date, issueDate)
      .input("BlnCompCover", sql.Bit, blnCompCover)
      .input("Vstatus", sql.NVarChar(20), vehicleStatus)
      .input("VClass", sql.NVarChar(100), vehicleClass)
      .input("Type", sql.NVarChar(50), vehicleType)
      .input("VAge", sql.Decimal(10, 2), age)
      .input("TotSeat", sql.Int, seating)
      .input("CC", sql.Decimal(18, 2), cc)
      .input("Feet", sql.Int, feet)
      .input("Excess", sql.Decimal(18, 2), excess)
      .input("Sum", sql.Decimal(18, 2), sumInsured)
      .input("MGW", sql.Decimal(18, 2), mgw)
      .input("IsPrivateCar", sql.Bit, isPrivateCar)
      .output("Success", sql.Bit)
      .output("ErrorMsg", sql.NVarChar(500));

    const result = await spRequest.execute("usp_GetPremiumRateMotor");
    
    console.log("[Premium API] Stored procedure result:", {
      success: result.output.Success,
      errorMsg: result.output.ErrorMsg,
      recordsetLength: result.recordset?.length || 0
    });
    
    const success = result.output.Success;
    const errorMsg = result.output.ErrorMsg;
    
    if (!success) {
      let userFriendlyMsg = errorMsg || "Premium calculation failed";
      
      if (errorMsg?.includes("No-Records")) {
        if (errorMsg.includes("Missing Seating and CC")) {
          userFriendlyMsg = "Seating capacity or engine capacity (CC/kW) is required to calculate the premium.";
        } else if (errorMsg.includes("Configuration details")) {
          userFriendlyMsg = `No tariff configuration found for vehicle type "${vehicleClass}". Please contact system administrator.`;
        } else if (errorMsg.includes("rate for the above details")) {
          const details = [];
          if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClass.toUpperCase())) {
            details.push("GVW (Gross Vehicle Weight) must be entered and match a defined weight range");
          }
          if (/TANKER|TRAILER|TRACTOR/.test(vehicleClass.toUpperCase())) {
            details.push("Trailer Feet must be entered and match a defined range");
          }
          details.push(`Vehicle age (${age} years) must fall within a defined age range`);
          details.push(`Engine capacity (${cc}cc) must fall within a defined range`);
          details.push(`Sum insured (${sumInsured}) must fall within a defined range`);
          
          userFriendlyMsg = `No matching tariff rate found for the entered details. Please verify: ${details.join("; ")}. If all details are correct, contact HO.`;
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        errorMsg: userFriendlyMsg 
      });
    }
    
    const recordset = result.recordset;
    if (!recordset || recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        errorMsg: "No premium data returned from stored procedure" 
      });
    }
    
    const row = recordset[0];
    const rate = parseFloat(row.Rate || 0);
    const minPremium = parseFloat(row.MinPremium || 0);
    const loadingPer = parseFloat(row.LoadingPer || 0);
    const tpPremium = parseFloat(row.TPPremium || 0);
    const mgwRate = parseFloat(row.MGW || 0);
    const excessOut = parseFloat(row.Excess || 0);
    const youngExcess = parseFloat(row.Youngexcess || 0);
    const tpfExcess = parseFloat(row.TPFExcess || 0);
    const basicRate = parseFloat(row.BasicRate || 0);
    const basicAmt = parseFloat(row.BasicAmt || 0);
    const addCharge = parseFloat(row.AddCharge || 0);
    const fixPremium = parseFloat(row.FixPremium || 0);
    const isMinPremiumApplied = row.IsMinPremiumApplied === 1 || row.IsMinPremiumApplied === true;
    const isGoodsVehicle = row.IsGoodsVehicle === 1 || row.IsGoodsVehicle === true;
    
    const totalPremium = basicAmt;
    
    return NextResponse.json({
      success: true,
      rate,
      minPremium,
      loadingPer,
      tpPremium,
      mgwRate,
      excess: excessOut,
      youngExcess,
      tpfExcess,
      basicRate,
      basicAmt,
      addCharge,
      fixPremium,
      isMinPremiumApplied,
      isGoodsVehicle,
      totalPremium
    });
    
  } catch (error) {
    console.error("Premium calculation failed", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      success: false, 
      errorMsg: `Internal server error: ${errorMessage}` 
    }, { status: 500 });
  }
}