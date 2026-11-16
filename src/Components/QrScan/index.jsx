import React, { useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router";

const QRScan = () => {
  const { userDetails } = useContext(UserContext);
  const { wallet_id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const loginFlow = query.get("login_flow");
  const navigate = useNavigate();

  useEffect(() => {
    if (loginFlow) {
      if (userDetails) {
        sessionStorage.setItem(
          "path",
          `/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`,
        );
        navigate(
          `/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`,
        );
      } else {
        sessionStorage.setItem(
          "path",
          `/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`,
        );
        navigate("/login");
      }
    } else {
      navigate(`/qr-quickerpay/${wallet_id}`);
    }
  }, [userDetails]);

  return <div>{wallet_id}</div>;
};

export default QRScan;
