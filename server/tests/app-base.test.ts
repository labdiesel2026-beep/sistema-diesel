import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("Servidor Express Base y Cabeceras de Seguridad (Tarea 2.1)", () => {
  it("responde 200 OK en /health con formato JSON", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("no expone la cabecera X-Powered-By", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("inyecta cabeceras defensivas de Helmet (Clickjacking, MIME Sniffing, etc.)", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("permite peticiones con el origen autorizado en CORS_ORIGIN y emite Access-Control-Allow-Credentials", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("bloquea o rechaza peticiones con orígenes no autorizados", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://sitio-malicioso.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
