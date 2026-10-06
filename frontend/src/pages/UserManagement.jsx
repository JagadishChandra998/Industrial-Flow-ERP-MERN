import { useEffect, useState } from "react";
import api from "../services/api";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await api.get("/users");

            setUsers(response.data.users || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setCreating(true);

        try {
            await api.post("/users", {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            setMessage("Sales user created successfully.");

            setFormData({
                fullName: "",
                email: "",
                password: "",
            });

            fetchUsers();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Failed to create user"
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    User Management
                </h1>

                <p className="text-slate-500 mt-1">
                    Create and manage ERP users
                </p>
            </div>

            {/* Create User */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-5">
                    Create New User
                </h2>

                {message && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            minLength={6}
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {creating
                                ? "Creating..."
                                : "Create Sales User"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">
                        System Users
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-slate-500">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-slate-500">
                        No users found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                        Name
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                        Email
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                        Role
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                        Created
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-800">
                                            {user.fullName}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {user.createdAt
                                                ? new Date(
                                                      user.createdAt
                                                  ).toLocaleDateString()
                                                : "N/A"}
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

export default UserManagement;