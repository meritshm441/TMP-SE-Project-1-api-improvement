import { Enrollment } from "../models/enrollmentModel.js";
import {
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  OK_S,
  UNAUTHORIZED,
} from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { User } from "../models/userModel.js";
import { initializePaystackTransaction } from "../utils/paystack.js";
import { Invoice } from "../models/invoiceModel.js";
import { Track } from "../models/trackModel.js";

export const enrollTrack = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const authUserId = req.user.id;

  const { track: trackId, learner, amount, paystackCallbackUrl } = req.body;

  // Check if track exists and get track info
  const track = await Track.findById(trackId);
  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  // Only user with the role of Learner can enroll in a track
  if (user.role === "Admin" && !learner) {
    return next(
      new ErrorResponse("Learner is required for enrollment", BAD_REQUEST)
    );
  }

  const learnerId = user.role === "Learner" ? authUserId : learner;

  const authUserIsLearner = user.role === "Learner";

  // check if amount is provided and is greater than track price
  if (amount && amount > track.price) {
    return next(
      new ErrorResponse(
        "Amount cannot be greater than track price",
        BAD_REQUEST
      )
    );
  }

  // Check if learner is already enrolled in a track
  const existingEnrollment = await Enrollment.findOne({
    learner: learnerId,
  });

  if (existingEnrollment) {
    return next(
      new ErrorResponse(
        authUserIsLearner
          ? "You are already enrolled into a track, you are not allowed to enroll in another track"
          : "Learner is already enrolled into a track, they are not allowed to enroll in another track",
        BAD_REQUEST
      )
    );
  }

  // Handle learner payment process
  if (authUserIsLearner) {
    if (!paystackCallbackUrl) {
      return next(
        new ErrorResponse("paystackCallbackUrl is required", BAD_REQUEST)
      );
    }

    // initialize a paystack transaction
    const transaction = await initializePaystackTransaction({
      amount: amount || track.price,
      email: user.email,
      callback_url: paystackCallbackUrl,
    });

    if (!transaction) {
      return next(
        new ErrorResponse(
          "Paystack transaction initialization failed",
          BAD_REQUEST
        )
      );
    }

    // Check/update existing invoice or create new one
    let invoice = await Invoice.findOne({
      learner: authUserId,
      track: trackId,
    });

    if (invoice) {
      invoice.amount = amount || track.price;
      invoice.paystackReference = transaction.reference;
      await invoice.save();
    } else {
      invoice = await Invoice.create({
        learner: authUserId,
        track: trackId,
        amount: amount || track.price,
        paystackReference: transaction.reference,
      });
    }

    return res.status(CREATED).json({
      success: true,
      message: "Transaction initialized successfully",
      transactionUrl: transaction.authorization_url,
      invoice,
    });
  }

  // Create enrollment for admin-initiated enrollment
  const enrollment = await Enrollment.create({
    learner: learnerId,
    track: trackId,
  });

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate("learner")
    .populate("track");

  res.status(CREATED).json({
    success: true,
    message: "Track enrolled successfully",
    enrollment: populatedEnrollment,
  });
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return next(new ErrorResponse("Access denied", UNAUTHORIZED));
  }

  const query = {};

  // Check if the user is a learner, and get only their enrollments
  if (user.role === "Learner") {
    query.learner = req.userId;
  }

  const enrollments = await Enrollment.find(query)
    .populate("track")
    .sort("-createdAt");

  res.status(OK_S).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

export const cancelEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findOne({
    _id: req.params.id,
    learner: req.userId,
  });

  if (!enrollment) {
    return next(new ErrorResponse("Enrollment not found", NOT_FOUND));
  }

  await enrollment.deleteOne();

  res.status(OK_S).json({
    success: true,
    message: "Enrollment cancelled successfully",
  });
});
