import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

export const BusinessRoute = ({ children }) => {
  const { userDetails } = useContext(UserContext);

  if (userDetails?.account_type !== "business") {
    return <Navigate to="/" replace />;
  }

  return children;
};
