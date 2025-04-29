import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const learnerSchemaZod = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  course: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  location: z.string().min(1),
  phone: z.string().min(1),
  disability: z.string().optional(),
  created_by: z
    .object({
      role: z.string(),
      email: z.string(),
    })
    .optional(),
  image: z.string().url().optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  // isVerified: z.boolean().optional(),

  // verificationToken: z.string().optional(),
  // verificationTokenExpiresAt: z.date().optional(),
});

// Define the Mongoose schema
const learnerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    course: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    disability: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: null,
    },
    created_by: {
      role: { type: String, default: "" },
      user_id: { type: String, default: "" },
    },

    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },

    // verificationToken: String,
    // verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const Learner = mongoose.model("Learner", learnerSchema);
export const validateLearner = (learner) => learnerSchemaZod.parse(learner);
