import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { authRateLimiter, uploadRateLimiter } from "../src/middleware/rate-limit.middleware.js";

describe("Middleware de Rate Limiting con Topología trust proxy (Tarea 2.5)", () => {
  it("bloquea la 6ta petición a la ruta de autenticación respondiendo 429 Too Many Requests", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.use("/api/auth/login", authRateLimiter);
    app.post("/api/auth/login", (_req, res) => {
      res.status(200).json({ success: true });
    });

    // Realizar 5 peticiones consecutivas permitidas
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post("/api/auth/login");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }

    // La 6ta petición debe ser bloqueada por exceder el límite
    const blockedRes = await request(app).post("/api/auth/login");
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error).toContain("Demasiados intentos de autenticación");
  });

  it("bloquea la 11va petición a la ruta de carga de imágenes respondiendo 429 Too Many Requests", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.use("/api/uploads", uploadRateLimiter);
    app.post("/api/uploads", (_req, res) => {
      res.status(200).json({ uploaded: true });
    });

    // 10 peticiones permitidas
    for (let i = 1; i <= 10; i++) {
      const res = await request(app).post("/api/uploads");
      expect(res.status).toBe(200);
    }

    // La 11va petición debe ser bloqueada
    const blockedRes = await request(app).post("/api/uploads");
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error).toContain("Límite de subida de imágenes excedido");
  });
});
