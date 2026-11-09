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

// Lista blanca estricta de orígenes autorizados (soporta múltiples dominios y normaliza barras finales)
const configuredOrigins = (ENV.CORS_ORIGIN || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultDevOrigins = ["http://localhost:3000", "http://localhost:5173"];
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

// CORS defensivo exclusivo a CORS_ORIGIN con soporte de credenciales y preflight sin bloqueo (RF-01, 4.3)
app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin origen (ej. curl, postman, herramientas internas, SSR)
      if (!origin) {
        return callback(null, true);
      }
      const cleanOrigin = origin.trim().replace(/\/+$/, "");
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      // Rechazar origen no autorizado sin arrojar excepción para no romper preflight OPTIONS con 500
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
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
    port: Number(process.env.PORT) || ENV.PORT || 3000,
  });
});

// Enrutador central de la API
app.use("/api", apiRouter);

// Manejador central de errores (operativos vs 500 opacos con UUID)
app.use(errorHandler);

export { app };
export default app;
