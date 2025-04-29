import { z } from "zod";

export const courseSchema = z.object({
  track: z
    .string({ message: "Track ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid track ID format"),
  title: z
    .string({ message: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters" })
    .trim(),
  description: z
    .string({ message: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" })
    .trim(),
});

export const updateCourseSchema = courseSchema.partial();
