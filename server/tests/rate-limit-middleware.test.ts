import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import {
  authRateLimiter,
  uploadRateLimiter,
  UPLOAD_RATE_LIMIT_MAX,
} from "../src/middleware/rate-limit.middleware.js";

describe("Middleware de Rate Limiting con Topología trust proxy (Tarea 2.5 & Fase 14 T-01)", () => {
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

  it("permite hasta 60 peticiones a la ruta de carga de imágenes y bloquea la 61va con 429 Too Many Requests", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.use("/api/uploads", uploadRateLimiter);
    app.post("/api/uploads", (_req, res) => {
      res.status(200).json({ uploaded: true });
    });

    expect(UPLOAD_RATE_LIMIT_MAX).toBe(60);

    // 60 peticiones permitidas para soportar carga masiva operativa
    for (let i = 1; i <= UPLOAD_RATE_LIMIT_MAX; i++) {
      const res = await request(app).post("/api/uploads");
      expect(res.status).toBe(200);
    }

    // La petición 61 debe ser bloqueada
    const blockedRes = await request(app).post("/api/uploads");
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error).toContain("Límite de subida de imágenes excedido");
  });
});
