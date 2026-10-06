import { useEffect, useState } from "react";
import api from "../services/api";

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [quantity, setQuantity] = useState("");

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory");

            setInventory(response.data.inventory || []);
        } catch (error) {
            console.error(
                "Fetch inventory error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to load inventory"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const startEditing = (item) => {
        setEditingId(item._id);
        setQuantity(item.physicalQuantity);
        setError("");
        setSuccess("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setQuantity("");
    };

    const updateInventory = async (productId) => {
        try {
            setError("");
            setSuccess("");

            const newQuantity = Number(quantity);

            if (!Number.isFinite(newQuantity)) {
                setError("Quantity must be a valid number");
                return;
            }

            if (newQuantity < 0) {
                setError("Quantity cannot be negative");
                return;
            }

            await api.patch(`/inventory/${productId}`, {
                physicalQuantity: newQuantity,
            });

            setSuccess("Inventory updated successfully.");

            setEditingId(null);
            setQuantity("");

            await fetchInventory();
        } catch (error) {
            console.error(
                "Update inventory error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                    "Failed to update inventory"
            );
        }
    };

    const getStockStatus = (availableQuantity) => {
        if (availableQuantity <= 0) {
            return {
                text: "Out of Stock",
                className:
                    "bg-red-100 text-red-700",
            };
        }

        if (availableQuantity <= 10) {
            return {
                text: "Low Stock",
                className:
                    "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            text: "In Stock",
            className:
                "bg-green-100 text-green-700",
        };
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Inventory
                </h1>

                <p className="text-gray-500 mt-1">
                    Monitor physical, reserved and available stock.
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

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Stock Overview
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-gray-500">
                        Loading inventory...
                    </div>
                ) : inventory.length === 0 ? (
                    <div className="p-6 text-gray-500">
                        No inventory records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Product
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Code
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Unit
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Physical
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Reserved
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Available
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>

                                    <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {inventory.map((item) => {
                                    const availableQuantity =
                                        item.availableQuantity ??
                                        (
                                            Number(
                                                item.physicalQuantity
                                            ) -
                                            Number(
                                                item.reservedQuantity
                                            )
                                        );

                                    const stockStatus =
                                        getStockStatus(
                                            availableQuantity
                                        );

                                    const isEditing =
                                        editingId === item._id;

                                    return (
                                        <tr key={item._id}>

                                            {/* Product */}
                                            <td className="px-5 py-4">

                                                <div className="font-medium text-gray-800">
                                                    {item.product?.productName ||
                                                        "-"}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1">
                                                    {item.product?.category ||
                                                        "-"}
                                                </div>

                                            </td>

                                            {/* Code */}
                                            <td className="px-5 py-4 text-gray-700">
                                                {item.product?.productCode ||
                                                    "-"}
                                            </td>

                                            {/* Unit */}
                                            <td className="px-5 py-4 text-gray-700">
                                                {item.product?.unit ||
                                                    "-"}
                                            </td>

                                            {/* Physical */}
                                            <td className="px-5 py-4">

                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={quantity}
                                                        onChange={(e) =>
                                                            setQuantity(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-gray-800">
                                                        {
                                                            item.physicalQuantity
                                                        }
                                                    </span>
                                                )}

                                            </td>

                                            {/* Reserved */}
                                            <td className="px-5 py-4 text-orange-600 font-medium">
                                                {item.reservedQuantity}
                                            </td>

                                            {/* Available */}
                                            <td className="px-5 py-4">

                                                <span className="font-semibold text-gray-800">
                                                    {
                                                        availableQuantity
                                                    }
                                                </span>

                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}
                                                >
                                                    {
                                                        stockStatus.text
                                                    }
                                                </span>

                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4">

                                                {isEditing ? (
                                                    <div className="flex gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateInventory(
                                                                    item.product
                                                                        ?._id
                                                                )
                                                            }
                                                            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                cancelEditing
                                                            }
                                                            className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>

                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditing(
                                                                item
                                                            )
                                                        }
                                                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        Update Stock
                                                    </button>
                                                )}

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

export default Inventory;