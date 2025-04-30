function errorHandler(err, req, res, next) {
  console.error(err);

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({message: err.errors[0].message});
  }
  if (err.name === "BadRequest") {
    return res.status(400).json({message: err.message});
  }
  if (err.name === "Unauthorized") {
    return res.status(401).json({message: err.message});
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({message: "Invalid Token"});
  }
  if (err.name === "Forbidden") {
    return res.status(403).json({message: err.message});
  }
  if (err.name === "NotFound") {
    return res.status(404).json({message: err.message});
  }
  return res.status(500).json({message: "Internal server error"});
}

module.exports = errorHandler;
