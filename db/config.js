import pg from "pg";

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.on("error", (error) => {
    console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

export default pool;