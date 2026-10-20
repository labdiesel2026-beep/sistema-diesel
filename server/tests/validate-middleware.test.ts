import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { z } from "zod";
import { validate } from "../src/middleware/validate.middleware.js";

describe("Middleware Genérico de Validación Fail-Fast (Zod) — Tarea 2.2", () => {
  const testSchema = z
    .object({
      name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
      price: z.number().int().nonnegative("El precio debe ser mayor o igual a 0"),
    })
    .strict();

  const uuidParamsSchema = z
    .object({
      id: z.string().uuid("Identificador UUID inválido"),
    })
    .strict();

  const querySchema = z
    .object({
      limit: z.coerce.number().int().positive("El límite debe ser positivo"),
    })
    .strict();

  it("permite el paso al siguiente middleware cuando el payload es estrictamente válido", async () => {
    const nextHandler = vi.fn((_req, res) => {
      res.status(200).json({ success: true });
    });

    const app = express();
    app.use(express.json());
    app.post("/test", validate(testSchema), nextHandler);

    const res = await request(app).post("/test").send({ name: "Inyector Bosch", price: 150000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(nextHandler).toHaveBeenCalledTimes(1);
  });

  it("retorna 400 Bad Request y no ejecuta el controlador si faltan campos obligatorios", async () => {
    const nextHandler = vi.fn((_req, res) => {
      res.status(200).json({ success: true });
    });

    const app = express();
    app.use(express.json());
    app.post("/test", validate(testSchema), nextHandler);

    const res = await request(app).post("/test").send({ price: 150000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos de validación inválidos");
    expect(res.body.details).toBeInstanceOf(Array);
    expect(res.body.details.some((d: any) => d.field === "name")).toBe(true);
    expect(nextHandler).not.toHaveBeenCalled();
  });

  it("retorna 400 Bad Request si se envían propiedades no declaradas en esquema .strict()", async () => {
    const nextHandler = vi.fn((_req, res) => {
      res.status(200).json({ success: true });
    });

    const app = express();
    app.use(express.json());
    app.post("/test", validate(testSchema), nextHandler);

    const res = await request(app).post("/test").send({
      name: "Inyector Bosch",
      price: 150000,
      maliciousField: "injection",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos de validación inválidos");
    expect(res.body.details.some((d: any) => d.field.includes("maliciousField"))).toBe(true);
    expect(nextHandler).not.toHaveBeenCalled();
  });

  it("valida simultáneamente params y body, rechazando params inválidos sin invocar controlador", async () => {
    const nextHandler = vi.fn((_req, res) => {
      res.status(200).json({ success: true });
    });

    const app = express();
    app.use(express.json());
    app.put("/test/:id", validate({ params: uuidParamsSchema, body: testSchema }), nextHandler);

    const res = await request(app)
      .put("/test/id-invalido-no-uuid")
      .send({ name: "Inyector Bosch", price: 150000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos de validación inválidos");
    expect(res.body.details.some((d: any) => d.field === "id")).toBe(true);
    expect(nextHandler).not.toHaveBeenCalled();
  });

  it("valida query params y rechaza queries inválidos", async () => {
    const nextHandler = vi.fn((_req, res) => {
      res.status(200).json({ success: true });
    });

    const app = express();
    app.get("/test", validate({ query: querySchema }), nextHandler);

    const res = await request(app).get("/test?limit=-5");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos de validación inválidos");
    expect(res.body.details.some((d: any) => d.field === "limit")).toBe(true);
    expect(nextHandler).not.toHaveBeenCalled();
  });
});
