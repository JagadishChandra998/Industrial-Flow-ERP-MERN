import mongoose from "mongoose";

const salesOrderItemSchema = new mongoose.Schema(
    {
        salesOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalesOrder",
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        lineAmount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

const SalesOrderItem = mongoose.model(
    "SalesOrderItem",
    salesOrderItemSchema
);

export default SalesOrderItem;