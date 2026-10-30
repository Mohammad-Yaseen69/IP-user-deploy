import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SocketsService from "../../../Services/Socket";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import MobileWalletLink from "../WalletFund/MobileWalletLink";
import failSvg from "../../QrQuickerPay/faile.svg";
import successSvg from "../../QrQuickerPay/success.svg";

const POLL_MS = 10000;
const FINAL = ["COMPLETED", "FAILED"];

// SriPay never redirects back, so we watch the socket and poll our status endpoint.
const SriPayPaymentStatus = ({ transactionId, redirectUrl, walletName, onRestart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails } = useContext(UserContext);
  const [status, setStatus] = useState("INITIATED");

  const socketsService = useMemo(
    () =>
      new SocketsService(
        {
          url: import.meta.env.VITE_IP_DEV_API,
          transports: ["websocket", "polling", "flashsocket"],
        },
        () => {},
      ),
    [],
  );

  useEffect(() => {
    if (!transactionId) return;

    // Not connectToServer: that re-registers the app-wide toast handlers Layout's socket already has.
    const socket = socketsService.socket;
    const joinRoom = () => socket.emit("setUserId", userDetails?._id);
    const onUpdate = (data) => {
      if (data?.status && data?.transactionId === String(transactionId)) {
        setStatus(data.status);
      }
    };

    socket.on("connect", joinRoom);
    socket.on("sripay:transaction", onUpdate);
    socket.connect();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("sripay:transaction", onUpdate);
      socket.disconnect();
    };
  }, [socketsService, transactionId, userDetails?._id]);

  useEffect(() => {
    if (!transactionId || FINAL.includes(status)) return;

    const poll = setInterval(async () => {
      try {
        const res = await apiWrapper({
          endpoint: `/api/collection/sripay/status/${transactionId}`,
        });
        if (res?.data?.status) setStatus(res.data.status);
      } catch {
        // keep polling; the socket may still deliver
      }
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [transactionId, status]);

  if (!FINAL.includes(status)) {
    return (
      <MobileWalletLink
        data={{ name: walletName }}
        setSubStep={onRestart}
        type="Mobile Wallet"
        externalLink={redirectUrl}
      />
    );
  }

  const success = status === "COMPLETED";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1.5rem",
        padding: "2rem",
        minHeight: "400px",
        background: "white",
        borderRadius: "16px",
      }}
    >
      <img
        src={success ? successSvg : failSvg}
        alt={status}
        style={{ width: "100px", height: "100px", objectFit: "contain" }}
      />
      <h2
        style={{
          fontFamily: "Manrope, sans-serif",
          fontSize: "1.8rem",
          fontWeight: 800,
          margin: 0,
        }}
      >
        {success ? t("Payment Successful") : t("Payment Failed")}
      </h2>
      <p
        style={{
          color: "#848484",
          fontFamily: "Manrope, sans-serif",
          fontSize: "0.95rem",
          fontWeight: 600,
          maxWidth: "400px",
          margin: 0,
        }}
      >
        {success
          ? t("Your transaction has been completed successfully.")
          : t("Unfortunately, your transaction could not be processed. Please try again.")}
      </p>
      <button
        onClick={() => (success ? navigate("/transactions") : onRestart(1))}
        style={{
          all: "unset",
          cursor: "pointer",
          borderRadius: "8px",
          background: "#5926F0",
          padding: "0.8rem 2.5rem",
          color: "#FFF",
          fontFamily: "Manrope, sans-serif",
          fontWeight: 700,
          minWidth: "160px",
          textAlign: "center",
        }}
      >
        {success ? t("Close") : t("Try Again")}
      </button>
    </div>
  );
};

export default SriPayPaymentStatus;
