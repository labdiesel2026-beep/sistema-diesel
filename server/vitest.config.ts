import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    environment: "node",
    env: {
      NODE_ENV: "test",
      PORT: "3001",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/laboratorio_diesel?schema=public",
      JWT_SECRET: "test_secret_super_seguro_de_al_menos_32_caracteres_para_vitest",
      CORS_ORIGIN: "http://localhost:5173",
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-api-key",
      CLOUDINARY_API_SECRET: "test-api-secret",
    },
  },
});
