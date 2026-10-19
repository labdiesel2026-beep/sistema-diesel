import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { csrfProtection } from "../src/middleware/csrf.middleware.js";

describe("Middleware Defensivo Anti-CSRF (Tarea 2.3)", () => {
  const setupApp = () => {
    const app = express();
    app.use(express.json());
    app.use(csrfProtection);

    const okHandler = (_req: express.Request, res: express.Response) => {
      res.status(200).json({ success: true });
    };

    app.get("/test", okHandler);
    app.post("/test", okHandler);
    app.put("/test", okHandler);
    app.patch("/test", okHandler);
    app.delete("/test", okHandler);

    return app;
  };

  it("permite peticiones con métodos seguros (GET) sin exigir la cabecera anti-CSRF", async () => {
    const app = setupApp();
    const res = await request(app).get("/test");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rechaza peticiones POST sin cabecera X-Requested-With retornando 403 Forbidden", async () => {
    const app = setupApp();
    const res = await request(app).post("/test").send({ data: "test" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Petición rechazada: encabezado anti-CSRF ausente");
  });

  it("rechaza peticiones con cabecera X-Requested-With incorrecta", async () => {
    const app = setupApp();
    const res = await request(app)
      .post("/test")
      .set("X-Requested-With", "FetchAPI")
      .send({ data: "test" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Petición rechazada: encabezado anti-CSRF ausente");
  });

  it("permite peticiones POST con cabecera X-Requested-With: XMLHttpRequest", async () => {
    const app = setupApp();
    const res = await request(app)
      .post("/test")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ data: "test" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("exige y valida la cabecera en todos los métodos mutables (PUT, PATCH, DELETE)", async () => {
    const app = setupApp();

    // PUT
    const putFail = await request(app).put("/test").send({});
    expect(putFail.status).toBe(403);
    const putOk = await request(app).put("/test").set("X-Requested-With", "XMLHttpRequest").send({});
    expect(putOk.status).toBe(200);

    // PATCH
    const patchFail = await request(app).patch("/test").send({});
    expect(patchFail.status).toBe(403);
    const patchOk = await request(app).patch("/test").set("X-Requested-With", "XMLHttpRequest").send({});
    expect(patchOk.status).toBe(200);

    // DELETE
    const deleteFail = await request(app).delete("/test");
    expect(deleteFail.status).toBe(403);
    const deleteOk = await request(app).delete("/test").set("X-Requested-With", "XMLHttpRequest");
    expect(deleteOk.status).toBe(200);
  });
});
