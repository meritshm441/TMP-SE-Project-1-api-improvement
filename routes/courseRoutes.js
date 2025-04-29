import express from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import { courseSchema, updateCourseSchema } from "../schemas/courseSchemas.js";
import {
  isAdminMiddleware,
  userIsVerifiedMiddleware,
  verifyUserMiddleware,
} from "../middlewares/userMiddleware.js";
import { uploadSingleImageFile } from "../middlewares/uploadMIddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourse);

// Protected routes (Admin only)
router.use(verifyUserMiddleware, userIsVerifiedMiddleware, isAdminMiddleware);
router.post(
  "/",
  uploadSingleImageFile("image"),
  validateRequestBody(courseSchema),
  createCourse
);
router.put(
  "/:id",
  uploadSingleImageFile("image"),
  validateRequestBody(updateCourseSchema),
  updateCourse
);
router.delete("/:id", deleteCourse);

export default router;
