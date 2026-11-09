import { ENV } from "./config/env.js";
import { app } from "./app.js";

const PORT = Number(process.env.PORT) || ENV.PORT || 3000;
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 [Server] Servidor backend escuchando en http://${HOST}:${PORT}`);
  console.log(`🔒 [Server] CORS habilitado exclusivamente para: ${ENV.CORS_ORIGIN}`);
  console.log(`🛡️  [Server] Cabeceras de seguridad Helmet y Anti-Fingerprinting activas`);
});

// Manejo de apagado elegante (Graceful shutdown)
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
  server.close(() => {
    console.log("👋 Servidor HTTP cerrado correctamente.");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export { server };
