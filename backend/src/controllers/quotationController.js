import mongoose from "mongoose";
import Quotation from "../models/Quotation.js";
import QuotationItem from "../models/QuotationItem.js";
import Enquiry from "../models/Enquiry.js";
import EnquiryItem from "../models/EnquiryItem.js";
import Product from "../models/Product.js";

const round2 = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};


// CREATE QUOTATION
export const createQuotation = async (req, res) => {
    try {
        const {
            quotationNumber,
            enquiryId,
            validUntil,
            products,
        } = req.body;

        if (
            !quotationNumber ||
            !enquiryId ||
            !validUntil ||
            !Array.isArray(products) ||
            products.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "quotationNumber, enquiryId, validUntil and products are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID",
            });
        }

        // Check duplicate quotation number
        const existingQuotation = await Quotation.findOne({
            quotationNumber,
        });

        if (existingQuotation) {
            return res.status(409).json({
                success: false,
                message: "Quotation number already exists",
            });
        }

        // Find enquiry
        const enquiry = await Enquiry.findById(enquiryId);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
        }

        // Cannot create quotation for completed/lost enquiry
        if (["WON", "LOST"].includes(enquiry.status)) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot create quotation for enquiry with status ${enquiry.status}`,
            });
        }

        // Get enquiry items
        const enquiryItems = await EnquiryItem.find({
            enquiry: enquiryId,
        });

        if (enquiryItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Enquiry has no products",
            });
        }

        let totalAmount = 0;
        const quotationItemsData = [];

        for (const item of products) {
            const {
                productId,
                quantity,
                unitPrice,
                discountPercent = 0,
                gstPercent = 0,
            } = item;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid product ID: ${productId}`,
                });
            }

            if (!quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than 0",
                });
            }

            if (
                discountPercent < 0 ||
                discountPercent > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Discount must be between 0 and 100",
                });
            }

            if (
                gstPercent < 0 ||
                gstPercent > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "GST must be between 0 and 100",
                });
            }

            // Make sure product belongs to enquiry
            const enquiryItem = enquiryItems.find(
                (ei) => ei.product.toString() === productId
            );

            if (!enquiryItem) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Product is not part of this enquiry",
                });
            }

            // Quantity cannot exceed enquiry quantity
            if (quantity > enquiryItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Quotation quantity cannot exceed enquiry quantity for product ${productId}`,
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${productId}`,
                });
            }

            // If unit price is not supplied, use product base price
            const finalUnitPrice =
                unitPrice !== undefined
                    ? Number(unitPrice)
                    : product.basePrice;

            if (
                !Number.isFinite(finalUnitPrice) ||
                finalUnitPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid unit price",
                });
            }

            // Calculations
            const baseAmount = round2(
                quantity * finalUnitPrice
            );

            const discountAmount = round2(
                (baseAmount * discountPercent) / 100
            );

            const taxableAmount = round2(
                baseAmount - discountAmount
            );

            const gstAmount = round2(
                (taxableAmount * gstPercent) / 100
            );

            const lineAmount = round2(
                taxableAmount + gstAmount
            );

            totalAmount = round2(
                totalAmount + lineAmount
            );

            quotationItemsData.push({
                product: productId,
                quantity,
                unitPrice: finalUnitPrice,
                discountPercent,
                gstPercent,
                baseAmount,
                discountAmount,
                taxableAmount,
                gstAmount,
                lineAmount,
            });
        }

        // Create quotation
        const quotation = await Quotation.create({
            quotationNumber,
            enquiry: enquiry._id,
            customer: enquiry.customer,
            validUntil,
            totalAmount,
            status: "DRAFT",
            createdBy: req.user._id,
        });

        // Create quotation items
        const itemsWithQuotation = quotationItemsData.map(
            (item) => ({
                ...item,
                quotation: quotation._id,
            })
        );

        await QuotationItem.insertMany(itemsWithQuotation);

        // Update enquiry status
        enquiry.status = "QUOTED";
        await enquiry.save();

        const populatedQuotation =
            await Quotation.findById(quotation._id)
                .populate("customer")
                .populate(
                    "enquiry",
                    "enquiryNumber status requiredDate"
                )
                .populate(
                    "createdBy",
                    "fullName email role"
                );

        const quotationItems =
            await QuotationItem.find({
                quotation: quotation._id,
            }).populate(
                "product",
                "productCode productName category unit basePrice"
            );

        return res.status(201).json({
            success: true,
            message: "Quotation created successfully",
            quotation: populatedQuotation,
            products: quotationItems,
        });

    } catch (error) {
        console.error("Create quotation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create quotation",
            error: error.message,
        });
    }
};


// GET ALL QUOTATIONS
export const getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find()
            .sort({ createdAt: -1 })
            .populate("customer")
            .populate(
                "enquiry",
                "enquiryNumber status requiredDate"
            )
            .populate(
                "createdBy",
                "fullName email role"
            );

        const result = [];

        for (const quotation of quotations) {
            const items = await QuotationItem.find({
                quotation: quotation._id,
            }).populate(
                "product",
                "productCode productName category unit basePrice"
            );

            result.push({
                ...quotation.toObject(),
                products: items,
            });
        }

        return res.status(200).json({
            success: true,
            count: result.length,
            quotations: result,
        });

    } catch (error) {
        console.error("Get quotations error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch quotations",
            error: error.message,
        });
    }
};


// UPDATE QUOTATION STATUS
export const updateQuotationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "SENT",
            "ACCEPTED",
            "REJECTED",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be SENT, ACCEPTED or REJECTED",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quotation ID",
            });
        }

        const quotation = await Quotation.findById(id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        // DRAFT → SENT
        if (
            quotation.status === "DRAFT" &&
            status !== "SENT"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Draft quotation must be sent before acceptance or rejection",
            });
        }

        // SENT → ACCEPTED / REJECTED
        if (
            quotation.status === "SENT" &&
            !["ACCEPTED", "REJECTED"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Sent quotation can only be accepted or rejected",
            });
        }

        // Prevent changes after final state
        if (
            ["ACCEPTED", "REJECTED"].includes(
                quotation.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quotation is already in a final state",
            });
        }

        // Only one quotation can be accepted for an enquiry
        if (status === "ACCEPTED") {
            const alreadyAccepted =
                await Quotation.findOne({
                    enquiry: quotation.enquiry,
                    status: "ACCEPTED",
                    _id: { $ne: quotation._id },
                });

            if (alreadyAccepted) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another quotation for this enquiry is already accepted",
                });
            }
        }

        quotation.status = status;
        await quotation.save();

        // Update enquiry
        if (status === "ACCEPTED") {
            await Enquiry.findByIdAndUpdate(
                quotation.enquiry,
                { status: "WON" }
            );
        }

        if (status === "REJECTED") {
            await Enquiry.findByIdAndUpdate(
                quotation.enquiry,
                { status: "LOST" }
            );
        }

        return res.status(200).json({
            success: true,
            message: `Quotation ${status.toLowerCase()} successfully`,
            quotation,
        });

    } catch (error) {
        console.error("Update quotation status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update quotation status",
            error: error.message,
        });
    }
};