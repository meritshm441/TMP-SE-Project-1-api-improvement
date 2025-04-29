import mongoose from "mongoose";

export const roles = ["Learner", "Admin"];

const roleEnum = {
  values: roles,
  message: "The user role can only be`{VALUE}`",
};

// Define the Mongoose schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Hide the password when querying the database
    },
    role: {
      type: String,
      enum: roleEnum,
      default: "Learner",
    },
    profileImage: String,
    contact: String,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: String,
    disabled: Boolean,
    description: String,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
