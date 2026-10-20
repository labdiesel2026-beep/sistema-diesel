import { Router } from "express";
import authRoutes from "./auth.routes.js";
import uploadRoutes from "./upload.routes.js";
import brandRoutes from "./brand.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import metricsRoutes from "./metrics.routes.js";

const apiRouter = Router();

// Montaje de módulos
apiRouter.use("/auth", authRoutes);
apiRouter.use("/uploads", uploadRoutes);
apiRouter.use("/brands", brandRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/admin", metricsRoutes);
apiRouter.use("/admin/metrics", metricsRoutes);

export default apiRouter;
