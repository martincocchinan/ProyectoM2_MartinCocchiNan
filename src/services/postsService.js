import pool from "../db/config.js";

export const getAllPostsService = async () => {
    const result = await pool.query(
        "SELECT * FROM posts ORDER BY author_id, created_at ASC"
    );
    return result.rows;
};