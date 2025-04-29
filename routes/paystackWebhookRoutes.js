import express from "express";
import crypto from "crypto";

import { Invoice } from "../models/invoiceModel.js";
import { Enrollment } from "../models/enrollmentModel.js";

// make invoice as paid on charge.success
const markInvoiceAsPaid = async ({
  amount,
  status,
  paid_at: paidAt,
  reference: paystackReference,
  id: paystackTransactionId,
}) => {
  try {
    const invoice = await Invoice.findOne({ paystackReference });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // This may never occur, just an extra check. We'll be listening to a 'charge.success' event
    if (invoice.status === "paid") return;

    if (status !== "success" || paidAt === null || amount === invoice.amount) {
      throw new Error("Invalid payment status or amount");
    }

    invoice.status = "paid";
    invoice.paidAt = paidAt;
    invoice.paystackTransactionId = paystackTransactionId;

    await invoice.save();

    const isAlreadyEnrolled = await Enrollment.findOne({
      learner: invoice.learner,
      track: invoice.track,
    });

    if (!isAlreadyEnrolled) {
      await Enrollment.create({
        learner: invoice.learner,
        track: invoice.track,
      });
    }
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
  }
};

const router = express.Router();

router.route("/").post(async (req, res) => {
  try {
    // validate event
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      switch (req.body.event) {
        case "charge.success":
          // mark invoice as paid
          await markInvoiceAsPaid(req.body.data);

          break;

        default:
          console.log(`Unhandled event type ${req.body.event}`);
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: `Webhook error: ${error.message}`,
    });
  }

  return res.sendStatus(200);
});

export default router;
