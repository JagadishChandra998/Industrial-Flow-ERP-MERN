import mongoose from "mongoose";
import SalesOrder from "../models/SalesOrder.js";
import SalesOrderItem from "../models/SalesOrderItem.js";
import Quotation from "../models/Quotation.js";
import QuotationItem from "../models/QuotationItem.js";


// CREATE SALES ORDER FROM ACCEPTED QUOTATION
export const createSalesOrder = async (req, res) => {
    try {
        const {
            orderNumber,
            quotationId,
        } = req.body;

        if (!orderNumber || !quotationId) {
            return res.status(400).json({
                success: false,
                message:
                    "orderNumber and quotationId are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(quotationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quotation ID",
            });
        }

        // Check duplicate order number
        const existingOrder = await SalesOrder.findOne({
            orderNumber,
        });

        if (existingOrder) {
            return res.status(409).json({
                success: false,
                message: "Sales order number already exists",
            });
        }

        // Find quotation
        const quotation = await Quotation.findById(
            quotationId
        );

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        // Only ACCEPTED quotation can create order
        if (quotation.status !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message:
                    "Sales order can only be created from an ACCEPTED quotation",
            });
        }

        // Check whether this quotation already has an order
        const existingQuotationOrder =
            await SalesOrder.findOne({
                quotation: quotationId,
            });

        if (existingQuotationOrder) {
            return res.status(409).json({
                success: false,
                message:
                    "A sales order already exists for this quotation",
            });
        }

        // Get quotation items
        const quotationItems =
            await QuotationItem.find({
                quotation: quotationId,
            });

        if (quotationItems.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Quotation has no products",
            });
        }

        // Create sales order
        const salesOrder = await SalesOrder.create({
            orderNumber,
            quotation: quotation._id,
            customer: quotation.customer,
            totalAmount: quotation.totalAmount,
            status: "PENDING",
            createdBy: req.user._id,
        });

        // Convert quotation items into sales order items
        const salesOrderItems =
            quotationItems.map((item) => ({
                salesOrder: salesOrder._id,
                product: item.product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineAmount: item.lineAmount,
            }));

        await SalesOrderItem.insertMany(
            salesOrderItems
        );

        // Populate response
        const populatedOrder =
            await SalesOrder.findById(
                salesOrder._id
            )
                .populate("customer")
                .populate(
                    "quotation",
                    "quotationNumber status totalAmount"
                )
                .populate(
                    "createdBy",
                    "fullName email role"
                );

        const items =
            await SalesOrderItem.find({
                salesOrder: salesOrder._id,
            }).populate(
                "product",
                "productCode productName category unit basePrice"
            );

        return res.status(201).json({
            success: true,
            message:
                "Sales order created successfully",
            salesOrder: populatedOrder,
            products: items,
        });

    } catch (error) {
        console.error(
            "Create sales order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create sales order",
            error: error.message,
        });
    }
};


// GET ALL SALES ORDERS
export const getSalesOrders = async (req, res) => {
    try {
        const orders = await SalesOrder.find()
            .sort({ createdAt: -1 })
            .populate("customer")
            .populate(
                "quotation",
                "quotationNumber status totalAmount"
            )
            .populate(
                "createdBy",
                "fullName email role"
            );

        const result = [];

        for (const order of orders) {
            const items =
                await SalesOrderItem.find({
                    salesOrder: order._id,
                }).populate(
                    "product",
                    "productCode productName category unit basePrice"
                );

            result.push({
                ...order.toObject(),
                products: items,
            });
        }

        return res.status(200).json({
            success: true,
            count: result.length,
            salesOrders: result,
        });

    } catch (error) {
        console.error(
            "Get sales orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch sales orders",
            error: error.message,
        });
    }
};