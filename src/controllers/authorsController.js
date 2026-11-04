import pool from "../db/config.js";
import { getAllAuthorsService } from "../services/authorsService.js";
import {
  badRequest,
  conflict,
  notFound,
  internalError,
} from "../utils/errors.js";
import {
  validarId,
  validarEmail,
  validarNombre,
  validarBio,
  validarSiExiste,
  validarAlMenosUnCampo,
} from "../utils/validators.js";

export const getAllAuthors = async (req, res, next) => {
  const authors = await getAllAuthorsService().catch((error) => ({ error }));

  if (authors.error) {
    console.error("Error obteniendo autores:", authors.error);
    return next(internalError("Error obteniendo autores"));
  }

  return res.status(200).json(authors);
};

export const getAuthorById = async (req, res, next) => {
  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const result = await pool
    .query("SELECT * FROM authors WHERE id = $1", [req.params.id])
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error obteniendo autor:", result.error);
    return next(internalError("Error obteniendo autor"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Autor no encontrado"));
  }

  return res.status(200).json(result.rows[0]);
};

export const createAuthor = async (req, res, next) => {
  const { name, email, bio } = req.body ?? {};

  const errorNombre = validarNombre(name);
  if (errorNombre) return next(badRequest(errorNombre));

  const errorEmail = validarEmail(email);
  if (errorEmail) return next(badRequest(errorEmail));

  const errorBio = validarSiExiste(bio, validarBio);
  if (errorBio) return next(badRequest(errorBio));

  const result = await pool
    .query(
      `INSERT INTO authors (name, email, bio)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), email.trim(), bio ?? null],
    )
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error creando autor:", result.error);

    if (result.error.code === "23505") {
      return next(conflict("El email ya está registrado"));
    }

    return next(internalError("Error creando autor"));
  }

  return res.status(201).json(result.rows[0]);
};

export const updateAuthor = async (req, res, next) => {
  const body = req.body ?? {};
  const { name, email, bio } = body;

  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const errorCampos = validarAlMenosUnCampo(body, ["name", "email", "bio"]);
  if (errorCampos) return next(badRequest(errorCampos));

  const errorNombre = validarSiExiste(name, validarNombre);
  if (errorNombre) return next(badRequest(errorNombre));

  const errorEmail = validarSiExiste(email, validarEmail);
  if (errorEmail) return next(badRequest(errorEmail));

  const errorBio = validarSiExiste(bio, validarBio);
  if (errorBio) return next(badRequest(errorBio));

  const result = await pool
    .query(
      `UPDATE authors
        SET name  = COALESCE($1, name),
            email = COALESCE($2, email),
            bio   = COALESCE($3, bio)
        WHERE id = $4
       RETURNING *`,
      [name?.trim(), email?.trim(), bio, req.params.id],
    )
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error actualizando autor:", result.error);

    if (result.error.code === "23505") {
      return next(conflict("El email ya está registrado"));
    }

    return next(internalError("Error actualizando autor"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Autor no encontrado"));
  }

  return res.status(200).json(result.rows[0]);
};

export const deleteAuthor = async (req, res, next) => {
  const errorId = validarId(req.params.id);
  if (errorId) return next(badRequest(errorId));

  const result = await pool
    .query("DELETE FROM authors WHERE id = $1 RETURNING id", [req.params.id])
    .catch((error) => ({ error }));

  if (result.error) {
    console.error("Error eliminando autor:", result.error);
    return next(internalError("Error eliminando autor"));
  }

  if (result.rows.length === 0) {
    return next(notFound("Autor no encontrado"));
  }

  return res.status(204).json({ message: "Autor eliminado" });
};

