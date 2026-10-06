import express from "express";

import {
    getInventory,
    getInventoryByProduct,
    updateInventory,
} from "../controllers/inventoryController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// View all inventory
router.get(
    "/",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getInventory
);


// View inventory for one product
router.get(
    "/:productId",
    protect,
    authorize("ADMIN", "SALES_USER"),
    getInventoryByProduct
);


// Update inventory
// ADMIN only
router.patch(
    "/:productId",
    protect,
    authorize("ADMIN"),
    updateInventory
);

export default router;