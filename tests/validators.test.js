import { describe, test, expect, vi } from "vitest";
import {
    validarEmail,
    validarNombre,
    validarId,
    validarTitulo,
    validarContenido,
    validarBio,
    validarSiExiste,
    validarAlMenosUnCampo,
} from "../src/utils/validators.js";

// ───────────────────────── BASE ─────────────────────────

describe("validarEmail", () => {
    test("acepta email valido", () => {
        expect(validarEmail("test@example.com")).toBe(null);
    });

    test("acepta email con espacios alrededor (se hace trim)", () => {
        expect(validarEmail("  test@example.com  ")).toBe(null);
    });

    test("rechaza email sin @", () => {
        expect(validarEmail("testexample.com")).toContain("inválido");
    });

    test("rechaza email vacío", () => {
        expect(validarEmail("")).toContain("requerido");
    });

    test("rechaza email null", () => {
        expect(validarEmail(null)).toContain("requerido");
    });

    test("rechaza email undefined", () => {
        expect(validarEmail(undefined)).toContain("requerido");
    });

    test("rechaza email que no es string", () => {
        expect(validarEmail(123)).toContain("texto");
    });

    test("rechaza email sin dominio", () => {
        expect(validarEmail("test@")).toContain("inválido");
    });

    test("rechaza email sin extensión (TLD)", () => {
        expect(validarEmail("test@example")).toContain("inválido");
    });

    test("rechaza email sin parte local", () => {
        expect(validarEmail("@example.com")).toContain("inválido");
    });

    test("rechaza email con espacios internos", () => {
        expect(validarEmail("te st@example.com")).toContain("inválido");
    });

    test("rechaza email con más de un @", () => {
        expect(validarEmail("a@b@example.com")).toContain("inválido");
    });

    test("rechaza email que contiene solo espacios", () => {
        expect(validarEmail("   ")).toContain("inválido");
    });

    test("acepta email de exactamente 150 caracteres", () => {
        const email = "a".repeat(138) + "@example.com"; // 138 + 12 = 150
        expect(email.length).toBe(150);
        expect(validarEmail(email)).toBe(null);
    });

    test("rechaza email de 151 caracteres", () => {
        const email = "a".repeat(139) + "@example.com"; // 151
        expect(email.length).toBe(151);
        expect(validarEmail(email)).toContain("150 caracteres");
    });

    test("el límite de 150 se mide después del trim", () => {
        const email = " " + "a".repeat(138) + "@example.com" + " ";
        expect(validarEmail(email)).toBe(null);
    });
});

describe("validarNombre", () => {
    test("acepta nombre válido", () => {
        expect(validarNombre("Juan Pérez")).toBe(null);
    });

    test("rechaza nombre undefined", () => {
        expect(validarNombre(undefined)).toContain("requerido");
    });

    test("rechaza nombre null", () => {
        expect(validarNombre(null)).toContain("requerido");
    });

    test("rechaza nombre vacío", () => {
        expect(validarNombre("")).toContain("vacío");
    });

    test("rechaza nombre solo espacios", () => {
        expect(validarNombre("   ")).toContain("vacío");
    });

    test("rechaza nombre de 1 carácter", () => {
        expect(validarNombre("J")).toContain("entre 2 y 100");
    });

    test("rechaza nombre que no es string", () => {
        expect(validarNombre(123)).toContain("texto");
    });

    test("acepta nombre de exactamente 2 caracteres", () => {
        expect(validarNombre("Jo")).toBe(null);
    });

    test("acepta nombre de exactamente 100 caracteres", () => {
        expect(validarNombre("a".repeat(100))).toBe(null);
    });

    test("rechaza nombre de 101 caracteres", () => {
        expect(validarNombre("a".repeat(101))).toContain("entre 2 y 100");
    });

    test("rechaza nombre de 1 carácter con espacios alrededor (trim)", () => {
        expect(validarNombre(" J ")).toContain("entre 2 y 100");
    });

    test("acepta nombre de 2 caracteres con espacios alrededor (trim)", () => {
        expect(validarNombre(" Jo ")).toBe(null);
    });
});

describe("validarId", () => {
    test("acepta id numérico válido", () => {
        expect(validarId(7)).toBe(null);
    });

    test("acepta id válido como string (viene de req.params)", () => {
        expect(validarId("7")).toBe(null);
    });

    test("rechaza id undefined", () => {
        expect(validarId(undefined)).toBe("El id es requerido");
    });

    test("rechaza id null", () => {
        expect(validarId(null)).toBe("El id es requerido");
    });

    test("rechaza id string vacío", () => {
        expect(validarId("")).toBe("El id es requerido");
    });

    test("rechaza id solo espacios", () => {
        expect(validarId("   ")).toBe("El id es requerido");
    });

    test("rechaza id que no es número", () => {
        expect(validarId("abc")).toBe("El id debe ser un número");
    });

    test("rechaza id NaN", () => {
        expect(validarId(NaN)).toBe("El id debe ser un número");
    });

    test("rechaza id decimal", () => {
        expect(validarId(1.5)).toBe("El id debe ser un número entero");
    });

    test("rechaza id decimal como string", () => {
        expect(validarId("1.5")).toBe("El id debe ser un número entero");
    });

    test("rechaza id cero", () => {
        expect(validarId(0)).toBe("El id debe ser un número positivo");
    });

    test("rechaza id negativo", () => {
        expect(validarId(-3)).toBe("El id debe ser un número positivo");
    });

    test("acepta el id mínimo (1)", () => {
        expect(validarId(1)).toBe(null);
    });

});

// ───────────────────────── POSTS ─────────────────────────

describe("validarTitulo", () => {
    test("acepta título válido", () => {
        expect(validarTitulo("Mi primer post")).toBe(null);
    });

    test("rechaza título undefined", () => {
        expect(validarTitulo(undefined)).toContain("requerido");
    });

    test("rechaza título null", () => {
        expect(validarTitulo(null)).toContain("requerido");
    });

    test("rechaza título que no es string", () => {
        expect(validarTitulo(123)).toContain("texto");
    });

    test("rechaza título vacío", () => {
        expect(validarTitulo("")).toContain("vacío");
    });

    test("rechaza título solo espacios", () => {
        expect(validarTitulo("   ")).toContain("vacío");
    });

    test("rechaza título de 2 caracteres", () => {
        expect(validarTitulo("ab")).toContain("entre 3 y 200");
    });

    test("acepta título de exactamente 3 caracteres", () => {
        expect(validarTitulo("abc")).toBe(null);
    });

    test("acepta título de exactamente 200 caracteres", () => {
        expect(validarTitulo("a".repeat(200))).toBe(null);
    });

    test("rechaza título de 201 caracteres", () => {
        expect(validarTitulo("a".repeat(201))).toContain("entre 3 y 200");
    });

    test("rechaza título de 2 caracteres con espacios alrededor (trim)", () => {
        expect(validarTitulo(" ab ")).toContain("entre 3 y 200");
    });
});

describe("validarContenido", () => {
    test("acepta contenido válido", () => {
        expect(validarContenido("Texto del post")).toBe(null);
    });

    test("rechaza contenido undefined", () => {
        expect(validarContenido(undefined)).toContain("requerido");
    });

    test("rechaza contenido null", () => {
        expect(validarContenido(null)).toContain("requerido");
    });

    test("rechaza contenido que no es string", () => {
        expect(validarContenido(123)).toContain("texto");
    });

    test("rechaza contenido vacío", () => {
        expect(validarContenido("")).toContain("vacío");
    });

    test("rechaza contenido solo espacios", () => {
        expect(validarContenido("   ")).toContain("vacío");
    });

    test("acepta contenido de 1 carácter (no hay mínimo)", () => {
        expect(validarContenido("a")).toBe(null);
    });

    test("acepta contenido muy largo (no hay máximo)", () => {
        expect(validarContenido("a".repeat(10000))).toBe(null);
    });
});

// ───────────────────────── AUTHORS ─────────────────────────

describe("validarBio", () => {
    test("acepta bio válida", () => {
        expect(validarBio("Full-stack dev")).toBe(null);
    });

    test("acepta bio undefined (es opcional)", () => {
        expect(validarBio(undefined)).toBe(null);
    });

    test("acepta bio null (es opcional)", () => {
        expect(validarBio(null)).toBe(null);
    });

    test("acepta bio string vacío", () => {
        expect(validarBio("")).toBe(null);
    });

    test("rechaza bio que no es string", () => {
        expect(validarBio(123)).toContain("texto");
    });

    test("acepta bio de exactamente 500 caracteres", () => {
        expect(validarBio("a".repeat(500))).toBe(null);
    });

    test("rechaza bio de 501 caracteres", () => {
        expect(validarBio("a".repeat(501))).toContain("500 caracteres");
    });

    test("el límite de 500 se mide después del trim", () => {
        expect(validarBio(" " + "a".repeat(500) + " ")).toBe(null);
    });
});

// ───────────── HELPERS PARA ACTUALIZACIÓN PARCIAL ─────────────

describe("validarSiExiste", () => {
    test("devuelve null y NO llama al validador si el valor es undefined", () => {
        const validador = vi.fn();

        expect(validarSiExiste(undefined, validador)).toBe(null);
        expect(validador).not.toHaveBeenCalled();
    });

    test("llama al validador con el valor cuando existe", () => {
        const validador = vi.fn().mockReturnValue(null);

        validarSiExiste("hola", validador);

        expect(validador).toHaveBeenCalledTimes(1);
        expect(validador).toHaveBeenCalledWith("hola");
    });

    test("devuelve el error del validador", () => {
        const validador = vi.fn().mockReturnValue("fallo");

        expect(validarSiExiste("hola", validador)).toBe("fallo");
    });

    test("devuelve null si el validador devuelve null", () => {
        const validador = vi.fn().mockReturnValue(null);

        expect(validarSiExiste("hola", validador)).toBe(null);
    });

    test("null NO se trata como ausente: se delega al validador", () => {
        const validador = vi.fn().mockReturnValue("fallo");

        expect(validarSiExiste(null, validador)).toBe("fallo");
        expect(validador).toHaveBeenCalledWith(null);
    });

    test("string vacío NO se trata como ausente: se delega al validador", () => {
        const validador = vi.fn().mockReturnValue(null);

        validarSiExiste("", validador);

        expect(validador).toHaveBeenCalledWith("");
    });

    test("funciona con validadores reales", () => {
        expect(validarSiExiste(undefined, validarNombre)).toBe(null);
        expect(validarSiExiste("J", validarNombre)).toContain("entre 2 y 100");
        expect(validarSiExiste("Juan", validarNombre)).toBe(null);
    });
});

describe("validarAlMenosUnCampo", () => {
    const campos = ["name", "email", "bio"];

    test("acepta body con un solo campo permitido", () => {
        expect(validarAlMenosUnCampo({ name: "Ana" }, campos)).toBe(null);
    });

    test("acepta body con todos los campos", () => {
        const body = { name: "Ana", email: "a@b.com", bio: "hola" };
        expect(validarAlMenosUnCampo(body, campos)).toBe(null);
    });

    test("acepta body con un campo permitido más otros desconocidos", () => {
        expect(validarAlMenosUnCampo({ email: "a@b.com", otro: 1 }, campos)).toBe(null);
    });

    test("un campo con valor null cuenta como presente", () => {
        expect(validarAlMenosUnCampo({ bio: null }, campos)).toBe(null);
    });

    test("un campo con string vacío cuenta como presente", () => {
        expect(validarAlMenosUnCampo({ name: "" }, campos)).toBe(null);
    });

    test("rechaza body vacío", () => {
        expect(validarAlMenosUnCampo({}, campos)).toContain("al menos uno");
    });

    test("rechaza body con solo campos no permitidos", () => {
        expect(validarAlMenosUnCampo({ otro: 1, extra: 2 }, campos)).toContain("al menos uno");
    });

    test("rechaza body con campos permitidos en undefined", () => {
        expect(validarAlMenosUnCampo({ name: undefined }, campos)).toContain("al menos uno");
    });

    test("rechaza body null", () => {
        expect(validarAlMenosUnCampo(null, campos)).toContain("al menos uno");
    });

    test("rechaza body undefined", () => {
        expect(validarAlMenosUnCampo(undefined, campos)).toContain("al menos uno");
    });

    test("rechaza body que no es objeto", () => {
        expect(validarAlMenosUnCampo("name", campos)).toContain("al menos uno");
        expect(validarAlMenosUnCampo(42, campos)).toContain("al menos uno");
    });

    test("rechaza lista de campos vacía", () => {
        expect(validarAlMenosUnCampo({ name: "Ana" }, [])).toContain("al menos uno");
    });

    test("el mensaje de error lista los campos requeridos", () => {
        expect(validarAlMenosUnCampo({}, campos)).toBe(
            "Se requiere al menos uno de los campos: name, email, bio",
        );
    });
});