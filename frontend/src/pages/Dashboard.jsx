import { useEffect, useState } from "react";
import {
    Users,
    FileText,
    ClipboardList,
    ShoppingCart,
    Package,
    IndianRupee,
    AlertTriangle,
} from "lucide-react";

import api from "../services/api";

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard");

            setData(response.data);
        } catch (error) {
            console.error(
                "Dashboard error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>

                <button
                    onClick={fetchDashboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const summary = data?.summary || {};
    const lowStock = data?.lowStock || [];

    const cards = [
        {
            title: "Customers",
            value: summary.customers || 0,
            icon: Users,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Enquiries",
            value: summary.enquiries || 0,
            icon: FileText,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            title: "Quotations",
            value: summary.quotations || 0,
            icon: ClipboardList,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            title: "Sales Orders",
            value: summary.salesOrders || 0,
            icon: ShoppingCart,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Products",
            value: summary.products || 0,
            icon: Package,
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
        },
        {
            title: "Total Sales",
            value: `₹${Number(
                summary.totalSales || 0
            ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            icon: IndianRupee,
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
        },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                    Overview of your IndustrialFlow ERP system.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                                        {card.value}
                                    </h2>
                                </div>

                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
                                >
                                    <Icon
                                        size={23}
                                        className={card.iconColor}
                                    />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

                <div className="p-6 border-b border-gray-200 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Low Stock
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Products with 10 or fewer available units.
                        </p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle
                            size={20}
                            className="text-red-600"
                        />
                    </div>

                </div>

                {lowStock.length === 0 ? (
                    <div className="p-6">

                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                            All products have sufficient available stock.
                        </div>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Product
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Code
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Physical
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Reserved
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Available
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {lowStock.map((item) => {

                                    const available =
                                        item.availableQuantity ??
                                        (
                                            Number(
                                                item.physicalQuantity
                                            ) -
                                            Number(
                                                item.reservedQuantity
                                            )
                                        );

                                    return (
                                        <tr key={item._id}>

                                            <td className="px-6 py-4">

                                                <div className="font-medium text-gray-800">
                                                    {item.product?.productName ||
                                                        "-"}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {item.product?.category ||
                                                        "-"}
                                                </div>

                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {item.product?.productCode ||
                                                    "-"}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {item.physicalQuantity}
                                            </td>

                                            <td className="px-6 py-4 text-orange-600 font-medium">
                                                {item.reservedQuantity}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {available}
                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                        available <= 0
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {available <= 0
                                                        ? "Out of Stock"
                                                        : "Low Stock"}
                                                </span>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default Dashboard;