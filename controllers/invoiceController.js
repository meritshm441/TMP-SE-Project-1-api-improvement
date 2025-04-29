import { Invoice } from "../models/invoiceModel.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK_S } from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { sendLearnerPendingInvoice } from "../sendgrid/sendgridConfig.js";
import { LEARNER_PENDING_INVOICE_TEMPLATE } from "../sendgrid/emailTemplates.js";
import { Enrollment } from "../models/enrollmentModel.js";
import { initializePaystackTransaction } from "../utils/paystack.js";

export const createInvoice = asyncHandler(async (req, res, next) => {
  const learnerEnrollment = await Enrollment.findOne({
    learner: req.body.learner,
  })
    .populate("track")
    .populate("learner");

  if (!learnerEnrollment) {
    return next(
      new ErrorResponse(
        "Learner does not exist or is not enrolled in any track",
        BAD_REQUEST
      )
    );
  }

  const learnerInvoices = await Invoice.find({
    learner: req.body.learner,
  });

  const trackPrice = learnerEnrollment.track.price;

  const totalPaidInvoice = learnerInvoices.reduce((acc, invoice) => {
    if (invoice.status === "paid") {
      return acc + invoice.amount;
    }
    return acc;
  }, 0);

  const amountOwed = trackPrice - totalPaidInvoice;
  if (amountOwed === 0) {
    return next(
      new ErrorResponse(
        "Learner has no outstanding balance, they cannot be invoiced",
        BAD_REQUEST
      )
    );
  }

  const invoiceData = {
    ...req.body,
    track: learnerEnrollment.track._id,
    amount: req.body.amount || amountOwed, // Default amount
    dueDate: req.body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
  };

  if (invoiceData.amount > amountOwed) {
    return next(
      new ErrorResponse(
        "Invoice amount cannot be greater than the outstanding balance",
        BAD_REQUEST
      )
    );
  }

  // initialize a paystack transaction
  const transaction = await initializePaystackTransaction({
    amount: invoiceData.amount,
    email: learnerEnrollment.learner.email,
    callback_url: req.body.paystackCallbackUrl,
  });

  if (!transaction) {
    return next(
      new ErrorResponse(
        "Paystack transaction initialization failed",
        BAD_REQUEST
      )
    );
  }

  const invoice = await Invoice.create({
    ...invoiceData,
    paymentLink: transaction.authorization_url,
  });

  // Update all learner's pending invoices to cancelled
  await Invoice.updateMany(
    {
      learner: req.body.learner,
      status: "pending",
      _id: { $ne: invoice._id }, // Exclude the newly created invoice
    },
    { status: "cancelled" }
  );

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("learner")
    .populate("track");

  const emailTemplates = LEARNER_PENDING_INVOICE_TEMPLATE({
    amount: invoice.amount,
    dueDate: invoice.dueDate,
    paymentLink: invoice.paymentLink,
  });

  // Send email to learner
  await sendLearnerPendingInvoice(
    populatedInvoice.learner.email,
    emailTemplates
  );

  res.status(CREATED).json({
    success: true,
    message: "Invoice created successfully and email sent to learner",
    invoice: populatedInvoice,
  });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const user = req.user;
  const authUserIsLearner = user.role === "Learner";

  const query = {};
  if (authUserIsLearner) {
    query.learner = user.id;
  }

  const invoices = await Invoice.find(query)
    .populate("learner")
    .populate("track");

  res.status(OK_S).json({
    success: true,
    count: invoices.length,
    invoices,
  });
});

export const getInvoiceById = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const authUserIsLearner = user.role === "Learner";
  const authUserId = user.id;

  const invoice = await Invoice.findById(req.params.id)
    .populate("learner")
    .populate("track");

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", NOT_FOUND));
  }

  if (
    authUserIsLearner &&
    invoice.learner.id.toString() !== authUserId.toString()
  ) {
    return next(
      new ErrorResponse(
        "You are not authorized to view this invoice",
        BAD_REQUEST
      )
    );
  }

  res.status(OK_S).json({
    success: true,
    invoice,
  });
});

export const updateInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", NOT_FOUND));
  }

  invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(OK_S).json({
    success: true,
    message: "Invoice updated successfully",
    invoice,
  });
});

export const updateInvoiceStatus = asyncHandler(async (req, res, next) => {
  const { status, paystackReference, paystackTransactionId } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", NOT_FOUND));
  }

  if (status === "paid") {
    invoice.status = "paid";
    invoice.paidAt = new Date();
    invoice.paystackReference = paystackReference;
    invoice.paystackTransactionId = paystackTransactionId;
  }

  await invoice.save();

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("learner")
    .populate("track");

  res.status(OK_S).json({
    success: true,
    message: "Invoice status updated successfully",
    invoice: populatedInvoice,
  });
});

export const deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse("Invoice not found", NOT_FOUND));
  }

  await invoice.deleteOne();

  res.status(OK_S).json({
    success: true,
    message: "Invoice deleted successfully",
  });
});
