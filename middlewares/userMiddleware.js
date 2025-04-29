import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../constant/http.js";
import { User } from "../models/userModel.js";
import { ErrorResponse } from "../utils/error.js";
import asyncHandler from "./asyncMiddleware.js";

export const verifyUserMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(
      new ErrorResponse("Access denied. No token provided.", UNAUTHORIZED)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new ErrorResponse("Invalid token.", UNAUTHORIZED));
  }

  // Check if the user exists in the database
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(
      new ErrorResponse("Access denied. No token provided.", UNAUTHORIZED)
    );
  }

  req.user = user;

  next();
});

export const userExistMiddleware = asyncHandler(async (req, res, next) => {
  // Check if the user already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new ErrorResponse("User already exists", BAD_REQUEST));
  }

  next();
});

export const userIsVerifiedMiddleware = asyncHandler(async (req, res, next) => {
  // Check if the user is verified
  if (!req.user.isVerified) {
    return next(new ErrorResponse("User is not verified", BAD_REQUEST));
  }

  next();
});

export const isAdminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "Admin") {
    return next(
      new ErrorResponse("Access denied. Admin only route", UNAUTHORIZED)
    );
  }

  next();
});

export const profileIsCompletedMiddleware = asyncHandler(
  async (req, res, next) => {
    const { contact, isVerified, location, disabled, description } = req.user;

    const profileIsCompleted =
      contact &&
      isVerified === true &&
      location &&
      disabled !== undefined &&
      description;

    if (!profileIsCompleted) {
      return next(
        new ErrorResponse(
          "Please complete your profile before enrolling into a track",
          UNAUTHORIZED
        )
      );
    }

    next();
  }
);
