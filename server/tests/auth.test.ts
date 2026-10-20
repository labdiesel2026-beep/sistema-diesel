import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { ENV } from "../src/config/env.js";
import { resetDatabase, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "./helpers/reset-db.js";

describe("Suite de Integración: Módulo de Autenticación y Sesiones (server/tests/auth.test.ts) — Tarea 3.5", () => {
  beforeEach(async () => {
    // Aislamiento total: truncado y resiembra del administrador antes de cada prueba (Plan §6.1)
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. Login de Administrador (POST /api/auth/login)", () => {
    it("intento de login con credenciales erróneas -> Retorna 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: TEST_ADMIN_EMAIL,
          password: "password_totalmente_incorrecto",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Credenciales inválidas");
      expect(res.headers["set-cookie"]).toBeUndefined();
    });

    it("login con credenciales válidas -> Retorna 200 OK y emite cookie con atributos HttpOnly; SameSite=Strict", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(TEST_ADMIN_EMAIL);
      expect(res.body.user.role).toBe("admin");
      expect(res.body.user.id).toBeDefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const sessionCookie = cookies.find((c: string) => c.startsWith("session="));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/HttpOnly/i);
      expect(sessionCookie).toMatch(/SameSite=Strict/i);
      expect(sessionCookie).toMatch(/Path=\//i);
      expect(sessionCookie).toMatch(/Max-Age=28800/i);
    });

    it("intento de login sin cabecera anti-CSRF es rechazado con 403 Forbidden", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Petición rechazada: encabezado anti-CSRF ausente");
    });
  });

  describe("2. Sesión Silenciosa / Perfil Actual (GET /api/auth/me)", () => {
    it("consulta a GET /api/auth/me con cookie válida -> Retorna 200 OK con { id, email, role: 'admin' }", async () => {
      // Login previo
      const loginRes = await request(app)
        .post("/api/auth/login")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD,
        });

      const cookies = loginRes.headers["set-cookie"];

      // Consulta a /me
      const meRes = await request(app).get("/api/auth/me").set("Cookie", cookies);

      expect(meRes.status).toBe(200);
      expect(meRes.body).toEqual({
        id: loginRes.body.user.id,
        email: TEST_ADMIN_EMAIL,
        role: "admin",
      });
    });

    it("consulta a GET /api/auth/me sin cookie o expirada -> Retorna 401 Unauthorized", async () => {
      // 1. Sin cookie
      const noCookieRes = await request(app).get("/api/auth/me");
      expect(noCookieRes.status).toBe(401);
      expect(noCookieRes.body.error).toBe("Sesión no válida o expirada");

      // 2. Con token expirado
      const expiredToken = jwt.sign(
        { id: "00000000-0000-0000-0000-000000000000", email: "expired@test.com", role: "admin" },
        ENV.JWT_SECRET,
        { expiresIn: "-1s", algorithm: "HS256" },
      );

      const expiredRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`session=${expiredToken}`]);

      expect(expiredRes.status).toBe(401);
      expect(expiredRes.body.error).toBe("Sesión no válida o expirada");
    });
  });

  describe("3. Cierre de Sesión (POST /api/auth/logout)", () => {
    it("invocación a POST /api/auth/logout -> Retorna cookie vacía con Max-Age=0 y 200 OK", async () => {
      // Iniciar sesión
      const loginRes = await request(app)
        .post("/api/auth/login")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: TEST_ADMIN_EMAIL,
          password: TEST_ADMIN_PASSWORD,
        });

      const cookies = loginRes.headers["set-cookie"];

      // Logout
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookies);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      const logoutCookies = logoutRes.headers["set-cookie"];
      expect(logoutCookies).toBeDefined();
      const sessionCookie = logoutCookies.find((c: string) => c.startsWith("session="));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatch(/Max-Age=0/i);

      // Verificación posterior de que la cookie purgada no permite acceder a /me
      const afterLogoutRes = await request(app).get("/api/auth/me").set("Cookie", logoutCookies);

      expect(afterLogoutRes.status).toBe(401);
    });
  });
});
