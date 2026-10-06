import express from "express";

import {
    createEnquiry,
    getEnquiries,
} from "../controllers/enquiryController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    createEnquiry
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getEnquiries
);

export default router;