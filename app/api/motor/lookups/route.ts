import { NextResponse } from "next/server";
import { getDb, sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const vehicleType = searchParams.get("vehicleType") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const vehicleClass = searchParams.get("vehicleClass") || "";
    const make = searchParams.get("make") || "";
    
    // Get all vehicle types (Names) and their categories (VehicleType)
    const typesResult = await db.request().query("SELECT Name, VehicleType FROM dbo.VehicleType WHERE Active = 1 ORDER BY VehicleType, Name");
    const allNames = typesResult.recordset.map((row: { Name: string; VehicleType: string }) => row.Name);
    const allVehicleTypes = [...new Set(typesResult.recordset.map((row: { VehicleType: string }) => row.VehicleType))].filter(Boolean);
    
    let makes: string[] = [];
    let models: string[] = [];
    let vehicleTypes = allVehicleTypes;  // Categories: Commercial Vehicle, Private Car, Two Wheelers
    let vehicleClasses = allNames;        // Specific types: TANKER, TAXI CAR, etc.
    
    // Build a mapping of vehicle class names to their available fuel types
    // Fuel type is determined by checking which makes in each class have the fuel type in MotClassBVehList
    let classFuelTypesMap: Record<string, string[]> = {};
    try {
      // For each vehicle class (VehicleType.Name), get its makes, then get fuel types from MotClassBVehList
      const classNamesResult = await db.request().query("SELECT Name, VehicleType FROM dbo.VehicleType WHERE Active = 1 ORDER BY VehicleType, Name");
      for (const classRow of classNamesResult.recordset) {
        const className = classRow.Name;
        
        // Get makes for this class - VehicleMake.VehicleType stores the specific class Name (e.g., "PRIVATE CAR")
        const makesResult = await db.request()
          .input("className", className)
          .query("SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType = @className");
        const makes = makesResult.recordset.map((r: { Name: string }) => r.Name);
        
        if (makes.length > 0) {
          // Get fuel types for these makes from MotClassBVehList
          const placeholders = makes.map((_, i) => `@make${i}`).join(",");
          const request = db.request();
          makes.forEach((make, i) => request.input(`make${i}`, make));
          
          const fuelResult = await request.query(`
            SELECT DISTINCT FuelType 
            FROM MotClassBVehList 
            WHERE Make IN (${placeholders}) 
              AND FuelType IS NOT NULL
          `);
          const fuelTypes = fuelResult.recordset
            .map((r: { FuelType: string }) => r.FuelType)
            .filter(Boolean);
          
          if (fuelTypes.length > 0) {
            classFuelTypesMap[className] = fuelTypes;
          }
        }
      }
    } catch (err) {
      console.error("Failed to build class-fuel-type map:", err);
    }
    
    // If vehicleType (category like "Commercial Vehicle") and fuelType are provided,
    // filter vehicleClasses to only show Names for that VehicleType AND FuelType
    if (vehicleType && fuelType) {
      // Get all names for this vehicle type category
      const typeNamesResult = await db.request()
        .input("vehicleTypeCode", vehicleType)
        .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleTypeCode AND Active = 1 ORDER BY Name");
      const typeNames = typeNamesResult.recordset.map((r: { Name: string }) => r.Name);
      
      // Filter by fuel type: only show classes that have at least one make with the selected fuel type
      // Use case-insensitive comparison for fuel types
      const fuelTypeLower = fuelType.toLowerCase();
      if (Object.keys(classFuelTypesMap).length > 0) {
        vehicleClasses = typeNames.filter(name => {
          const availableFuelTypes = classFuelTypesMap[name] || [];
          // Show class if it has the selected fuel type available (case-insensitive)
          return availableFuelTypes.some(ft => ft.toLowerCase() === fuelTypeLower);
        });
      } else {
        // If no fuel type mapping available, return empty
        vehicleClasses = [];
      }
    }
    
    // If vehicleClass (specific type like "TANKER") is provided, get makes for its VehicleType and FuelType
    if (vehicleClass) {
      // First find the VehicleType category for this Name
      const classResult = await db.request()
        .input("vehicleClassName", vehicleClass)
        .query("SELECT VehicleType FROM dbo.VehicleType WHERE Name = @vehicleClassName AND Active = 1");
      const vehicleTypeCode = classResult.recordset[0]?.VehicleType;
      
      // Get the fuel types available for this class
      const availableFuelTypes = classFuelTypesMap[vehicleClass] || [];
      // Use the selected fuelType if available, otherwise use first available (case-insensitive)
      const fuelTypeLower = fuelType.toLowerCase();
      const effectiveFuelType = availableFuelTypes.find(ft => ft.toLowerCase() === fuelTypeLower) 
        ? fuelType 
        : (availableFuelTypes[0] || fuelType);
      
      if (vehicleTypeCode) {
        // Get all names in this vehicle type category
        const typeNamesResult = await db.request()
          .input("vehicleTypeCode", vehicleTypeCode)
          .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleTypeCode AND Active = 1 ORDER BY Name");
        const typeNames = typeNamesResult.recordset.map((r: { Name: string }) => r.Name);
        
        // Filter by fuel type - only classes that have the effective fuel type
        const effectiveFuelTypeLower = effectiveFuelType.toLowerCase();
        const filteredTypeNames = Object.keys(classFuelTypesMap).length > 0
          ? typeNames.filter(name => {
              const mappedFuelTypes = classFuelTypesMap[name] || [];
              return mappedFuelTypes.some(ft => ft.toLowerCase() === effectiveFuelTypeLower);
            })
          : [];
        
        if (filteredTypeNames.length > 0) {
          const request = db.request();
          filteredTypeNames.forEach((name, i) => {
            request.input(`type${i}`, sql.NVarChar, name);
          });
          const placeholders = filteredTypeNames.map((_, i) => `@type${i}`).join(",");
          const makesResult = await request.query(
            `SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType IN (${placeholders}) ORDER BY Name`
          );
          makes = makesResult.recordset.map((r: { Name: string }) => r.Name);
        }
      }
    } else if (vehicleType && fuelType) {
      // Get makes for vehicle type category AND fuel type
      const typeNamesResult = await db.request()
        .input("vehicleTypeCode", vehicleType)
        .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleTypeCode AND Active = 1 ORDER BY Name");
      const typeNames = typeNamesResult.recordset.map((r: { Name: string }) => r.Name);
      
      // Filter by fuel type - only classes that have the selected fuel type
      const fuelTypeLower = fuelType.toLowerCase();
      const filteredTypeNames = Object.keys(classFuelTypesMap).length > 0
        ? typeNames.filter(name => {
            const mappedFuelTypes = classFuelTypesMap[name] || [];
            return mappedFuelTypes.some(ft => ft.toLowerCase() === fuelTypeLower);
          })
        : [];
      
      if (filteredTypeNames.length > 0) {
        const request = db.request();
        filteredTypeNames.forEach((name, i) => {
          request.input(`type${i}`, sql.NVarChar, name);
        });
        const placeholders = filteredTypeNames.map((_, i) => `@type${i}`).join(",");
        const makesResult = await request.query(
          `SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType IN (${placeholders}) ORDER BY Name`
        );
        makes = makesResult.recordset.map((r: { Name: string }) => r.Name);
      }
    }
    
    if (make) {
      const modelsResult = await db.request()
        .input("make", make)
        .query("SELECT DISTINCT Model FROM dbo.VehicleModel WHERE Make = @make ORDER BY Model");
      models = modelsResult.recordset.map((r: { Model: string }) => r.Model);
    }
    
    return NextResponse.json({ vehicleTypes, vehicleClasses, makes, models });
  } catch (error) {
    console.error("Vehicle lookup failed", error);
    return NextResponse.json({ vehicleTypes: [], vehicleClasses: [], makes: [], models: [] }, { status: 200 });
  }
}