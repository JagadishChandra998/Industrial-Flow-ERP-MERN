import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

// GET all inventory
export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find()
            .populate(
                "product",
                "productCode productName category unit basePrice"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: inventory.length,
            inventory,
        });
    } catch (error) {
        console.error("Get inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory",
        });
    }
};


// GET inventory by product
export const getInventoryByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const inventory = await Inventory.findOne({
            product: productId,
        }).populate(
            "product",
            "productCode productName category unit basePrice"
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found for this product",
            });
        }

        return res.status(200).json({
            success: true,
            inventory,
        });
    } catch (error) {
        console.error("Get inventory by product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch inventory",
        });
    }
};


// UPDATE physical inventory
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { physicalQuantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            physicalQuantity === undefined ||
            physicalQuantity === null
        ) {
            return res.status(400).json({
                success: false,
                message: "physicalQuantity is required",
            });
        }

        if (
            typeof physicalQuantity !== "number" ||
            !Number.isFinite(physicalQuantity)
        ) {
            return res.status(400).json({
                success: false,
                message: "physicalQuantity must be a valid number",
            });
        }

        if (physicalQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "physicalQuantity cannot be negative",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const inventory = await Inventory.findOne({
            product: productId,
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found for this product",
            });
        }

        if (physicalQuantity < inventory.reservedQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    `Physical quantity cannot be less than reserved quantity (${inventory.reservedQuantity})`,
            });
        }

        inventory.physicalQuantity = physicalQuantity;

        await inventory.save();

        const updatedInventory = await Inventory.findById(inventory._id)
            .populate(
                "product",
                "productCode productName category unit basePrice"
            );

        return res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            inventory: updatedInventory,
        });
    } catch (error) {
        console.error("Update inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update inventory",
        });
    }
};