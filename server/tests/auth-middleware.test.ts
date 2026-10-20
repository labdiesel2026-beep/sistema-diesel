import { describe, it, expect } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";
import { requireAuth } from "../src/middleware/auth.middleware.js";
import { authService, type AuthTokenPayload } from "../src/services/auth.service.js";
import { ENV } from "../src/config/env.js";

describe("Middleware de Verificación de Sesión requireAuth (Tarea 3.2)", () => {
  const mockUser: AuthTokenPayload = {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  const setupApp = () => {
    const app = express();
    app.use(cookieParser());

    app.get("/api/protected", requireAuth, (req, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    });

    return app;
  };

  it("rechaza peticiones sin cookie de sesión respondiendo 401 Unauthorized", async () => {
    const app = setupApp();
    const res = await request(app).get("/api/protected");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Sesión no válida o expirada");
  });

  it("rechaza peticiones con cookie de sesión inválida o adulterada", async () => {
    const app = setupApp();
    const res = await request(app)
      .get("/api/protected")
      .set("Cookie", ["session=jwt_invalido_o_corrupto"]);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Sesión no válida o expirada");
  });

  it("rechaza peticiones con token expirado", async () => {
    const expiredToken = jwt.sign(mockUser, ENV.JWT_SECRET, {
      expiresIn: "-1s", // Expirado hace un segundo
      algorithm: "HS256",
    });

    const app = setupApp();
    const res = await request(app)
      .get("/api/protected")
      .set("Cookie", [`session=${expiredToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Sesión no válida o expirada");
  });

  it("autoriza peticiones con cookie válida e inyecta req.user", async () => {
    const validToken = authService.generateToken(mockUser);

    const app = setupApp();
    const res = await request(app)
      .get("/api/protected")
      .set("Cookie", [`session=${validToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual(mockUser);
  });
});
