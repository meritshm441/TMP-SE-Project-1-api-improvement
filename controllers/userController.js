import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { BAD_REQUEST, CREATED, OK_S } from "../constant/http.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
} from "../sendgrid/sendgridConfig.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../sendgrid/emailTemplates.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// ========== user  controllers ===========

const userSignup = async (userData, res) => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Generate a 6-digit verification code
  const verificationToken = generateVerificationToken();
  // Create a new user
  const newInfo = {
    ...userData,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Save the user to the database
  const user = await User.create(newInfo);
  user.password = undefined;

  // jwt
  const token = generateTokenAndSetCookie(res, user._id, user.role);

  // Send verification email
  await sendVerificationEmail(
    user.email,
    verificationToken,
    VERIFICATION_EMAIL_TEMPLATE
  );

  return { user, token };
};

export const adminSignup = asyncHandler(async (req, res, next) => {
  const { token, user } = await userSignup({ ...req.body, role: "Admin" }, res);

  res.status(CREATED).json({
    success: true,
    message: "Admin created successfully",
    token,
    user,
  });
});

export const learnerSignup = asyncHandler(async (req, res, next) => {
  const { token, user } = await userSignup(
    { ...req.body, role: "Learner" },
    res
  );

  res.status(CREATED).json({
    success: true,
    message: "Learner created successfully",
    token,
    user,
  });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  const user = req.user;

  const userHasVerifyToken =
    user.verificationToken === token.toString() &&
    user.verificationTokenExpiresAt > Date.now();

  if (!userHasVerifyToken) {
    return next(new ErrorResponse("Invalid or expired token", BAD_REQUEST));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.firstName, WELCOME_EMAIL_TEMPLATE);

  res.status(OK_S).json({
    success: true,
    message: "Email verified successfully",
    user,
  });
});

export const userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", BAD_REQUEST));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Invalid credentials", BAD_REQUEST));
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { lastLogin: Date.now() },
    {
      new: true,
    }
  );

  if (!updatedUser) {
    return next(new ErrorResponse("User not found", BAD_REQUEST));
  }

  // jwt
  const token = generateTokenAndSetCookie(res, user._id, user.role);

  res.status(OK_S).json({
    success: true,
    message: "Login successful",
    token,
    user: updatedUser,
  });
});

export const userLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(OK_S).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse("User not found", BAD_REQUEST));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;
  await user.save();

  // Send reset password email
  await sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    PASSWORD_RESET_REQUEST_TEMPLATE
  );

  res.status(OK_S).json({
    success: true,
    message: "Reset password email sent",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorResponse("Invalid or expired reset token", BAD_REQUEST)
    );
  }

  // update password
  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  await sendResetSuccessEmail(user.email, PASSWORD_RESET_SUCCESS_TEMPLATE);

  res
    .status(OK_S)
    .json({ success: true, message: "Password reset successful" });
});

export const checkAuth = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(OK_S).json({ success: true, user });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  if (req.file) {
    const { secure_url: profileImage } = await uploadToCloudinary(
      req.file.path
    );

    if (!profileImage) {
      return next(
        new ErrorResponse("Profile Image upload failed", BAD_REQUEST)
      );
    }

    req.body.profileImage = profileImage;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });

  if (!updatedUser) {
    return next(new ErrorResponse("User not found", BAD_REQUEST));
  }

  res.status(OK_S).json({
    success: true,
    message: "User updated successfully",
    user: updatedUser,
  });
});

export const resendVerificationToken = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isVerified) {
    return res
      .status(BAD_REQUEST)
      .json({ success: false, message: "User is already verified" });
  }

  const verificationToken = generateVerificationToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  await sendVerificationEmail(
    user.email,
    verificationToken,
    VERIFICATION_EMAIL_TEMPLATE
  );

  res.status(OK_S).json({ success: true, message: "Verification email sent" });
});
