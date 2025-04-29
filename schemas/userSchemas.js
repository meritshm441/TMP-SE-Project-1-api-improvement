import { z } from "zod";
import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";

const userSchema = z.object({
  firstName: z
    .string({ message: "First name is required" })
    .min(3, {
      message: `First name is required and must be at least 3 characters`,
    })
    .trim(),
  lastName: z
    .string({ message: "Last name is required" })
    .min(3, {
      message: `First name is required and must be at least 3 characters`,
    })
    .trim(),
  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Password is required" })
    .min(8, {
      message: `Password is required and must be at least 8 characters`,
    })
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  confirmPassword: z.string({
    message: "Confirm password is required",
  }),
});

export const adminSchema = userSchema
  .extend({
    contact: z
      .string({
        required_error: "Contact is required",
        message: "Contact is required",
      })
      .trim()
      .refine((val) => isValidPhoneNumber(val), {
        message: "Please enter a valid phone number",
      })
      .transform((val) => parsePhoneNumber(val)?.number?.toString()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const learnerSchema = userSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export const verifyEmailSchema = z.object({
  token: z.coerce
    .number({
      message: "The token is required and it must be a number",
    })
    .refine((val) => val.toString().length === 6, {
      message: "The token must be at 6 characters",
    }),
});

export const userLoginSchema = userSchema.pick({
  email: true,
  password: true,
});

export const forgotPasswordSchema = userSchema.pick({ email: true });

export const resetPasswordSchema = userSchema
  .pick({ password: true, confirmPassword: true })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updateUserSchema = z.object({
  contact: z
    .string({
      required_error: "Contact is required",
      message: "Contact is required",
    })
    .trim()
    .refine((val) => isValidPhoneNumber(val), {
      message: "Please enter a valid phone number",
    })
    .transform((val) => parsePhoneNumber(val)?.number?.toString()),
  disabled: z
    .string({
      required_error: "Disabled is required",
      message: "Disabled is required",
    })
    .refine((s) => s === "true" || s === "false")
    .transform((s) => s === "true"),
  location: z
    .string({
      required_error: "Location is required",
      message: "Location is required",
    })
    .trim(),
  description: z
    .string({
      required_error: "Description is required",
      message: "Description is required",
    })
    .trim(),
});
