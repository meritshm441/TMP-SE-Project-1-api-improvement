import { TrackRating } from "../models/trackRatingModel.js";
import { Track } from "../models/trackModel.js";
import { Enrollment } from "../models/enrollmentModel.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK_S } from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";

export const rateTrack = asyncHandler(async (req, res, next) => {
  const learnerId = req.user.id;
  const trackId = req.params.id;

  // Check if track exists
  const track = await Track.findById(trackId);
  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  // Verify learner is enrolled in the track
  const enrollment = await Enrollment.findOne({
    learner: learnerId,
    track: trackId,
  });

  if (!enrollment) {
    return next(
      new ErrorResponse(
        "You must be enrolled in this track to rate it",
        BAD_REQUEST
      )
    );
  }

  // Check if learner has already rated the track
  const existingRating = await TrackRating.findOne({
    learner: learnerId,
    track: trackId,
  });

  if (existingRating) {
    return next(
      new ErrorResponse("You have already rated this track", BAD_REQUEST)
    );
  }

  // Create the rating
  const trackRating = await TrackRating.create({
    ...req.body,
    learner: learnerId,
    track: trackId,
  });

  const populatedRating = await TrackRating.findById(trackRating._id)
    .populate("learner")
    .populate("track");

  res.status(CREATED).json({
    success: true,
    message: "Track rated successfully",
    rating: populatedRating,
  });
});

export const getTrackRatings = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const track = await Track.findById(id);
  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  const ratings = await TrackRating.find({ track: id })
    .populate("learner")
    .sort("-createdAt");

  const averageRating =
    ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length || 0;

  res.status(OK_S).json({
    success: true,
    count: ratings.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratings,
  });
});
