import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 min-h-screen p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;