import express from "express";

import {
    createProduct,
    getProducts,
} from "../controllers/productController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createProduct
);

router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getProducts
);

export default router;