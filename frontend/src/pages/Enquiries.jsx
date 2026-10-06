import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../services/api";

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        enquiryNumber: "",
        customer: "",
        requiredDate: "",
        notes: "",
    });

    const [items, setItems] = useState([
        {
            product: "",
            quantity: 1,
        },
    ]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                enquiriesResponse,
                customersResponse,
                productsResponse,
            ] = await Promise.all([
                api.get("/enquiries"),
                api.get("/customers"),
                api.get("/products"),
            ]);

            setEnquiries(
                enquiriesResponse.data.enquiries || []
            );

            setCustomers(
                customersResponse.data.customers || []
            );

            setProducts(
                productsResponse.data.products || []
            );
        } catch (error) {
            console.error(
                "Enquiry page error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load enquiry data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];

        updatedItems[index][field] = value;

        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                product: "",
                quantity: 1,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            return;
        }

        setItems(
            items.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const resetForm = () => {
        setFormData({
            enquiryNumber: "",
            customer: "",
            requiredDate: "",
            notes: "",
        });

        setItems([
            {
                product: "",
                quantity: 1,
            },
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                enquiryNumber: formData.enquiryNumber,
                customerId: formData.customer,
                requiredDate: formData.requiredDate,
                notes: formData.notes,
                products: items.map((item) => ({
                    productId: item.product,
                    quantity: Number(item.quantity),
                })),
            };

            console.log("Sending enquiry:", payload);

            await api.post("/enquiries", payload);

            setSuccess("Enquiry created successfully.");

            resetForm();
            setShowForm(false);

            await fetchData();

        } catch (error) {
            console.error(
                "Create enquiry error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to create enquiry"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Enquiries
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage customer enquiries and requirements
                    </p>
                </div>

                <button
                    onClick={() => {
                        setShowForm(true);
                        setError("");
                        setSuccess("");
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={18} />

                    New Enquiry
                </button>

            </div>

            {/* Messages */}

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Create Enquiry Form */}

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Create Enquiry
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Add customer requirements
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Basic Information */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enquiry Number
                                </label>

                                <input
                                    type="text"
                                    name="enquiryNumber"
                                    value={formData.enquiryNumber}
                                    onChange={handleChange}
                                    placeholder="ENQ-2026-002"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer
                                </label>

                                <select
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Select Customer
                                    </option>

                                    {customers.map((customer) => (
                                        <option
                                            key={customer._id}
                                            value={customer._id}
                                        >
                                            {customer.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Required Date
                                </label>

                                <input
                                    type="date"
                                    name="requiredDate"
                                    value={formData.requiredDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                        </div>

                        {/* Products */}

                        <div className="mb-6">

                            <div className="flex items-center justify-between mb-3">

                                <h3 className="font-semibold text-gray-800">
                                    Required Products
                                </h3>

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    + Add Product
                                </button>

                            </div>

                            <div className="space-y-3">

                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                                    >

                                        <div className="md:col-span-8">

                                            <label className="block text-sm text-gray-600 mb-1">
                                                Product
                                            </label>

                                            <select
                                                value={item.product}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "product",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                                            >
                                                <option value="">
                                                    Select Product
                                                </option>

                                                {products.map((product) => (
                                                    <option
                                                        key={product._id}
                                                        value={product._id}
                                                    >
                                                        {product.productCode} -{" "}
                                                        {product.productName}
                                                    </option>
                                                ))}
                                            </select>

                                        </div>

                                        <div className="md:col-span-3">

                                            <label className="block text-sm text-gray-600 mb-1">
                                                Quantity
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            />

                                        </div>

                                        <div className="md:col-span-1">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <X size={18} className="mx-auto" />
                                            </button>

                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>

                        {/* Notes */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Additional customer requirements..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                        {/* Actions */}

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Enquiry"}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* Enquiry Table */}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Loading enquiries...
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No enquiries found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Enquiry
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Customer
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Required Date
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {enquiries.map((enquiry) => (

                                    <tr
                                        key={enquiry._id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >

                                        <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                            {enquiry.enquiryNumber}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {enquiry.customer?.companyName ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {new Date(
                                                enquiry.requiredDate
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-5 py-4">

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${enquiry.status === "WON"
                                                    ? "bg-green-100 text-green-700"
                                                    : enquiry.status === "LOST"
                                                        ? "bg-red-100 text-red-700"
                                                        : enquiry.status === "QUOTED"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {enquiry.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default Enquiries;