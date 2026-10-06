import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../services/api";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        contactPerson: "",
        mobile: "",
        email: "",
        city: "",
    });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/customers");

            setCustomers(
                response.data.customers || []
            );
        } catch (error) {
            console.error(
                "Customers API error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load customers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await api.post("/customers", formData);

            setSuccess("Customer created successfully.");

            setFormData({
                companyName: "",
                contactPerson: "",
                mobile: "",
                email: "",
                city: "",
            });

            setShowForm(false);

            await fetchCustomers();
        } catch (error) {
            console.error(
                "Create customer error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to create customer"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Customers
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage your customers
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

                    Add Customer
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

            {/* Add Customer Form */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">

                    <div className="flex items-center justify-between mb-5">

                        <h2 className="text-lg font-semibold text-gray-800">
                            Add Customer
                        </h2>

                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                            </label>

                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ABC Engineering Pvt. Ltd."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person
                            </label>

                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Rahul Sharma"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile
                            </label>

                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="9876543210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="customer@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Bhubaneswar"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
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
                                    ? "Saving..."
                                    : "Create Customer"}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* Customer Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No customers found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr>
                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Company
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Contact Person
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Mobile
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Email
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        City
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                            {customer.companyName}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {customer.contactPerson}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {customer.mobile}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {customer.email}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {customer.city}
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

export default Customers;