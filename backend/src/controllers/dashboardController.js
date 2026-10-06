import Customer from "../models/Customer.js";
import Enquiry from "../models/Enquiry.js";
import Quotation from "../models/Quotation.js";
import SalesOrder from "../models/SalesOrder.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

export const getDashboard = async (req, res) => {
    try {
        const [
            customerCount,
            enquiryCount,
            quotationCount,
            salesOrderCount,
            productCount,
            inventoryRecords,
        ] = await Promise.all([
            Customer.countDocuments(),
            Enquiry.countDocuments(),
            Quotation.countDocuments(),
            SalesOrder.countDocuments(),
            Product.countDocuments(),
            Inventory.find().populate(
                "product",
                "productCode productName category unit"
            ),
        ]);

        const totalSalesResult =
            await SalesOrder.aggregate([
                {
                    $match: {
                        status: {
                            $ne: "CANCELLED",
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSales: {
                            $sum: "$totalAmount",
                        },
                    },
                },
            ]);

        const totalSales =
            totalSalesResult.length > 0
                ? totalSalesResult[0].totalSales
                : 0;

        const lowStock = inventoryRecords.filter(
            (item) => {
                const available =
                    item.physicalQuantity -
                    item.reservedQuantity;

                return available <= 10;
            }
        );

        res.json({
            success: true,

            summary: {
                customers: customerCount,
                enquiries: enquiryCount,
                quotations: quotationCount,
                salesOrders: salesOrderCount,
                products: productCount,
                totalSales,
            },

            lowStock,
        });
    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard",
        });
    }
};