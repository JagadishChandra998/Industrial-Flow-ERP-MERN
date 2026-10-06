import express from "express";

import {
    getDashboard,
} from "../controllers/dashboardController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getDashboard
);

export default router;