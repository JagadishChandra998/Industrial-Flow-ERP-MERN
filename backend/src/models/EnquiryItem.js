import mongoose from "mongoose";

const enquiryItemSchema = new mongoose.Schema(
    {
        enquiry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enquiry",
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
    },
    {
        timestamps: true,
    }
);

const EnquiryItem = mongoose.model(
    "EnquiryItem",
    enquiryItemSchema
);

export default EnquiryItem;