import { useEffect, useState } from "react";
import api from "../services/api";

const SalesOrders = () => {
    const [quotations, setQuotations] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);

    const [formData, setFormData] = useState({
        orderNumber: "",
        quotationId: "",
    });

    const [selectedQuotation, setSelectedQuotation] =
        useState(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmingOrder, setConfirmingOrder] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // FETCH DATA
    // =========================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                quotationsResponse,
                salesOrdersResponse,
            ] = await Promise.all([
                api.get("/quotations"),
                api.get("/sales-orders"),
            ]);

            setQuotations(
                quotationsResponse.data.quotations || []
            );

            setSalesOrders(
                salesOrdersResponse.data.salesOrders || []
            );
        } catch (error) {
            console.error(
                "Fetch sales order data error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load sales order data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================
    // QUOTATION SELECTION
    // =========================

    const handleQuotationChange = (e) => {
        const quotationId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            quotationId,
        }));

        if (!quotationId) {
            setSelectedQuotation(null);
            return;
        }

        const quotation = quotations.find(
            (item) => item._id === quotationId
        );

        if (!quotation) {
            setError("Quotation not found");
            setSelectedQuotation(null);
            return;
        }

        setSelectedQuotation(quotation);
        setError("");
        setSuccess("");
    };

    // =========================
    // CREATE SALES ORDER
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!formData.orderNumber.trim()) {
                setError("Order number is required");
                return;
            }

            if (!formData.quotationId) {
                setError("Please select a quotation");
                return;
            }

            const payload = {
                orderNumber:
                    formData.orderNumber.trim(),
                quotationId: formData.quotationId,
            };

            console.log(
                "Sending sales order:",
                payload
            );

            await api.post(
                "/sales-orders",
                payload
            );

            setSuccess(
                "Sales order created successfully."
            );

            setFormData({
                orderNumber: "",
                quotationId: "",
            });

            setSelectedQuotation(null);

            await fetchData();
        } catch (error) {
            console.error(
                "Create sales order error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to create sales order"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // CONFIRM SALES ORDER
    // =========================

    const confirmOrder = async (orderId) => {
        try {
            setConfirmingOrder(true);
            setError("");
            setSuccess("");

            console.log(
                "Confirming sales order:",
                orderId
            );

            await api.patch(
                `/sales-orders/${orderId}/confirm`
            );

            setSuccess(
                "Sales order confirmed and inventory reserved successfully."
            );

            await fetchData();
        } catch (error) {
            console.error(
                "Confirm order error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to confirm sales order"
            );
        } finally {
            setConfirmingOrder(false);
        }
    };

    // =========================
    // RESET
    // =========================

    const resetForm = () => {
        setFormData({
            orderNumber: "",
            quotationId: "",
        });

        setSelectedQuotation(null);
        setError("");
        setSuccess("");
    };

    // =========================
    // STATUS STYLE
    // =========================

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "CONFIRMED":
                return "bg-blue-100 text-blue-700";

            case "DISPATCHED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Sales Orders
                </h1>

                <p className="text-gray-500 mt-1">
                    Create and manage sales orders
                </p>
            </div>

            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* =========================
                SUCCESS MESSAGE
            ========================= */}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* =========================
                CREATE SALES ORDER
            ========================= */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                    Create Sales Order
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* BASIC DETAILS */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* ORDER NUMBER */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Number
                            </label>

                            <input
                                type="text"
                                value={
                                    formData.orderNumber
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        orderNumber:
                                            e.target.value,
                                    })
                                }
                                placeholder="SO-2026-002"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* QUOTATION */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Accepted Quotation
                            </label>

                            <select
                                value={
                                    formData.quotationId
                                }
                                onChange={
                                    handleQuotationChange
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">
                                    Select quotation
                                </option>

                                {quotations
                                    .filter(
                                        (quotation) =>
                                            quotation.status ===
                                            "ACCEPTED"
                                    )
                                    .map(
                                        (quotation) => (
                                            <option
                                                key={
                                                    quotation._id
                                                }
                                                value={
                                                    quotation._id
                                                }
                                            >
                                                {
                                                    quotation.quotationNumber
                                                }
                                            </option>
                                        )
                                    )}
                            </select>
                        </div>

                    </div>

                    {/* =========================
                        QUOTATION DETAILS
                    ========================= */}

                    {selectedQuotation && (
                        <div className="bg-gray-50 rounded-lg p-5">

                            <h3 className="font-semibold text-gray-800 mb-4">
                                Quotation Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">

                                {/* QUOTATION */}

                                <div>
                                    <p className="text-gray-500">
                                        Quotation
                                    </p>

                                    <p className="font-medium">
                                        {
                                            selectedQuotation.quotationNumber
                                        }
                                    </p>
                                </div>

                                {/* CUSTOMER */}

                                <div>
                                    <p className="text-gray-500">
                                        Customer
                                    </p>

                                    <p className="font-medium">
                                        {
                                            selectedQuotation
                                                .customer
                                                ?.companyName ||
                                            "-"
                                        }
                                    </p>
                                </div>

                                {/* STATUS */}

                                <div>
                                    <p className="text-gray-500">
                                        Status
                                    </p>

                                    <p className="font-medium text-green-600">
                                        {
                                            selectedQuotation.status
                                        }
                                    </p>
                                </div>

                                {/* TOTAL */}

                                <div>
                                    <p className="text-gray-500">
                                        Total Amount
                                    </p>

                                    <p className="font-bold">
                                        ₹{" "}
                                        {Number(
                                            selectedQuotation.totalAmount
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </p>
                                </div>

                            </div>

                            {/* =========================
                                PRODUCTS
                            ========================= */}

                            {selectedQuotation.products
                                ?.length > 0 && (
                                <div className="mt-5 overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead>
                                            <tr className="border-b">

                                                <th className="text-left py-3">
                                                    Product
                                                </th>

                                                <th className="text-left py-3">
                                                    Quantity
                                                </th>

                                                <th className="text-left py-3">
                                                    Unit Price
                                                </th>

                                                <th className="text-left py-3">
                                                    Line Amount
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {selectedQuotation.products.map(
                                                (item) => (
                                                    <tr
                                                        key={
                                                            item._id
                                                        }
                                                        className="border-b"
                                                    >

                                                        <td className="py-3">
                                                            {
                                                                item
                                                                    .product
                                                                    ?.productName
                                                            }
                                                        </td>

                                                        <td className="py-3">
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>

                                                        <td className="py-3">
                                                            ₹{" "}
                                                            {Number(
                                                                item.unitPrice
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </td>

                                                        <td className="py-3 font-medium">
                                                            ₹{" "}
                                                            {Number(
                                                                item.lineAmount
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>
                    )}

                    {/* =========================
                        FORM BUTTONS
                    ========================= */}

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                !selectedQuotation
                            }
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? "Creating..."
                                : "Create Sales Order"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </div>

            {/* =========================
                SALES ORDER LIST
            ========================= */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-6 border-b">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Sales Order List
                    </h2>

                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">
                        Loading sales orders...
                    </div>
                ) : salesOrders.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No sales orders found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            {/* TABLE HEADER */}

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Order
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Customer
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Quotation
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Total
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Status
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Date
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            {/* TABLE BODY */}

                            <tbody>

                                {salesOrders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order._id
                                            }
                                            className="border-b hover:bg-gray-50"
                                        >

                                            {/* ORDER */}

                                            <td className="px-4 py-4 font-medium">
                                                {
                                                    order.orderNumber
                                                }
                                            </td>

                                            {/* CUSTOMER */}

                                            <td className="px-4 py-4">
                                                {
                                                    order
                                                        .customer
                                                        ?.companyName ||
                                                    "-"
                                                }
                                            </td>

                                            {/* QUOTATION */}

                                            <td className="px-4 py-4">
                                                {
                                                    order
                                                        .quotation
                                                        ?.quotationNumber ||
                                                    "-"
                                                }
                                            </td>

                                            {/* TOTAL */}

                                            <td className="px-4 py-4">
                                                ₹{" "}
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                                        order.status
                                                    )}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>

                                            </td>

                                            {/* DATE */}

                                            <td className="px-4 py-4">
                                                {order.orderDate
                                                    ? new Date(
                                                          order.orderDate
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "-"}
                                            </td>

                                            {/* ACTION */}

                                            <td className="px-4 py-4">

                                                {order.status ===
                                                    "PENDING" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            confirmOrder(
                                                                order._id
                                                            )
                                                        }
                                                        disabled={
                                                            confirmingOrder
                                                        }
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {confirmingOrder
                                                            ? "Confirming..."
                                                            : "Confirm Order"}
                                                    </button>
                                                )}

                                                {order.status ===
                                                    "CONFIRMED" && (
                                                    <span className="text-sm font-medium text-blue-600">
                                                        Confirmed
                                                    </span>
                                                )}

                                                {order.status ===
                                                    "DISPATCHED" && (
                                                    <span className="text-sm text-gray-500">
                                                        Dispatched
                                                    </span>
                                                )}

                                                {order.status ===
                                                    "CANCELLED" && (
                                                    <span className="text-sm text-red-500">
                                                        Cancelled
                                                    </span>
                                                )}

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default SalesOrders;