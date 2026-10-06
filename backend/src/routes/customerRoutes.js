import express from "express";

import {
    createCustomer,
    getCustomers,
} from "../controllers/customerController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    createCustomer
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getCustomers
);

export default router;