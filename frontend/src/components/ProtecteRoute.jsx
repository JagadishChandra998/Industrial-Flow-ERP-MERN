import useAuth from "../context/AuthContext.jsx";
import { Navigate,Outlet } from "react-router-dom";

const ProtecteRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
export default ProtecteRoute;