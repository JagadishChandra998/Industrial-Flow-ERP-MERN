import express from "express";

import {
    createQuotation,
    getQuotations,
    updateQuotationStatus,
} from "../controllers/quotationController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    createQuotation
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getQuotations
);

router.patch(
    "/:id/status",
    protect,
    authorize("ADMIN", "SALES_USER"),
    updateQuotationStatus
);

export default router;