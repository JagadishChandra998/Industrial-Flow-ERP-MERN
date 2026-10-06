import express from "express";

import {
    createDispatch,
    getDispatches,
} from "../controllers/dispatchController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/:id",
    protect,
    authorize("ADMIN", "SALES_USER"),
    createDispatch
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getDispatches
);

export default router;