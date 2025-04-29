import express from "express";
import {
  registerForCourse,
  getCourseRegistrations,
} from "../controllers/courseRegistrationController.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import { courseRegistrationSchema } from "../schemas/courseRegistrationSchemas.js";
import { verifyUserMiddleware } from "../middlewares/userMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyUserMiddleware);

router.post(
  "/",
  validateRequestBody(courseRegistrationSchema),
  registerForCourse
);
router.get("/", getCourseRegistrations);

export default router;
