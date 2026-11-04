export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;

  const message =
    statusCode >= 500
      ? "Error interno del servidor"
      : err.message || "Error en la solicitud";

  console.error("❌ Error capturado:", {
    status: statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const response = { error: message, status: statusCode };

  res.status(statusCode).json(response);
}
