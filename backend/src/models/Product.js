import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        unit: {
            type: String,
            required: true,
            enum: ["PCS", "KG", "MTR", "LTR", "BOX"],
        },

        basePrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;