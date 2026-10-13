import React, { useEffect } from "react";
import InstaPayLoader from "../../Loader";

const DefaultWithdrawal = ({
  withdrawals,
  setCurrent,
  setStep,
  setCurrentWithdrawal,
}) => {
  useEffect(() => {
    const setWithdrawal = () => {
      for (let withdrawal of withdrawals) {
        if (withdrawal.bank_details?.[0]?.default) {
          setCurrentWithdrawal(withdrawal);
          setCurrent(+withdrawal.bank_details?.[0]?.service_id);
          setStep((prev) => prev + 1);
          break;
        } else if (withdrawal.mobile_wallet?.[0]?.default) {
          setCurrentWithdrawal(withdrawal);
          setCurrent(+withdrawal.mobile_wallet?.[0]?.service_id);
          setStep((prev) => prev + 1);
          break;
        } else if (withdrawal.card?.[0]?.default) {
          setCurrentWithdrawal(withdrawal);
          setCurrent(+withdrawal.card?.[0]?.service_id);
          setStep((prev) => prev + 1);
          break;
        } else if (withdrawal.cash_pickup?.[0]?.default) {
          setCurrentWithdrawal(withdrawal);
          setCurrent(+withdrawal.cash_pickup?.[0]?.service_id);
          setStep((prev) => prev + 1);
          break;
        }
      }
    };

    setWithdrawal();
  }, [withdrawals]);
  return (
    <div style={{ height: "200px", width: "200px", margin: "0 auto" }}>
      <InstaPayLoader />
    </div>
  );
};

export default DefaultWithdrawal;
