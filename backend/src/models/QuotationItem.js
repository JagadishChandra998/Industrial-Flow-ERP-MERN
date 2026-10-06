import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
    {
        quotation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
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

        discountPercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },

        gstPercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },

        baseAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        discountAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        taxableAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        gstAmount: {
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

const QuotationItem = mongoose.model(
    "QuotationItem",
    quotationItemSchema
);

export default QuotationItem;