import { Course } from "../models/courseModel.js";
import { Track } from "../models/trackModel.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK_S } from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createCourse = asyncHandler(async (req, res, next) => {
  const { track: trackId } = req.body;

  if (!req.file) {
    return next(new ErrorResponse("Image is required", BAD_REQUEST));
  }

  // Verify track exists
  const track = await Track.findById(trackId);
  if (!track) {
    return next(new ErrorResponse("Track not found", NOT_FOUND));
  }

  const { secure_url: image } = await uploadToCloudinary(req.file.path);

  if (!image) {
    return next(new ErrorResponse("Image upload failed", BAD_REQUEST));
  }

  const admin = req.user.id;

  const courseData = {
    ...req.body,
    admin,
    image,
  };

  const course = await Course.create(courseData);

  const populatedCourse = await Course.findById(course._id)
    .populate("admin")
    .populate("track");

  res.status(CREATED).json({
    success: true,
    message: "Course created successfully",
    course: populatedCourse,
  });
});

export const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("admin").populate("track");

  res.status(OK_S).json({
    success: true,
    count: courses.length,
    courses,
  });
});

export const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("admin")
    .populate("track");

  if (!course) {
    return next(new ErrorResponse("Course not found", NOT_FOUND));
  }

  res.status(OK_S).json({
    success: true,
    course,
  });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse("Course not found", NOT_FOUND));
  }

  if (req.body.track) {
    const track = await Track.findById(req.body.track);
    if (!track) {
      return next(new ErrorResponse("Track not found", NOT_FOUND));
    }
  }

  if (req.file) {
    const { secure_url: image } = await uploadToCloudinary(req.file.path);

    if (!image) {
      return next(new ErrorResponse("Image upload failed", BAD_REQUEST));
    }

    req.body.image = image;
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(OK_S).json({
    success: true,
    message: "Course updated successfully",
    course,
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse("Course not found", BAD_REQUEST));
  }

  await course.deleteOne();

  res.status(OK_S).json({
    success: true,
    message: "Course deleted successfully",
  });
});
