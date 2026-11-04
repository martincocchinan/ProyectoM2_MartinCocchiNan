import pool from "../db/config.js";
import { getAllPostsService } from "../services/postsService.js";
import { badRequest, notFound, internalError } from "../utils/errors.js";
import {
  validarId,
  validarTitulo,
  validarContenido,
  validarSiExiste,
  validarAlMenosUnCampo,
} from "../utils/validators.js";

const errorPublished = (published) =>
  published !== undefined && typeof published !== "boolean"
    ? "published debe ser true o false"
    : null;

export const getAllPosts = async (req, res, next) => {
  const posts = await getAllPostsService().catch((error) => ({ error }));

  if (posts.error) {
    console.error("Error obteniendo publicaciones:", posts.error);
    return next(internalError("Error obteniendo publicaciones"));
  }

  return res.status(200).json(posts);
};

export const getPostById = async (req, res, next) => {
  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const result = await pool
    .query("SELECT * FROM posts WHERE id = $1", [req.params.id])
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error obteniendo publicación:", result.error);
    return next(internalError("Error obteniendo publicación"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Publicación no encontrada"));
  }

  return res.status(200).json(result.rows[0]);
};

export const getPostByAuthor = async (req, res, next) => {
  const errorId = validarId(req.params.authorId);
  if (errorId) return next(badRequest(errorId));

  const result = await pool
    .query("SELECT * FROM posts WHERE author_id = $1 ORDER BY id", [
      req.params.authorId,
    ])
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error obteniendo publicaciones del autor:", result.error);
    return next(internalError("Error obteniendo publicaciones del autor"));
  }

  return res.status(200).json(result.rows);
};

export const createPost = async (req, res, next) => {
  const { title, content, author_id, published } = req.body ?? {};

  const errorTitulo = validarTitulo(title);
  if (errorTitulo) return next(badRequest(errorTitulo));

  const errorContenido = validarContenido(content);
  if (errorContenido) return next(badRequest(errorContenido));

  const errorAutor = validarId(author_id);
  if (errorAutor) return next(badRequest(`author_id: ${errorAutor}`));

  const errorPub = errorPublished(published);
  if (errorPub) return next(badRequest(errorPub));

  const result = await pool
    .query(
      `INSERT INTO posts (title, content, author_id, published)
      VALUES ($1, $2, $3, COALESCE($4, FALSE))
       RETURNING *`,
      [title.trim(), content.trim(), author_id, published],
    )
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error creando publicación:", result.error);

    if (result.error.code === "23503") {
      return next(badRequest("El autor indicado no existe"));
    }

    return next(internalError("Error creando publicación"));
  }

  return res.status(201).json(result.rows[0]);
};

export const updatePost = async (req, res, next) => {
  const body = req.body ?? {};
  const { title, content, author_id, published } = body;

  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const errorCampos = validarAlMenosUnCampo(body, [
    "title",
    "content",
    "author_id",
    "published",
  ]);
  if (errorCampos) return next(badRequest(errorCampos));

  const errorTitulo = validarSiExiste(title, validarTitulo);
  if (errorTitulo) return next(badRequest(errorTitulo));

  const errorContenido = validarSiExiste(content, validarContenido);
  if (errorContenido) return next(badRequest(errorContenido));

  const errorAutor = validarSiExiste(author_id, validarId);
  if (errorAutor) return next(badRequest(`author_id: ${errorAutor}`));

  const errorPub = errorPublished(published);
  if (errorPub) return next(badRequest(errorPub));

  const result = await pool
    .query(
      `UPDATE posts
        SET title     = COALESCE($1, title),
            content   = COALESCE($2, content),
            author_id = COALESCE($3, author_id),
            published = COALESCE($4, published)
        WHERE id = $5
       RETURNING *`,
      [title?.trim(), content?.trim(), author_id, published, req.params.id],
    )
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error actualizando publicación:", result.error);

    if (result.error.code === "23503") {
      return next(badRequest("El autor indicado no existe"));
    }

    return next(internalError("Error actualizando publicación"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Publicación no encontrada"));
  }

  return res.status(200).json(result.rows[0]);
};

export const deletePost = async (req, res, next) => {
  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const result = await pool
    .query("DELETE FROM posts WHERE id = $1 RETURNING id", [req.params.id])
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error eliminando publicación:", result.error);
    return next(internalError("Error eliminando publicación"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Publicación no encontrada"));
  }

  return res.status(204).send();
};

