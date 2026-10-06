import mongoose from "mongoose";
import Dispatch from "../models/Dispatch.js";
import SalesOrder from "../models/SalesOrder.js";
import SalesOrderItem from "../models/SalesOrderItem.js";
import Inventory from "../models/Inventory.js";

export const createDispatch = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        const { dispatchNumber } = req.body;

        if (!dispatchNumber) {
            throw new Error("Dispatch number is required");
        }

        const salesOrder = await SalesOrder.findById(id).session(session);

        if (!salesOrder) {
            throw new Error("Sales order not found");
        }

        if (salesOrder.status !== "CONFIRMED") {
            throw new Error(
                `Sales order cannot be dispatched because current status is ${salesOrder.status}`
            );
        }

        const existingDispatch = await Dispatch.findOne({
            salesOrder: salesOrder._id,
        }).session(session);

        if (existingDispatch) {
            throw new Error(
                "This sales order has already been dispatched"
            );
        }

        const orderItems = await SalesOrderItem.find({
            salesOrder: salesOrder._id,
        }).session(session);

        if (!orderItems.length) {
            throw new Error("Sales order has no products");
        }

        const dispatchedProducts = [];

        for (const item of orderItems) {
            const inventory = await Inventory.findOneAndUpdate(
                {
                    product: item.product,

                    // Make sure reserved stock is enough
                    reservedQuantity: {
                        $gte: item.quantity,
                    },

                    // Make sure physical stock is enough
                    physicalQuantity: {
                        $gte: item.quantity,
                    },
                },
                {
                    $inc: {
                        physicalQuantity: -item.quantity,
                        reservedQuantity: -item.quantity,
                    },
                },
                {
                    new: true,
                    session,
                }
            ).populate("product");

            if (!inventory) {
                throw new Error(
                    `Insufficient reserved inventory for product ${item.product}`
                );
            }

            dispatchedProducts.push({
                product: inventory.product,
                dispatchedQuantity: item.quantity,
                remainingPhysicalQuantity:
                    inventory.physicalQuantity,
                remainingReservedQuantity:
                    inventory.reservedQuantity,
            });
        }

        const dispatch = await Dispatch.create(
            [
                {
                    dispatchNumber,
                    salesOrder: salesOrder._id,
                    createdBy: req.user._id,
                    status: "DISPATCHED",
                },
            ],
            { session }
        );

        salesOrder.status = "DISPATCHED";

        await salesOrder.save({ session });

        await session.commitTransaction();

        const populatedDispatch = await Dispatch.findById(dispatch[0]._id)
            .populate("salesOrder")
            .populate("createdBy", "fullName email role");

        return res.status(201).json({
            success: true,
            message: "Sales order dispatched successfully",
            dispatch: populatedDispatch,
            dispatchedProducts,
        });
    } catch (error) {
        await session.abortTransaction();

        console.error("Dispatch error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    } finally {
        session.endSession();
    }
};

export const getDispatches = async (req, res) => {
    try {
        const dispatches = await Dispatch.find()
            .populate("salesOrder")
            .populate("createdBy", "fullName email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: dispatches.length,
            dispatches,
        });
    } catch (error) {
        console.error("Get dispatches error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dispatches",
        });
    }
};