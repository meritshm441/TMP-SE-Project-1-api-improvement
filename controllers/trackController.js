import { Track } from "../models/trackModel.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK_S } from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createTrack = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("Image is required", BAD_REQUEST));
  }

  const { secure_url: image } = await uploadToCloudinary(req.file.path);

  if (!image) {
    return next(new ErrorResponse("Image upload failed", BAD_REQUEST));
  }

  const admin = req.user.id;

  const trackData = {
    ...req.body,
    admin,
    image,
  };

  const track = await Track.create(trackData);

  res.status(CREATED).json({
    success: true,
    message: "Track created successfully",
    track,
  });
});

export const getTracks = asyncHandler(async (req, res) => {
  const tracks = await Track.find()
    .populate("admin")
    .populate("courses")
    .populate("ratings");

  res.status(OK_S).json({
    success: true,
    count: tracks.length,
    tracks,
  });
});

export const getTrack = asyncHandler(async (req, res, next) => {
  const track = await Track.findById(req.params.id)
    .populate("admin")
    .populate("courses")
    .populate("ratings");

  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  res.status(OK_S).json({
    success: true,
    track,
  });
});

export const updateTrack = asyncHandler(async (req, res, next) => {
  let track = await Track.findById(req.params.id);

  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  if (req.file) {
    const { secure_url: image } = await uploadToCloudinary(req.file.path);

    if (!image) {
      return next(new ErrorResponse("Image upload failed", BAD_REQUEST));
    }

    req.body.image = image;
  }

  track = await Track.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(OK_S).json({
    success: true,
    message: "Track updated successfully",
    track,
  });
});

export const deleteTrack = asyncHandler(async (req, res, next) => {
  const track = await Track.findById(req.params.id);

  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  await track.deleteOne();

  /**
   * @todo
   *
   * 1. Delete related courses and image
   * 2. Delete track image from storage
   */

  res.status(OK_S).json({
    success: true,
    message: "Track deleted successfully",
  });
});
