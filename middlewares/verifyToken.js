import jwt from "jsonwebtoken";
import { UNAUTHORIZED } from "../constant/http.js";
import asyncHandler from "./asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(
      new ErrorResponse("Access denied. No token provided.", UNAUTHORIZED)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new ErrorResponse("Invalid token.", UNAUTHORIZED));
    }

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return next(new ErrorResponse("Invalid token", UNAUTHORIZED));
  }
});
