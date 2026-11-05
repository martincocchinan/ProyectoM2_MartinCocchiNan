import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db/config.js";

describe("GET /posts", () => {
    test("devuelve lista de publicaciones", async () => {
        const response = await request(app).get("/posts");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("devuelve publicaciones con las propiedades esperadas", async () => {
        const response = await request(app).get("/posts");

        expect(response.statusCode).toBe(200);

        expect(response.body[0]).toHaveProperty("id");
        expect(response.body[0]).toHaveProperty("title");
        expect(response.body[0]).toHaveProperty("content");
    });
});

describe("POST /posts", () => {
    test("crea publicación con datos válidos", async () => {
        const response = await request(app)
            .post("/posts")
            .send({
                title: "Nuevo post",
                content: "Contenido del nuevo post",
                author_id: 1
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe("Nuevo post");
        expect(response.body.content).toBe("Contenido del nuevo post");
        expect(response.body.author_id).toBe(1);

        const updatedPosts = await request(app).get("/posts");

        const createdPost = updatedPosts.body.find(
            post => post.id === response.body.id
        );

        expect(createdPost).toBeDefined();
        expect(createdPost.title).toBe("Nuevo post");
        expect(createdPost.content).toBe("Contenido del nuevo post");
    });

    test("rechaza título vacío", async () => {
        const response = await request(app)
            .post("/posts")
            .send({ title: "", content: "Contenido", author_id: 1 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("vacío");
    });

    test("rechaza contenido vacío", async () => {
        const response = await request(app)
            .post("/posts")
            .send({ title: "Nuevo post", content: "", author_id: 1 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("vacío");
    });

    test("rechaza publicación sin author_id", async () => {
        const response = await request(app)
            .post("/posts")
            .send({ title: "Nuevo post", content: "Contenido" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("author_id");
    });

    test("rechaza autor inexistente", async () => {
        const response = await request(app)
            .post("/posts")
            .send({ title: "Nuevo post", content: "Contenido", author_id: 99999 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("existe");
    });

    test("rechaza request vacío", async () => {
        const response = await request(app).post("/posts").send({});

        expect(response.statusCode).toBe(400);
    });
});

describe("PUT /posts/:id", () => {
    async function getPostId() {
        const response = await request(app).get("/posts");

        const post = response.body.find(
            post => post.title === "Primer post"
        );

        expect(post).toBeDefined();

        return post.id;
    }

    test("modifica publicación con datos válidos", async () => {
        const postId = await getPostId();

        const response = await request(app)
            .put(`/posts/${postId}`)
            .send({
                title: "Título modificado",
                content: "Contenido modificado"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe("Título modificado");
        expect(response.body.content).toBe("Contenido modificado");

        const updatedPosts = await request(app).get("/posts");

        const updatedPost = updatedPosts.body.find(
            post => post.id === postId
        );

        expect(updatedPost).toBeDefined();
        expect(updatedPost.title).toBe("Título modificado");
        expect(updatedPost.content).toBe("Contenido modificado");
    });

    test("permite modificacion parcial (solo título)", async () => {
        const postId = await getPostId();

        const response = await request(app)
            .put(`/posts/${postId}`)
            .send({ title: "Solo título nuevo" });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Solo título nuevo");
        expect(response.body.content).toBe("Contenido del primer post");
    });

    test("rechaza modificar con un autor inexistente", async () => {
        const postId = await getPostId();

        const response = await request(app)
            .put(`/posts/${postId}`)
            .send({ author_id: 99999 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("existe");
    });

    test("rechaza modificar con un ID inválido", async () => {
        const response = await request(app)
            .put("/posts/abc")
            .send({
                title: "Título modificado",
                content: "Contenido modificado"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza título vacío", async () => {
        const postId = await getPostId();

        const response = await request(app)
            .put(`/posts/${postId}`)
            .send({ title: "" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("vacío");
    });

    test("rechaza request vacío", async () => {
        const postId = await getPostId();

        const response = await request(app)
            .put(`/posts/${postId}`)
            .send({});

        expect(response.statusCode).toBe(400);
    });

    test("rechaza modificar una publicación inexistente", async () => {
        const response = await request(app)
            .put("/posts/99999")
            .send({
                title: "Título modificado",
                content: "Contenido modificado"
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });
});

describe("DELETE /posts/:id", () => {
    test("elimina una publicación existente", async () => {
        const posts = await request(app).get("/posts");
        const postId = posts.body[0].id;

        const response = await request(app)
            .delete(`/posts/${postId}`);

        expect(response.statusCode).toBe(204);

        const updatedPosts = await request(app).get("/posts");

        expect(
            updatedPosts.body.some(post => post.id === postId)
        ).toBe(false);
    });

    test("rechaza eliminar una publicación inexistente", async () => {
        const response = await request(app)
            .delete("/posts/99999");

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID inválido", async () => {
        const response = await request(app)
            .delete("/posts/abc");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID negativo", async () => {
        const response = await request(app)
            .delete("/posts/-1");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("rechaza eliminar con un ID 0", async () => {
        const response = await request(app)
            .delete("/posts/0");

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error");
    });
});

beforeEach(async () => {
    await pool.query("TRUNCATE authors, posts RESTART IDENTITY CASCADE");
    await pool.query(`
        INSERT INTO authors (name, email, bio) VALUES
        ('Ana García',  'ana@example.com',    'Full-stack dev'),
        ('Carlos Ruiz', 'carlos@example.com', 'Escritor técnico')
    `);
    await pool.query(`
        INSERT INTO posts (title, content, author_id, published) VALUES
        ('Primer post',  'Contenido del primer post',  1, true),
        ('Segundo post', 'Contenido del segundo post', 2, false)
    `);
});

afterAll(async () => {
    await pool.end();
});