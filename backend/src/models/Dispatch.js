import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema(
    {
        dispatchNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        salesOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalesOrder",
            required: true,
            unique: true,
        },

        dispatchDate: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ["DISPATCHED"],
            default: "DISPATCHED",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Dispatch = mongoose.model("Dispatch", dispatchSchema);

export default Dispatch;