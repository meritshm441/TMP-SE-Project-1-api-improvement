import { z } from "zod";

export const enrollmentSchema = z.object({
  track: z
    .string({ message: "Track ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid track ID format"),
  learner: z
    .string({ message: "Learner ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid learner ID format")
    .optional(),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be a positive number")
    .optional(),
  paystackCallbackUrl: z.string().url("Invalid URL format").optional(),
});

export const updateEnrollmentSchema = enrollmentSchema.partial();
