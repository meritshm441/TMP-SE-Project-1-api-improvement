import express from "express";
import {
  createTrack,
  getTracks,
  getTrack,
  updateTrack,
  deleteTrack,
} from "../controllers/trackController.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import { trackSchema, updateTrackSchema } from "../schemas/trackSchemas.js";
import { uploadSingleImageFile } from "../middlewares/uploadMIddleware.js";
import {
  isAdminMiddleware,
  userIsVerifiedMiddleware,
  verifyUserMiddleware,
} from "../middlewares/userMiddleware.js";
import {
  getTrackRatings,
  rateTrack,
} from "../controllers/trackRatingController.js";
import { trackRatingSchema } from "../schemas/trackRatingSchemas.js";

const router = express.Router();

// Public routes
router.get("/", getTracks);
router.get("/:id", getTrack);
router
  .route("/:id/ratings")
  .get(getTrackRatings)
  .post(
    verifyUserMiddleware,
    validateRequestBody(trackRatingSchema),
    rateTrack
  );

// Protected routes (Admin only)
router.use(verifyUserMiddleware, userIsVerifiedMiddleware, isAdminMiddleware);
router.post(
  "/",
  uploadSingleImageFile("image"),
  validateRequestBody(trackSchema),
  createTrack
);
router.put(
  "/:id",
  uploadSingleImageFile("image"),
  validateRequestBody(updateTrackSchema),
  updateTrack
);
router.delete("/:id", deleteTrack);

export default router;
