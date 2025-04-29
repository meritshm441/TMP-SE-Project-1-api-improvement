import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import validateRequestBody from "../middlewares/validationMiddleware.js";
import { invoiceSchema } from "../schemas/invoiceSchemas.js";
import {
  isAdminMiddleware,
  verifyUserMiddleware,
} from "../middlewares/userMiddleware.js";

const router = express.Router();

// Protected routes
router.use(verifyUserMiddleware);

router
  .route("/")
  .get(getInvoices)
  .post(isAdminMiddleware, validateRequestBody(invoiceSchema), createInvoice);

router
  .route("/:id")
  .get(getInvoiceById)
  .put(isAdminMiddleware, validateRequestBody(invoiceSchema), updateInvoice)
  .delete(isAdminMiddleware, deleteInvoice);

export default router;
