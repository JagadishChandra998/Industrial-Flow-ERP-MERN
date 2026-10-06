import { useEffect, useState } from "react";
import api from "../services/api";

const Dispatches = () => {
    const [orders, setOrders] = useState([]);
    const [dispatches, setDispatches] = useState([]);

    const [formData, setFormData] = useState({
        dispatchNumber: "",
        salesOrderId: "",
    });

    const [loading, setLoading] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [ordersResponse, dispatchesResponse] =
                await Promise.all([
                    api.get("/sales-orders"),
                    api.get("/dispatches"),
                ]);

            const salesOrders =
                ordersResponse.data.salesOrders || [];

            const existingDispatches =
                dispatchesResponse.data.dispatches || [];

            setOrders(salesOrders);
            setDispatches(existingDispatches);
        } catch (error) {
            console.error(
                "Fetch dispatch data error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load dispatch data"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setDispatching(true);
            setError("");
            setSuccess("");

            if (
                !formData.dispatchNumber.trim() ||
                !formData.salesOrderId
            ) {
                setError(
                    "Dispatch number and sales order are required"
                );
                return;
            }

            await api.post(
                `/dispatches/${formData.salesOrderId}`,
                {
                    dispatchNumber:
                        formData.dispatchNumber.trim(),
                }
            );

            setSuccess(
                "Sales order dispatched successfully and inventory updated."
            );

            setFormData({
                dispatchNumber: "",
                salesOrderId: "",
            });

            await fetchData();
        } catch (error) {
            console.error(
                "Create dispatch error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to dispatch sales order"
            );
        } finally {
            setDispatching(false);
        }
    };

    const confirmedOrders = orders.filter(
        (order) => order.status === "CONFIRMED"
    );

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Dispatch
                </h1>

                <p className="text-gray-500 mt-1">
                    Dispatch confirmed sales orders and update inventory.
                </p>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Create Dispatch */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                    Create Dispatch
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >

                    {/* Dispatch Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dispatch Number
                        </label>

                        <input
                            type="text"
                            name="dispatchNumber"
                            value={formData.dispatchNumber}
                            onChange={handleChange}
                            placeholder="DISP-2026-002"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Sales Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmed Sales Order
                        </label>

                        <select
                            name="salesOrderId"
                            value={formData.salesOrderId}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">
                                Select Sales Order
                            </option>

                            {confirmedOrders.map((order) => (
                                <option
                                    key={order._id}
                                    value={order._id}
                                >
                                    {order.orderNumber} - ₹
                                    {Number(
                                        order.totalAmount
                                    ).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Button */}
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={dispatching}
                            className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {dispatching
                                ? "Dispatching..."
                                : "Create Dispatch"}
                        </button>
                    </div>

                </form>

                {confirmedOrders.length === 0 && (
                    <p className="text-sm text-gray-500 mt-4">
                        No confirmed sales orders are available for dispatch.
                    </p>
                )}
            </div>

            {/* Dispatch History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Dispatch History
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">
                        Loading dispatches...
                    </div>
                ) : dispatches.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No dispatch records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Dispatch Number
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Sales Order
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Customer
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Dispatch Date
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {dispatches.map((dispatch) => (
                                    <tr key={dispatch._id}>

                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {dispatch.dispatchNumber}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {dispatch.salesOrder?.orderNumber ||
                                                "-"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {dispatch.salesOrder?.customer
                                                ?.companyName ||
                                                "-"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            {dispatch.dispatchDate
                                                ? new Date(
                                                      dispatch.dispatchDate
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                {dispatch.status}
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

export default Dispatches;