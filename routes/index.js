import express from "express";

import userRoutes from "./userRoutes.js";
import courseRoutes from "./courseRoutes.js";
import learnerRoutes from "./learnerRoutes.js";
import revenueRoutes from "./revenueRoutes.js";
import invoiceRoutes from "./invoiceRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import paystackWebhookRoutes from "./paystackWebhookRoutes.js";
import trackRoutes from "./trackRoutes.js";
import courseRegistrationRoutes from "./courseRegistrationRoutes.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/courses", courseRoutes);
router.use("/learners", learnerRoutes);
router.use("/revenues", revenueRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/tracks", trackRoutes);
router.use("/registrations", courseRegistrationRoutes);
router.use("/webhooks/paystack", paystackWebhookRoutes);

export default router;
