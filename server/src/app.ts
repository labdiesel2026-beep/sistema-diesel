import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRouter from "./routes/index.js";
import { DEFAULT_UPLOADS_DIR } from "./services/file-storage.service.js";

const app = express();

// Desactivar explícitamente cabecera X-Powered-By para mitigar fingerprinting (RF-01, 4.4)
app.disable("x-powered-by");

// Configurar confianza en proxies reversos para rate limiting preciso (D-11)
app.set("trust proxy", 1);

// Cabeceras defensivas con Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS restrictivo exclusivo a CORS_ORIGIN con soporte de credenciales (RF-01, 4.3)
app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin origen (ej. curl, postman, herramientas internas) o CORS_ORIGIN / dev ports
      if (
        !origin ||
        origin === ENV.CORS_ORIGIN ||
        origin === "http://localhost:3000" ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Bloqueado por política CORS: origen ${origin} no permitido`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Parsers para JSON y Cookies seguras
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Servicio estático blindado para imágenes sanitizadas (/uploads) (Tarea 4.4, D-12)
app.use(
  "/uploads",
  express.static(DEFAULT_UPLOADS_DIR, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Endpoint base de verificación de salud
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Laboratorio Diésel API",
    status: "online",
    port: ENV.PORT,
  });
});

// Enrutador central de la API
app.use("/api", apiRouter);

// Manejador central de errores (operativos vs 500 opacos con UUID)
app.use(errorHandler);

export { app };
export default app;
