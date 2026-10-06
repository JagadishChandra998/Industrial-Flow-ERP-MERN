import { useEffect, useState } from "react";
import api from "../services/api";

const Quotations = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [quotations, setQuotations] = useState([]);

    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const [formData, setFormData] = useState({
        quotationNumber: "",
        enquiryId: "",
        validUntil: "",
    });

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // FETCH DATA
    // =========================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [enquiriesResponse, quotationsResponse] =
                await Promise.all([
                    api.get("/enquiries"),
                    api.get("/quotations"),
                ]);

            const enquiryData =
                enquiriesResponse.data.enquiries || [];

            const quotationData =
                quotationsResponse.data.quotations || [];

            setEnquiries(enquiryData);
            setQuotations(quotationData);
        } catch (error) {
            console.error(
                "Fetch quotation data error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load quotation data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================
    // ENQUIRY SELECTION
    // =========================

    const handleEnquiryChange = async (e) => {
        const enquiryId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            enquiryId,
        }));

        if (!enquiryId) {
            setSelectedEnquiry(null);
            setItems([]);
            return;
        }

        try {
            setError("");

            const response = await api.get("/enquiries");

            const allEnquiries =
                response.data.enquiries || [];

            const enquiry = allEnquiries.find(
                (item) => item._id === enquiryId
            );

            if (!enquiry) {
                setError("Enquiry not found");
                return;
            }

            setSelectedEnquiry(enquiry);

            /*
             * Enquiry GET response should contain products.
             * Each product should look similar to:
             *
             * {
             *   product: {
             *      _id,
             *      productName,
             *      productCode,
             *      basePrice
             *   },
             *   quantity
             * }
             */

            const enquiryProducts = enquiry.products || [];

            setItems(
                enquiryProducts.map((item) => ({
                    productId:
                        item.product?._id ||
                        item.productId ||
                        item.product,

                    productName:
                        item.product?.productName ||
                        "Product",

                    productCode:
                        item.product?.productCode ||
                        "",

                    quantity: item.quantity,

                    unitPrice:
                        item.product?.basePrice || 0,

                    discountPercent: 0,

                    gstPercent: 18,
                }))
            );
        } catch (error) {
            console.error(
                "Load enquiry error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load enquiry"
            );
        }
    };

    // =========================
    // ITEM CHANGE
    // =========================

    const updateItem = (index, field, value) => {
        setItems((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    // =========================
    // CREATE QUOTATION
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!formData.quotationNumber) {
                setError("Quotation number is required");
                return;
            }

            if (!formData.enquiryId) {
                setError("Please select an enquiry");
                return;
            }

            if (!formData.validUntil) {
                setError("Valid until date is required");
                return;
            }

            if (items.length === 0) {
                setError("No products available for this enquiry");
                return;
            }

            const payload = {
                quotationNumber:
                    formData.quotationNumber,

                enquiryId:
                    formData.enquiryId,

                validUntil:
                    formData.validUntil,

                products: items.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    discountPercent:
                        Number(item.discountPercent) || 0,
                    gstPercent:
                        Number(item.gstPercent) || 0,
                })),
            };

            console.log(
                "Sending quotation:",
                payload
            );

            await api.post("/quotations", payload);

            setSuccess(
                "Quotation created successfully."
            );

            setFormData({
                quotationNumber: "",
                enquiryId: "",
                validUntil: "",
            });

            setSelectedEnquiry(null);
            setItems([]);

            await fetchData();
        } catch (error) {
            console.error(
                "Create quotation error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to create quotation"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // UPDATE STATUS
    // =========================

    const updateStatus = async (
        quotationId,
        status
    ) => {
        try {
            setError("");
            setSuccess("");

            await api.patch(
                `/quotations/${quotationId}/status`,
                {
                    status,
                }
            );

            setSuccess(
                `Quotation ${status.toLowerCase()} successfully.`
            );

            await fetchData();
        } catch (error) {
            console.error(
                "Update quotation status error:",
                error.response?.data ||
                    error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to update quotation status"
            );
        }
    };

    // =========================
    // RESET FORM
    // =========================

    const resetForm = () => {
        setFormData({
            quotationNumber: "",
            enquiryId: "",
            validUntil: "",
        });

        setSelectedEnquiry(null);
        setItems([]);
        setError("");
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Quotations
                </h1>

                <p className="text-gray-500 mt-1">
                    Create and manage customer quotations
                </p>
            </div>

            {/* MESSAGES */}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* CREATE QUOTATION */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                    Create Quotation
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* BASIC DETAILS */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quotation Number
                            </label>

                            <input
                                type="text"
                                value={
                                    formData.quotationNumber
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        quotationNumber:
                                            e.target.value,
                                    })
                                }
                                placeholder="QUO-2026-002"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enquiry
                            </label>

                            <select
                                value={
                                    formData.enquiryId
                                }
                                onChange={
                                    handleEnquiryChange
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="">
                                    Select enquiry
                                </option>

                                {enquiries
                                    .filter(
                                        (enquiry) =>
                                            ![
                                                "WON",
                                                "LOST",
                                            ].includes(
                                                enquiry.status
                                            )
                                    )
                                    .map(
                                        (enquiry) => (
                                            <option
                                                key={
                                                    enquiry._id
                                                }
                                                value={
                                                    enquiry._id
                                                }
                                            >
                                                {
                                                    enquiry.enquiryNumber
                                                }
                                            </option>
                                        )
                                    )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valid Until
                            </label>

                            <input
                                type="date"
                                value={
                                    formData.validUntil
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        validUntil:
                                            e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                    </div>

                    {/* CUSTOMER */}

                    {selectedEnquiry?.customer && (
                        <div className="bg-gray-50 rounded-lg p-4">

                            <h3 className="font-semibold text-gray-700 mb-2">
                                Customer
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">

                                <div>
                                    <span className="text-gray-500">
                                        Company
                                    </span>

                                    <p className="font-medium">
                                        {
                                            selectedEnquiry
                                                .customer
                                                .companyName
                                        }
                                    </p>
                                </div>

                                <div>
                                    <span className="text-gray-500">
                                        Contact
                                    </span>

                                    <p className="font-medium">
                                        {
                                            selectedEnquiry
                                                .customer
                                                .contactPerson
                                        }
                                    </p>
                                </div>

                                <div>
                                    <span className="text-gray-500">
                                        City
                                    </span>

                                    <p className="font-medium">
                                        {
                                            selectedEnquiry
                                                .customer
                                                .city
                                        }
                                    </p>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* PRODUCTS */}

                    {items.length > 0 && (
                        <div>

                            <h3 className="font-semibold text-gray-800 mb-3">
                                Quotation Products
                            </h3>

                            <div className="overflow-x-auto">

                                <table className="w-full border-collapse">

                                    <thead>
                                        <tr className="bg-gray-50 border-b">

                                            <th className="text-left px-3 py-3 text-sm">
                                                Product
                                            </th>

                                            <th className="text-left px-3 py-3 text-sm">
                                                Qty
                                            </th>

                                            <th className="text-left px-3 py-3 text-sm">
                                                Unit Price
                                            </th>

                                            <th className="text-left px-3 py-3 text-sm">
                                                Discount %
                                            </th>

                                            <th className="text-left px-3 py-3 text-sm">
                                                GST %
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {items.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        item.productId
                                                    }
                                                    className="border-b"
                                                >

                                                    <td className="px-3 py-3">
                                                        <p className="font-medium">
                                                            {
                                                                item.productName
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                item.productCode
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={
                                                                item.quantity
                                                            }
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "quantity",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-24 border rounded-lg px-2 py-2"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.unitPrice
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "unitPrice",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-28 border rounded-lg px-2 py-2"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={
                                                                item.discountPercent
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "discountPercent",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-24 border rounded-lg px-2 py-2"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={
                                                                item.gstPercent
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "gstPercent",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-20 border rounded-lg px-2 py-2"
                                                        />
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        </div>
                    )}

                    {/* BUTTONS */}

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                items.length === 0
                            }
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving
                                ? "Creating..."
                                : "Create Quotation"}
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

            {/* QUOTATION LIST */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-6 border-b">

                    <h2 className="text-lg font-semibold text-gray-800">
                        Quotation List
                    </h2>

                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">
                        Loading quotations...
                    </div>
                ) : quotations.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No quotations found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Quotation
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Customer
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Enquiry
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Total
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Valid Until
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Status
                                    </th>

                                    <th className="text-left px-4 py-3 text-sm">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {quotations.map(
                                    (quotation) => (
                                        <tr
                                            key={
                                                quotation._id
                                            }
                                            className="border-b"
                                        >

                                            <td className="px-4 py-4 font-medium">
                                                {
                                                    quotation.quotationNumber
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                {
                                                    quotation
                                                        .customer
                                                        ?.companyName ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                {
                                                    quotation
                                                        .enquiry
                                                        ?.enquiryNumber ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                ₹{" "}
                                                {Number(
                                                    quotation.totalAmount
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {quotation.validUntil
                                                    ? new Date(
                                                          quotation.validUntil
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        quotation.status ===
                                                        "DRAFT"
                                                            ? "bg-gray-100 text-gray-700"
                                                            : quotation.status ===
                                                              "SENT"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : quotation.status ===
                                                              "ACCEPTED"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {
                                                        quotation.status
                                                    }
                                                </span>

                                            </td>

                                            <td className="px-4 py-4">

                                                <div className="flex gap-2">

                                                    {quotation.status ===
                                                        "DRAFT" && (
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(
                                                                    quotation._id,
                                                                    "SENT"
                                                                )
                                                            }
                                                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                        >
                                                            Send
                                                        </button>
                                                    )}

                                                    {quotation.status ===
                                                        "SENT" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        quotation._id,
                                                                        "ACCEPTED"
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                            >
                                                                Accept
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        quotation._id,
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                </div>

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

export default Quotations;