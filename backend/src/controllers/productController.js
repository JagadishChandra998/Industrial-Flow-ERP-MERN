import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

export const createProduct = async (req, res) => {
    try {
        const {
            productCode,
            productName,
            category,
            unit,
            basePrice,
            physicalQuantity = 0,
        } = req.body;

        if (
            !productCode ||
            !productName ||
            !category ||
            !unit ||
            basePrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All product fields are required",
            });
        }

        if (physicalQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Physical quantity cannot be negative",
            });
        }

        const existingProduct = await Product.findOne({
            productCode: productCode.toUpperCase(),
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product code already exists",
            });
        }

        const product = await Product.create({
            productCode,
            productName,
            category,
            unit,
            basePrice,
        });

        await Inventory.create({
            product: product._id,
            physicalQuantity,
            reservedQuantity: 0,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .lean();

        const inventory = await Inventory.find()
            .populate("product", "productCode productName");

        const inventoryMap = new Map();

        inventory.forEach((item) => {
            inventoryMap.set(item.product._id.toString(), item);
        });

        const result = products.map((product) => {
            const stock = inventoryMap.get(product._id.toString());

            return {
                ...product,
                inventory: stock
                    ? {
                          physicalQuantity: stock.physicalQuantity,
                          reservedQuantity: stock.reservedQuantity,
                          availableQuantity:
                              stock.physicalQuantity -
                              stock.reservedQuantity,
                      }
                    : null,
            };
        });

        res.status(200).json({
            success: true,
            count: result.length,
            products: result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};