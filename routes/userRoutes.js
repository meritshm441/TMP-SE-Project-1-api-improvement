import express from "express";
import {
  userLogin,
  userLogout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  updateUser,
  resendVerificationToken,
  adminSignup,
  learnerSignup,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import {
  verifyEmailSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
  adminSchema,
  learnerSchema,
} from "../schemas/userSchemas.js";
import {
  userExistMiddleware,
  verifyUserMiddleware,
} from "../middlewares/userMiddleware.js";
import { uploadSingleImageFile } from "../middlewares/uploadMIddleware.js";

const router = express.Router();

// =========== User Auth Routes ===========
router.get("/check-auth", verifyUserMiddleware, checkAuth);

// Post /api/auth/signup/admin
router.post(
  "/signup/admin",
  validateRequestBody(adminSchema),
  userExistMiddleware,
  adminSignup
);

// Post /api/auth/signup/learner
router.post(
  "/signup/learner",
  validateRequestBody(learnerSchema),
  userExistMiddleware,
  learnerSignup
);

// Post /api/auth/login
router.post("/login", validateRequestBody(userLoginSchema), userLogin);

// Post /api/auth/logout
router.post("/logout", userLogout);

// Post /api/auth/verify-email
router.post(
  "/verify-email",
  verifyUserMiddleware,
  validateRequestBody(verifyEmailSchema),
  verifyEmail
);

// Post /api/auth/forgot-password
router.post(
  "/forgot-password",
  validateRequestBody(forgotPasswordSchema),
  forgotPassword
);

// Post /api/auth/reset-password/:token
router.post(
  "/reset-password/:token",
  validateRequestBody(resetPasswordSchema),
  resetPassword
);

// Update user details (protected route)
router.put(
  "/update",
  verifyUserMiddleware,
  uploadSingleImageFile("profileImage"),
  validateRequestBody(updateUserSchema),
  updateUser
);

// Resend verification token
router.post("/resend-token", verifyUserMiddleware, resendVerificationToken);

export default router;
