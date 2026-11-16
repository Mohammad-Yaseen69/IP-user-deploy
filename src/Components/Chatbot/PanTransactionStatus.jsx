import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Success from "../AddFunds/ResponseModals/Success";
import Error from "../AddFunds/ResponseModals/Error";
import Abort from "../AddFunds/ResponseModals/Abort";

const PanTransactionStatus = () => {
  const params = useParams();
  const [currenctModal, setCurrentModal] = useState("");

  useEffect(() => {
    if (params?.status) {
      const { pathname } = window.location;

      if (pathname.includes("success")) {
        setCurrentModal("success");
      }
      if (pathname.includes("failed") || pathname.includes("error")) {
        setCurrentModal("error");
      }
      if (pathname.includes("aborted")) {
        setCurrentModal("abort");
      }
      if (params.status === "pending") {
        setCurrentModal("pending");
      }
    }
  }, [params]);

  return (
    <>
      {(currenctModal === "success" || currenctModal === "pending") && (
        <Success
          message={
            currenctModal === "pending"
              ? "Your transaction is currently being processed. If the status remains pending for an extended period, please contact support for assistance."
              : "Your transaction has been completed successfully.You can close this window now."
          }
          type={currenctModal}
        />
      )}
      {currenctModal === "error" && <Error />}
      {currenctModal === "abort" && <Abort />}
    </>
  );
};

export default PanTransactionStatus;
