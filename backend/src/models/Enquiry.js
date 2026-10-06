import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
    {
        enquiryNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        enquiryDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        requiredDate: {
            type: Date,
            required: true,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["NEW", "QUOTED", "WON", "LOST"],
            default: "NEW",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;