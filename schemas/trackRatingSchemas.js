import { z } from "zod";

export const trackRatingSchema = z.object({
  rating: z
    .number({ message: "Rating is required" })
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  review: z
    .string({ message: "Review is required" })
    .min(10, { message: "Review must be at least 10 characters" })
    .trim()
    .optional(),
});
