import mongoose from "mongoose";

const trackRatingSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent multiple ratings from same learner for a track
trackRatingSchema.index({ learner: 1, track: 1 }, { unique: true });

export const TrackRating = mongoose.model("TrackRating", trackRatingSchema);
