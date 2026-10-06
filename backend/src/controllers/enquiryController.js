import Enquiry from "../models/Enquiry.js";
import EnquiryItem from "../models/EnquiryItem.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

export const createEnquiry = async (req, res) => {
    try {
        const {
            enquiryNumber,
            customerId,
            requiredDate,
            notes,
            products,
        } = req.body;

        if (
            !enquiryNumber ||
            !customerId ||
            !requiredDate ||
            !products ||
            products.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Enquiry number, customer, required date and products are required",
            });
        }

        const existingEnquiry = await Enquiry.findOne({
            enquiryNumber,
        });

        if (existingEnquiry) {
            return res.status(409).json({
                success: false,
                message: "Enquiry number already exists",
            });
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Validate every product before creating anything
        for (const item of products) {
            if (!item.productId || !item.quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each enquiry product requires productId and quantity",
                });
            }

            if (item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Product quantity must be greater than 0",
                });
            }

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                });
            }
        }

        const enquiry = await Enquiry.create({
            enquiryNumber,
            customer: customerId,
            requiredDate,
            notes,
            createdBy: req.user._id,
            status: "NEW",
        });

        const enquiryItems = products.map((item) => ({
            enquiry: enquiry._id,
            product: item.productId,
            quantity: item.quantity,
        }));

        await EnquiryItem.insertMany(enquiryItems);

        const populatedEnquiry = await Enquiry.findById(enquiry._id)
            .populate("customer")
            .populate("createdBy", "fullName email role");

        const items = await EnquiryItem.find({
            enquiry: enquiry._id,
        }).populate(
            "product",
            "productCode productName category unit basePrice"
        );

        res.status(201).json({
            success: true,
            message: "Enquiry created successfully",
            enquiry: populatedEnquiry,
            products: items,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create enquiry",
        });
    }
};

export const getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find()
            .populate(
                "customer",
                "companyName contactPerson mobile email city"
            )
            .populate(
                "createdBy",
                "fullName email role"
            )
            .sort({ createdAt: -1 })
            .lean();

        for (const enquiry of enquiries) {
            enquiry.products = await EnquiryItem.find({
                enquiry: enquiry._id,
            })
                .populate(
                    "product",
                    "productCode productName category unit basePrice"
                )
                .lean();
        }

        res.status(200).json({
            success: true,
            count: enquiries.length,
            enquiries,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch enquiries",
        });
    }
};