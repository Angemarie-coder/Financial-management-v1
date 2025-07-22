module.exports = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "Ange1",
  database: process.env.DB_NAME || "fmp",
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: ["src/entity/**/*.ts"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
}; 