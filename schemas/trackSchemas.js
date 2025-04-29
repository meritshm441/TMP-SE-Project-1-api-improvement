import { z } from "zod";

export const trackSchema = z.object({
  name: z
    .string({ message: "Track name is required" })
    .min(3, { message: "Track name must be at least 3 characters" })
    .trim(),
  price: z.coerce.number({
    message: "The price is required and it must be a number",
  }),
  instructor: z
    .string({ message: "Instructor name is required" })
    .min(3, { message: "Instructor name must be at least 3 characters" })
    .trim(),
  duration: z
    .string({ message: "Duration is required" })
    .min(3, { message: "Duration must be at least 3 characters" })
    .trim(),
  description: z
    .string({ message: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" })
    .trim(),
});

export const updateTrackSchema = trackSchema.partial();
