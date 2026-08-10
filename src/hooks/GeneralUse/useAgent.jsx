import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

export const AgentRoute = ({ children }) => {
    const { userDetails } = useContext(UserContext);

    if (!userDetails?.isInstapayAgent) {
        return <Navigate to="/" replace />;
    }

    return children;
};
