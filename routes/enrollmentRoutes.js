import express from "express";
import {
  enrollTrack,
  getEnrollments,
  cancelEnrollment,
} from "../controllers/enrollmentController.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import { enrollmentSchema } from "../schemas/enrollmentSchemas.js";
import {
  profileIsCompletedMiddleware,
  verifyUserMiddleware,
} from "../middlewares/userMiddleware.js";

const router = express.Router();

// All routes are protected for authenticated users
router.use(verifyUserMiddleware);

router.post(
  "/",
  profileIsCompletedMiddleware,
  validateRequestBody(enrollmentSchema),
  enrollTrack
);
router.get("/", getEnrollments);
router.delete("/:id", cancelEnrollment);

export default router;
