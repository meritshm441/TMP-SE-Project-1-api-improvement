import mongoose from "mongoose";

// Define the Mongoose schema
const invoiceSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "cancelled"],
      default: "pending",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    },
    paidAt: {
      type: Date,
    },
    paystackReference: {
      type: String,
    },
    paystackTransactionId: {
      type: String,
    },
    paymentLink: {
      type: String,
    },
    paymentDetails: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
