import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            mobile,
            email,
            city,
        } = req.body;

        if (
            !companyName ||
            !contactPerson ||
            !mobile ||
            !email ||
            !city
        ) {
            return res.status(400).json({
                success: false,
                message: "All customer fields are required",
            });
        }

        const customer = await Customer.create({
            companyName,
            contactPerson,
            mobile,
            email,
            city,
        });

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create customer",
        });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customers.length,
            customers,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
        });
    }
};