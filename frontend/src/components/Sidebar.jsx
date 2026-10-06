import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    ClipboardList,
    ShoppingCart,
    Package,
    Truck,
    BarChart3,
    LogOut,
} from "lucide-react";

const Sidebar = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Customers",
            path: "/customers",
            icon: Users,
        },
        {
            name: "Enquiries",
            path: "/enquiries",
            icon: FileText,
        },
        {
            name: "Quotations",
            path: "/quotations",
            icon: ClipboardList,
        },
        {
            name: "Sales Orders",
            path: "/sales-orders",
            icon: ShoppingCart,
        },
        {
            name: "Inventory",
            path: "/inventory",
            icon: Package,
        },
        {
            name: "Dispatch",
            path: "/dispatch",
            icon: Truck,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "User Management",
            path: "/users",
            icon: Users,
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold">
                    IndustrialFlow
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                    ERP System
                </p>
            </div>

            {/* User */}
            <div className="p-5 border-b border-slate-700">
                <p className="font-medium">
                    {user.fullName || "User"}
                </p>

                <p className="text-sm text-slate-400 capitalize">
                    {user.role || "Staff"}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                                ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800"
                                }`
                            }
                        >
                            <Icon size={19} />

                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}

            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-700">

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3
                    text-red-400 hover:bg-slate-800 rounded-lg text-sm"
                >
                    <LogOut size={19} />

                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;