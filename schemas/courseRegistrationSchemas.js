import { z } from "zod";

export const courseRegistrationSchema = z.object({
  course: z
    .string({ message: "Course ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
});
