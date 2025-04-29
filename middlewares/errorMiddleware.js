import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK_S,
} from "../constant/http.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode === OK_S ? INTERNAL_SERVER_ERROR : res.statusCode;

  let message = err.message ? err.message : "Internal server error";

  if (err.name === "CastError") {
    statusCode = BAD_REQUEST;
    message = `Resource not found. Invalid ${err.path}`;
  }

  if (err.name === "ValidationError") {
    statusCode = BAD_REQUEST;
    message = `Validation Error`;
  }

  if (err.code === 11000) {
    statusCode = BAD_REQUEST;
    message = `Duplicate field value entered`;
  }

  res.status(err.statusCode || statusCode).json({
    success: false,
    errors: [
      {
        message,
      },
    ],
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(NOT_FOUND);
  next(error);
};
