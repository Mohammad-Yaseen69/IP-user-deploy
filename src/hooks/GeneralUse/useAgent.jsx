import { Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import InstaPayLoader from "../../Components/Loader";

export const AgentRoute = ({ children }) => {
    const { userDetails, verifyToken } = useContext(UserContext) || {};
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (verifyToken && token && !userDetails) {
            verifyToken();
        }
    }, [token, userDetails, verifyToken]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (userDetails === null) {
        return <InstaPayLoader fallback={true} />;
    }

    if (!userDetails?.isInstapayAgent) {
        return <Navigate to="/" replace />;
    }

    return children;
};
