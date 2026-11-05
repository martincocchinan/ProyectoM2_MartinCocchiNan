import express from "express";
import router from "./routes/indexRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./utils/errors.js";

const app = express();


app.get("/", (req, res) => {
  res.status(200).json({ message: "API funcionando" });
});

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
