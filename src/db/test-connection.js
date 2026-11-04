import "dotenv/config";
import pool from "./config.js";

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Hora del servidor:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Error conectando:", error.message);
  }
}

testConnection();