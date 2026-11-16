import React, { useContext, useEffect, useMemo, useState } from "react";
import TopLeft from "./TopLeft";
import TopRight from "./TopRight";
import BottomLeft from "./BottomLeft";
import BottomRight from "./BottomRight";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import styles from "./styles/Reports.module.css";

const Reports = () => {
  const { userDetails, authHeader, userWallets } = useContext(UserContext);
  const [reports, setReports] = useState({});
  const [additionalData, setAdditionalData] = useState({});
  const [requestedAmount, setRequestedAmount] = useState({});
  const [quotedAmount, setQuotedAmount] = useState({});
  const [currentWallet, setCurrentWallet] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [apiDates, setApiDates] = useState({
    from: "2023-12-01",
    to: "2023-12-31",
  });
  useEffect(() => {
    if (!currentWallet?.wallet_id && userWallets?.length > 0) {
      setCurrentWallet(userWallets[0]);
    }
  }, [userWallets, currentWallet?.wallet_id]);
  const selectedSummary = useMemo(() => {
    const selectedCurrency = currentWallet?.currency?.code;

    if (selectedCurrency && additionalData?.[selectedCurrency]) {
      return additionalData[selectedCurrency];
    }

    return Object.values(additionalData ?? {})?.[0] ?? {};
  }, [additionalData, currentWallet]);

  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate);

    startDate.setMonth(currentDate.getMonth() - 1);

    const formattedDateRange = {
      from: startDate.toISOString().split("T")[0],
      to: currentDate.toISOString().split("T")[0],
    };

    setApiDates(formattedDateRange);
  }, []);

  useEffect(() => {
    const getReports = async () => {
      setIsLoading(true);
      try {
        const encrypted = encryptData({
          ...apiDates,
        });
        const response = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date-type/${userDetails?._id}/0/0`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
          },
        );

        const decrypted = decryptData(response.data.data);
        // console.log("aa", decrypted)
        setIsLoading(false);
        setReports(decrypted?.transactionsByServiceTypeAndCurrency);
      } catch (error) {
        setIsLoading(false);
        // console.log(decryptData(error?.response?.data?.data))
      }
    };

    const getAdditionalReports = async () => {
      setIsLoading(true);
      setAdditionalData({});
      try {
        const encrypted = encryptData({
          // ...apiAdditionalDates,
          ...apiDates,
          account_id: userDetails?._id,
          wallet_id: currentWallet?.wallet_id,
        });
        const response = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-transactions-report-user/0/0`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
          },
        );

        const decrypted = decryptData(response.data.data);
        // console.log("ab", decrypted)
        setIsLoading(false);
        setAdditionalData(decrypted?.transactionSummary);
        setRequestedAmount(decrypted?.totalRequestedAmount);
        setQuotedAmount(decrypted?.totalQuotedAmount);
      } catch (error) {
        setIsLoading(false);
        // console.log(decryptData(error?.response?.data?.data))
      }
    };

    if (userDetails && currentWallet?.wallet_id) {
      getAdditionalReports();
      getReports();
    }
  }, [apiDates, userDetails, currentWallet?.wallet_id]);

  const [creditPayments, setCreditPayments] = useState([]);
  const [debitPayments, setDebitPayments] = useState([]);

  useEffect(() => {
    const categorizedPayments = () => {
      const creditTrxs = [];
      const debitTrxs = [];
      for (const type in reports) {
        const currentCreditTrxs = reports?.[type]?.[currentWallet?.currency?.code]?.filter(
          (item) => item?.transaction_type === "credit",
        );
        if (currentCreditTrxs && currentCreditTrxs.length > 0) {
          creditTrxs.push(...currentCreditTrxs);
        }

        const currentDebitTrxs = reports?.[type]?.[currentWallet?.currency?.code]?.filter(
          (item) => item?.transaction_type === "debit",
        );
        if (currentDebitTrxs && currentDebitTrxs.length > 0) {
          debitTrxs.push(...currentDebitTrxs);
        }
      }

      setCreditPayments(creditTrxs);
      setDebitPayments(debitTrxs);
    };

    categorizedPayments();
  }, [reports, currentWallet]);
  // console.log(additionalData, "additionalData")
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <TopLeft
          setApiDates={setApiDates}
          currentWallet={currentWallet}
          setCurrentWallet={setCurrentWallet}
          creditPayments={creditPayments}
          debitPayments={debitPayments}
          isLoading={isLoading}
          apiDates={apiDates}
        />
        <TopRight
          isLoading={isLoading}
          data={selectedSummary}
          reports={reports}
          currentWallet={currentWallet}
          // setApiDates={setApiAdditionalDates}
          setApiDates={setApiDates}
        />
      </div>
      <div className={styles.bottom}>
        <BottomLeft
          data={selectedSummary}
          reports={reports}
          currentWallet={currentWallet}
          requestedAmount={requestedAmount}
          quotedAmount={quotedAmount}
        />
        {/* <BottomRight /> */}
      </div>
    </div>
  );
};

export default Reports;
