import "dotenv/config";
import express from "express";
import router from "./routes/indexRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./utils/errors.js";

const app = express();

const { loadEnvFile } = import('node:process');

if (process.env.NODE_ENV !== 'production') {
  loadEnvFile('.env');
}

// Middleware
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use(router);

app.use((req, res, next) => {
  next(notFound("Ruta no encontrada"));
});

app.use(errorHandler);

export default app;
