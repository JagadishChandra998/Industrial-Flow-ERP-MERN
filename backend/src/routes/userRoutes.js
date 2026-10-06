import express from "express";

import {
    createSalesUser,
    getUsers,
} from "../controllers/userController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ADMIN creates SALES_USER
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createSalesUser
);


// ADMIN views users
router.get(
    "/",
    protect,
    authorize("ADMIN"),
    getUsers
);

export default router;