import mongoose from "mongoose";
import { z } from "zod";

// Define the Zod schema
const monthlyDataSchemaZod = z.object({
  month: z.string().min(1),
  amount: z.number().positive(),
});

const revenueSchemaZod = z.object({
  monthlyData: z.array(monthlyDataSchemaZod),
});

// Define the Mongoose schema
const monthlyDataSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const revenueSchema = new mongoose.Schema(
  {
    monthlyData: {
      type: [monthlyDataSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export const Revenue = mongoose.model("Revenue", revenueSchema);
export const validateRevenue = (revenue) => revenueSchemaZod.parse(revenue);
