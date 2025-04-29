import mongoose from "mongoose";

const courseRegistrationSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate registrations
courseRegistrationSchema.index({ learner: 1, course: 1 }, { unique: true });

export const CourseRegistration = mongoose.model(
  "CourseRegistration",
  courseRegistrationSchema
);
