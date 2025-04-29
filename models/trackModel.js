import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

trackSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "track",
});

trackSchema.virtual("ratings", {
  ref: "TrackRating",
  localField: "_id",
  foreignField: "track",
});

export const Track = mongoose.model("Track", trackSchema);
