import express from "express";

import {
    createSalesOrder,
    getSalesOrders,
} from "../controllers/salesOrderController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    createSalesOrder
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getSalesOrders
);

export default router;