import "server-only";

import sql from "mssql/msnodesqlv8";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function integerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) return fallback;

  const value = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return value;
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const rawValue = process.env[name]?.toLowerCase();

  if (!rawValue) return fallback;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;

  throw new Error(`${name} must be either true or false`);
}

function createConfig(): sql.config {
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const trustedConnection = !user && !password;

  return {
    driver: process.env.DB_DRIVER?.trim() || "ODBC Driver 18 for SQL Server",
    server: requiredEnv("DB_SERVER"),
    port: integerEnv("DB_PORT", 1433),
    database: process.env.DB_DATABASE?.trim() || requiredEnv("DB_NAME"),
    ...(trustedConnection ? {} : { user, password }),
    pool: {
      max: integerEnv("DB_POOL_MAX", 10),
      min: integerEnv("DB_POOL_MIN", 0),
      idleTimeoutMillis: integerEnv("DB_POOL_IDLE_TIMEOUT_MS", 30_000),
    },
    options: {
      trustedConnection,
      encrypt: booleanEnv("DB_ENCRYPT", false),
      trustServerCertificate: booleanEnv(
        "DB_TRUST_SERVER_CERTIFICATE",
        process.env.NODE_ENV !== "production",
      ),
    },
  };
}

declare global {
  // Reuse the pool when Next.js reloads modules during development.
  var sqlServerPoolPromise: Promise<sql.ConnectionPool> | undefined;
}

export function getDb(): Promise<sql.ConnectionPool> {
  if (!global.sqlServerPoolPromise) {
    const pool = new sql.ConnectionPool(createConfig());

    global.sqlServerPoolPromise = pool.connect().catch((error) => {
      global.sqlServerPoolPromise = undefined;
      throw error;
    });
  }

  return global.sqlServerPoolPromise;
}

export { sql };
