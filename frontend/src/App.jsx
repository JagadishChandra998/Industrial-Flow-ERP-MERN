import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import Enquiries from "./pages/Enquiries.jsx";
import Quotations from "./pages/Quotations.jsx";
import SalesOrders from "./pages/SalesOrders.jsx";
import Dispatches from "./pages/Dispatches.jsx";
import Inventory from "./pages/Inventory.jsx";
import UserManagement from "./pages/UserManagement.jsx";

import ProtecteRoute from "./components/ProtecteRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Default route */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* Public */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Protected */}
                <Route element={<ProtecteRoute />}>

                    <Route element={<DashboardLayout />}>

                        {/* Dashboard */}
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        {/* Customers */}
                        <Route
                            path="/customers"
                            element={<Customers />}
                        />

                        <Route
                            path="/enquiries"
                            element={<Enquiries />}
                        />

                        <Route
                            path="/quotations"
                            element={<Quotations />}
                        />

                        <Route
                            path="/sales-orders"
                            element={<SalesOrders />}
                        />

                        <Route
                            path="/dispatch"
                            element={<Dispatches />}
                        />

                        <Route
                            path="/inventory"
                            element={<Inventory />}
                        />

                        <Route
                            path="/users"
                            element={<UserManagement />}
                        />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;