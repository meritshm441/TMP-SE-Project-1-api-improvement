import { ErrorResponse } from "../utils/error.js";
import { UNAUTHORIZED } from "../constant/http.js";
import { User } from "../models/userModel.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return next(new ErrorResponse("User not found", UNAUTHORIZED));
    }

    if (user.role !== "Admin") {
      return next(
        new ErrorResponse("Access denied. Admin only route", UNAUTHORIZED)
      );
    }

    next();
  } catch (error) {
    next(new ErrorResponse("Authorization failed", UNAUTHORIZED));
  }
};
