import express from "express";
import { confirmSalesOrder } from "../controllers/inventoryReservationController.js";
import {protect, authorize} from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch(
    "/:id/confirm",
    protect,
    authorize("ADMIN", "SALES_USER"),
    confirmSalesOrder
);

export default router;