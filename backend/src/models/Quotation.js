import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
    {
        quotationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        enquiry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enquiry",
            required: true,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        validUntil: {
            type: Date,
            required: true,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["DRAFT", "SENT", "ACCEPTED", "REJECTED"],
            default: "DRAFT",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;