import mongoose from "mongoose";
import SalesOrder from "../models/SalesOrder.js";
import SalesOrderItem from "../models/SalesOrderItem.js";
import Inventory from "../models/Inventory.js";

export const confirmSalesOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;

        const salesOrder = await SalesOrder.findById(id).session(session);

        if (!salesOrder) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Sales order not found",
            });
        }

        if (salesOrder.status !== "PENDING") {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: `Sales order cannot be confirmed because current status is ${salesOrder.status}`,
            });
        }

        const orderItems = await SalesOrderItem.find({
            salesOrder: salesOrder._id,
        }).session(session);

        if (!orderItems.length) {
            throw new Error("Sales order has no products");
        }

        const reservedProducts = [];

        for (const item of orderItems) {
            const inventory = await Inventory.findOneAndUpdate(
                {
                    product: item.product,
                    $expr: {
                        $gte: [
                            {
                                $subtract: [
                                    "$physicalQuantity",
                                    "$reservedQuantity",
                                ],
                            },
                            item.quantity,
                        ],
                    },
                },
                {
                    $inc: {
                        reservedQuantity: item.quantity,
                    },
                },
                {
                    new: true,
                    session,
                }
            ).populate("product");

            if (!inventory) {
                throw new Error(
                    `Insufficient inventory for product ${item.product}`
                );
            }

            reservedProducts.push({
                product: inventory.product,
                reservedQuantity: item.quantity,
                availableQuantity:
                    inventory.physicalQuantity -
                    inventory.reservedQuantity,
            });
        }

        salesOrder.status = "CONFIRMED";
        await salesOrder.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Sales order confirmed and inventory reserved successfully",
            salesOrder,
            reservedProducts,
        });
    } catch (error) {
        await session.abortTransaction();

        console.error("Inventory reservation error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    } finally {
        session.endSession();
    }
};