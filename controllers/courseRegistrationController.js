import { CourseRegistration } from "../models/courseRegistrationModel.js";
import { Course } from "../models/courseModel.js";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK_S } from "../constant/http.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import { ErrorResponse } from "../utils/error.js";
import { Enrollment } from "../models/enrollmentModel.js";

export const registerForCourse = asyncHandler(async (req, res, next) => {
  const learner = req.user.id;
  const { course: courseId } = req.body;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse("Course not found", NOT_FOUND));
  }

  // Check if learner is enrolled to a track
  const learnerIsEnrolled = await Enrollment.findOne({
    learner,
    track: course.track,
  });

  if (!learnerIsEnrolled) {
    return next(
      new ErrorResponse(
        "You must enroll to this course track before registering to this course",
        BAD_REQUEST
      )
    );
  }

  // Check if already registered
  const existingRegistration = await CourseRegistration.findOne({
    learner: learner,
    course: courseId,
  });

  if (existingRegistration) {
    return next(
      new ErrorResponse(
        "You are already registered for this course",
        BAD_REQUEST
      )
    );
  }

  const registration = await CourseRegistration.create({
    learner: learner,
    course: courseId,
  });

  const populatedRegistration = await CourseRegistration.findById(
    registration._id
  )
    .populate("learner")
    .populate("course");

  res.status(CREATED).json({
    success: true,
    message: "Successfully registered for course",
    registration: populatedRegistration,
  });
});

export const getCourseRegistrations = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const query = {};

  if (user.role === "Learner") {
    query.learner = req.user.id;
  }

  const registrations = await CourseRegistration.find(query)
    .populate("course")
    .sort("-date");

  res.status(OK_S).json({
    success: true,
    count: registrations.length,
    registrations,
  });
});
