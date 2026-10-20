import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { Prisma } from "@prisma/client";
import { AppError, errorHandler } from "../src/middleware/error.middleware.js";

const UUIDV4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("Middleware Global de Manejo de Errores (Tarea 2.4)", () => {
  const setupAppWithRoutes = () => {
    const app = express();
    app.use(express.json());

    // Rutas que provocan diferentes tipos de error
    app.get("/operational-bad-request", () => {
      throw AppError.badRequest("Parámetros de consulta incorrectos", [{ field: "code", message: "Requerido" }]);
    });

    app.get("/operational-unauthorized", () => {
      throw AppError.unauthorized("Credenciales expiradas");
    });

    app.get("/operational-conflict", () => {
      throw AppError.conflict("La categoría ya existe");
    });

    app.get("/prisma-p2003", () => {
      throw new Prisma.PrismaClientKnownRequestError("Foreign key violation", {
        code: "P2003",
        clientVersion: "6.19.3",
      });
    });

    app.get("/unhandled-crash", () => {
      throw new Error("DB Crash: connection pool exhausted at postgresql://postgres:secret@db:5432");
    });

    app.use(errorHandler);
    return app;
  };

  it("devuelve mensaje estructurado y legible ante errores operativos AppError (400, 401, 409)", async () => {
    const app = setupAppWithRoutes();

    const badReq = await request(app).get("/operational-bad-request");
    expect(badReq.status).toBe(400);
    expect(badReq.body.error).toBe("Parámetros de consulta incorrectos");
    expect(badReq.body.details).toEqual([{ field: "code", message: "Requerido" }]);

    const unauth = await request(app).get("/operational-unauthorized");
    expect(unauth.status).toBe(401);
    expect(unauth.body.error).toBe("Credenciales expiradas");

    const conflict = await request(app).get("/operational-conflict");
    expect(conflict.status).toBe(409);
    expect(conflict.body.error).toBe("La categoría ya existe");
  });

  it("mapea errores relacionales de Prisma (P2003) a 409 Conflict sin exponer detalles internos", async () => {
    const app = setupAppWithRoutes();

    const res = await request(app).get("/prisma-p2003");
    expect(res.status).toBe(409);
    expect(res.body.error).toContain("restricciones de integridad referencial");
  });

  it("ante un colapso no controlado (throw new Error), devuelve estrictamente 500 con UUID opaco y sin stack trace", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const app = setupAppWithRoutes();

    const res = await request(app).get("/unhandled-crash");

    // 1. Debe ser 500
    expect(res.status).toBe(500);

    // 2. Debe contener única y exclusivamente mensaje genérico y referencia UUID
    expect(res.body.error).toBe("Error interno del servidor");
    expect(res.body.referencia).toBeDefined();
    expect(res.body.referencia).toMatch(UUIDV4_REGEX);

    // 3. NO debe haber rastro del stack trace ni de strings confidenciales
    expect(res.body.stack).toBeUndefined();
    expect(res.text).not.toContain("DB Crash");
    expect(res.text).not.toContain("secret@db:5432");
    expect(res.text).not.toContain("connection pool exhausted");

    // 4. Debe haberse registrado internamente en logger/consola
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
