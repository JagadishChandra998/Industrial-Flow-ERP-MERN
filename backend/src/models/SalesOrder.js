import mongoose from "mongoose";

const salesOrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        quotation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
            required: true,
            unique: true,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        orderDate: {
            type: Date,
            default: Date.now,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "DISPATCHED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const SalesOrder = mongoose.model(
    "SalesOrder",
    salesOrderSchema
);

export default SalesOrder;