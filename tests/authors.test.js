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

    test("devuelve autores con las propiedades esperadas", async () => {
    const response = await request(app).get("/authors");

    expect(response.statusCode).toBe(200);

    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.body[0]).toHaveProperty("email");
});
});

describe("POST /authors", () => {
    test("crea usuario con datos válidos", async () => {
    const response = await request(app)
        .post("/authors")
        .send({
            name: "Martin Lopez",
            email: "martin@example.com"
        });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Martin Lopez");
    expect(response.body.email).toBe("martin@example.com");

    const updatedAuthors = await request(app).get("/authors");

    const createdAuthor = updatedAuthors.body.find(
        author => author.id === response.body.id
    );

    expect(createdAuthor).toBeDefined();
    expect(createdAuthor.name).toBe("Martin Lopez");
    expect(createdAuthor.email).toBe("martin@example.com");
});

    test("rechaza email con formato inválido", async () => {
        const response = await request(app)
            .post("/authors")
            .send({ name: "Juan", email: "no-es-un-email" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("inválido");
    });

    test("rechaza autor sin email", async () => {
        const response = await request(app)
            .post("/authors")
            .send({ name: "Juan", email: "" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("requerido");
    });

    test("rechaza email repetido", async () => {
        const response = await request(app)
            .post("/authors")
            .send({ name: "Juan", email: "ana@example.com" });

        expect(response.statusCode).toBe(409);
        expect(response.body.error).toContain("registrado");
    });

    test("rechaza nombre vacio", async () => {
        const response = await request(app)
            .post("/authors")
            .send({ name: "", email: "juancito@example.com" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("vacío");
    });

    test("rechaza request vacío", async () => {
        const response = await request(app).post("/authors").send({});

        expect(response.statusCode).toBe(400);
    });

    

});

describe("PUT /authors/:id", () => {

    async function getAuthorId() {
    const response = await request(app).get("/authors");

    const author = response.body.find(
        author => author.email === "ana@example.com"
    );

    expect(author).toBeDefined();

    return author.id;
}

    test("modifica usuario con datos válidos", async () => {
    const authorId = await getAuthorId();

    const response = await request(app)
        .put(`/authors/${authorId}`)
        .send({
            name: "Martin Lopez",
            email: "martin@example.com"
        });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Martin Lopez");
    expect(response.body.email).toBe("martin@example.com");

    const updatedAuthors = await request(app).get("/authors");

    const updatedAuthor = updatedAuthors.body.find(
        author => author.id === authorId

        
    );
    expect(updatedAuthor).toBeDefined();
    expect(updatedAuthor.name).toBe("Martin Lopez");
    expect(updatedAuthor.email).toBe("martin@example.com");

});

    test("permite modificacion sin nombre (actualización parcial)", async () => {
        const authorId = await getAuthorId();

        const response = await request(app)
            .put(`/authors/${authorId}`)
            .send({ email: "test@example.com" });

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe("test@example.com");
        expect(response.body.name).toBe("Ana García");
    });

    test("rechaza modificar con un email ya existente", async () => {
    const authors = await request(app).get("/authors");
    const authorId = authors.body.find(
        author => author.email === "ana@example.com"
    ).id;

    const response = await request(app)
        .put(`/authors/${authorId}`)
        .send({
            name: "Ana García",
            email: "carlos@example.com"
        });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty("error");
});

    test("rechaza modificar con un ID inválido", async () => {
    const response = await request(app)
        .put("/authors/abc")
        .send({
            name: "Juan",
            email: "juan@example.com"
        });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
});

    test("rechaza email con formato inválido", async () => {
        const authorId = await getAuthorId();

        const response = await request(app)
            .put(`/authors/${authorId}`)
            .send({
                name: "Juan",
                email: "no-es-un-email"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("inválido");
    });

    test("rechaza request vacío", async () => {
        const authorId = await getAuthorId();

        const response = await request(app)
            .put(`/authors/${authorId}`)
            .send({});

        expect(response.statusCode).toBe(400);
    });

    test("rechaza modificar un autor inexistente", async () => {
        const response = await request(app)
            .put("/authors/99999")
            .send({
                name: "Juan",
                email: "juan@example.com"
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    


});

describe("DELETE /authors/:id", () => {

    test("elimina un autor existente", async () => {

        const authors = await request(app).get("/authors");
        const authorId = authors.body[0].id;

        const response = await request(app)
            .delete(`/authors/${authorId}`);

        expect(response.statusCode).toBe(204);

        const updatedAuthors = await request(app).get("/authors");

        expect(
            updatedAuthors.body.some(author => author.id === authorId)
        ).toBe(false);
    });

    test("rechaza eliminar un autor inexistente", async () => {

        const response = await request(app)
            .delete("/authors/99999");

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID inválido", async () => {

        const response = await request(app)
            .delete("/authors/abc");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID negativo", async () => {

        const response = await request(app)
            .delete("/authors/-1");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID 0", async () => {

        const response = await request(app)
            .delete("/authors/0");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
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