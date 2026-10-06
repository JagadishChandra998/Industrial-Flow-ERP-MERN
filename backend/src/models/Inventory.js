import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },

        physicalQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        reservedQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Available = Physical - Reserved
inventorySchema.virtual("availableQuantity").get(function () {
    return this.physicalQuantity - this.reservedQuantity;
});

inventorySchema.set("toJSON", {
    virtuals: true,
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;