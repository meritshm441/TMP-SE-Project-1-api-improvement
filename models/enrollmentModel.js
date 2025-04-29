import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ learner: 1, track: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
