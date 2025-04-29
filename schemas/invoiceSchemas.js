import { z } from "zod";

export const invoiceSchema = z.object({
  learner: z
    .string({ message: "Learner ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid learner ID format"),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be a positive number")
    .optional(),
  dueDate: z.coerce
    .date({
      required_error: "Due date is required",
      invalid_type_error: "Due date must be a valid date",
    })
    .optional(),
  paystackCallbackUrl: z.string().url("Invalid URL format").optional(),
  paymentDetails: z
    .string()
    .min(10, { message: "Payment details must be at least 10 characters" })
    .trim()
    .optional(),
});

export const updateInvoiceSchema = invoiceSchema
  .partial()
  .omit({ learner: true, course: true });
