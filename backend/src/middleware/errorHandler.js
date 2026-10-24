export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.path}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: 'Los datos enviados no son válidos.', details });
  }
  if (error?.name === 'CastError') {
    return res.status(400).json({ message: 'El identificador o valor recibido no es válido.' });
  }
  if (error?.status === 403) return res.status(403).json({ message: error.message });
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'El cuerpo JSON no tiene un formato válido.' });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un registro con uno de esos datos.' });
  }

  const status = Number.isInteger(error?.status) ? error.status : 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    message: status >= 500 ? 'Ocurrió un error interno.' : error.message,
  });
}
