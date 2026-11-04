import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db/config.js";

describe("GET /authors", () => {
    test("devuelve lista de usuarios", async () => {
        const response = await request(app).get("/authors");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

describe("POST /authors", () => {
    test("crea usuario con datos válidos", async () => {
        const response = await request(app)
            .post("/authors")
            .send({ name: "María López", email: "maria@example.com", age: 25 });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe("María López");
        expect(response.body.email).toBe("maria@example.com");
    });

    test("rechaza request sin nombre", async () => {
        const response = await request(app).post("/authors").send({ email: "test@example.com" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toContain("requerido");
    });

    test("rechaza email con formato inválido", async () => {
        const response = await request(app)
            .post("/users")
            .send({ name: "Juan", email: "no-es-un-email" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("inválido");
    });

    test("rechaza request vacío", async () => {
        const response = await request(app).post("/authors").send({});

        expect(response.statusCode).toBe(400);
    });

    test("rechaza edad que no es número", async () => {
        const response = await request(app)
            .post("/users")
            .send({ name: "Pedro", email: "pedro@test.com", age: "veinte" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("número");
    });
});

beforeEach(async () => {
    await pool.query("TRUNCATE authors RESTART IDENTITY CASCADE");
    await pool.query(`
    INSERT INTO authors (name, email, bio) VALUES
    ('Ana García',  'ana@example.com',    'Full-stack dev'),
    ('Carlos Ruiz', 'carlos@example.com', 'Escritor técnico')
`);
});


afterAll(async () => {
    await pool.end();
});

describe("GET /api/authors", () => {
    test("devuelve los autores sembrados", async () => {
        const response = await request(app).get("/authors");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty("name");
    });
});
