//BASE

export function validarEmail(email) {
    if (email === undefined || email === null || email === "") {
        return "El email es requerido";
    }

    if (typeof email !== "string") {
        return "El email debe ser un texto";
    }

    const emailLimpio = email.trim();

    if (emailLimpio.length > 150) {
        return "El email no puede superar los 150 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailLimpio)) {
        return "El formato del email es inválido";
    }

    return null;
}

export function validarNombre(nombre) {
    if (nombre === undefined || nombre === null) {
        return "El nombre es requerido";
    }

    if (typeof nombre !== "string") {
        return "El nombre debe ser un texto";
    }

    if (nombre.trim().length === 0) {
        return "El nombre no puede estar vacío";
    }

    if (nombre.trim().length < 2 || nombre.trim().length > 100) {
        return "El nombre debe tener entre 2 y 100 caracteres";
    }

    return null;
}

export function validarId(id) {
    if (id === undefined || id === null || String(id).trim() === "") {
        return "El id es requerido";
    }

    const numero = Number(id);

    if (Number.isNaN(numero)) {
        return "El id debe ser un número";
    }

    if (!Number.isInteger(numero)) {
        return "El id debe ser un número entero";
    }

    if (numero < 1) {
        return "El id debe ser un número positivo";
    }

    return null;
}

//POSTS

export function validarTitulo(titulo) {
    if (titulo === undefined || titulo === null) {
        return "El título es requerido";
    }

    if (typeof titulo !== "string") {
        return "El título debe ser un texto";
    }

    if (titulo.trim().length === 0) {
        return "El título no puede estar vacío";
    }

    if (titulo.trim().length < 3 || titulo.trim().length > 200) {
        return "El título debe tener entre 3 y 200 caracteres";
    }

    return null;
}

export function validarContenido(contenido) {
    if (contenido === undefined || contenido === null) {
        return "El contenido es requerido";
    }

    if (typeof contenido !== "string") {
        return "El contenido debe ser un texto";
    }

    if (contenido.trim().length === 0) {
        return "El contenido no puede estar vacío";
    }

    return null;
}


// AUTHORS

export function validarBio(bio) {
    if (bio === undefined || bio === null) {
        return null;
    }

    if (typeof bio !== "string") {
        return "La biografía debe ser un texto";
    }

    if (bio.trim().length > 500) {
        return "La biografía no puede superar los 500 caracteres";
    }

    return null;
}

// HELPER PARA ACTUALIZACION PARCIAL 

export function validarSiExiste(valor, validador) {
    if (valor === undefined) {
        return null;
    }

    return validador(valor);
}

export function validarAlMenosUnCampo(body, campos) {
    const hayCampo =
        body &&
        typeof body === "object" &&
        campos.some((campo) => body[campo] !== undefined);

    if (!hayCampo) {
        return `Se requiere al menos uno de los campos: ${campos.join(", ")}`;
    }

    return null;
}