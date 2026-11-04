import { useContext, useEffect, useState } from "react";
import styles from "./BankDeposit.module.scss";
import Dropzone from "../../Portfolio/CustomDropZone";
import { Trans, useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { ChevronRight } from "react-feather";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../Helper/AmountFormat";
import InstaPayLoader from "../../Loader";
import PaymentDetails from "../../PaymentAddressPublic/PayAsGuest/PaymentDetails";

const BankDeposit = ({
  data,
  dataHandler,
  type = "add_funds",
  guestDetails,
  toggle,
  client_reference,
}) => {
  const isGuestPayment = type !== "add_funds";
  const { userDetails } = useContext(UserContext);
  const [selectedBank, setSelectedBank] = useState({});
  const { data: bankList, isLoading } = useQuery({
    queryKey: ["bankListForUser", userDetails?._id],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/bank-deposit/get-user-banks/${userDetails?._id}/${type}${guestDetails?.iso_code ? `?guest_iso=${guestDetails.iso_code}` : ""}`,
      }).then((res) => res?.data),
  });
  const { isPending, mutateAsync } = useMutation({
    mutationFn: () =>
      apiWrapper({
        endpoint: `/api/wallet/get-plain-exchange-rate?from=${data.wallet?.currency?.code}&to=${selectedBank.Currency}&amount=${1}`,
      }),
    onSuccess: (dec) => {
      console.log(data.exchange_rate_backup);

      dataHandler("exchange_rate", {
        fee: {
          amount: data?.exchange_rate_backup?.fee?.amount * dec.exchangeRate?.result,
        },
        sending: {
          currency: selectedBank.Currency,
          amount: data.exchange_rate_backup?.total * dec?.exchangeRate?.result,
        },
        receiver: {
          currency: data.exchange_rate?.receiver?.currency,
          amount: data.exchange_rate?.receiver?.amount,
        },
        total: parseFloat(
          isGuestPayment
            ? data.exchange_rate_backup?.total * dec?.exchangeRate?.result
            : data.exchange_rate?.receiver?.amount,
        ),
        exchange_rate: {
          exchange_rate_currency: selectedBank.Currency,
          exchange_rate_sending_currency: data.exchange_rate?.receiver?.currency,
          exchange_rate: dec.exchangeRate?.result,
        },
        total_currency: data.exchange_rate?.receiver?.currency,
        recipient_currency: selectedBank.Currency,
      });
    },
    onError: () => {
      toast.error("We can't proceed with your request at the moment. please try again.");
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: async (formData) => {
      return apiWrapper({
        endpoint: "/api/bank-deposit/create-deposit-request",
        method: "POST",
        payload: formData,
        isFormData: true,
      });
    },
    onSuccess: () => {
      toast.success("Deposit request created successfully");
      dataHandler("bankStep", 4);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to create deposit request. Please try again.");
    },
  });
  const [file, setFile] = useState();
  const [copiedField, setCopiedField] = useState(null);
  const { t } = useTranslation();
  const [showPaymentDets, setShowPaymentDets] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (bankList?.length > 0) {
      setSelectedBank({
        "Bank Name": bankList[0].bank_name,
        "Holder Name": bankList[0].holder_name,
        "Account Number": bankList[0].account_number,
        ...(bankList[0].iban && { IBAN: bankList[0].iban }),
        ...(bankList[0].swift_code && { "SWIFT/BIC": bankList[0].swift_code }),
        Address: bankList[0].bank_address,
        "Country Name": bankList[0].country_name,
        Currency: bankList[0].currency,
        _id: bankList[0]?._id,
      });
    }
  }, [bankList]);

  const onBackClickHandler = () => {
    if (data.bankStep === 1) {
      if (showPaymentDets === true) {
        setShowPaymentDets(false);
      } else {
        dataHandler("step", 3);
        dataHandler("exchange_rate", data.exchange_rate_backup);
      }
    } else {
      if (data.bankStep === 3) {
        setFile(null);
      }
      dataHandler("bankStep", data.bankStep - 1);
    }
  };

  const handleCopy = async (value, key) => {
    let text = value;

    try {
      await navigator.clipboard.writeText(String(text ?? ""));
      setCopiedField(key);
      toast.success(t("Copied to clipboard"));
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("copy failed", err);
      toast.error(t("Failed to copy"));
    }
  };

  const onClickHandler = async () => {
    if (data.bankStep === 1) {
      if (showPaymentDets === true) {
        dataHandler("bankStep", data.bankStep + 1);
        return;
      }
      if (data.wallet?.currency?.code !== selectedBank.Currency) {
        await mutateAsync();
      }
      setSelectedBank((prev) => ({
        ...prev,
        "Reference (Mandatory)": `AddFunds-${Date.now().toString().slice(3)}-${Math.floor(Math.random() * 100)}`,
      }));

      if (isGuestPayment) {
        setShowPaymentDets(true);
      } else {
        dataHandler("bankStep", data.bankStep + 1);
      }
    } else if (data.bankStep === 4) {
      if (isGuestPayment) {
        toggle();
      } else {
        navigate(`/wallets`);
      }
      return;
    } else if (data.bankStep === 3) {
      if (!file) {
        toast.error("Please upload a proof of payment before continuing");
        return;
      }

      const formData = new FormData();

      formData.append(
        "amount",
        isGuestPayment ? data.exchange_rate?.receiver?.amount : data.exchange_rate?.total,
      );
      formData.append("receiving_wallet", data.wallet?.wallet_id);
      formData.append("account", userDetails?._id || "");
      formData.append("bank", selectedBank?._id || "");
      formData.append(
        "reference",
        selectedBank["Reference (Mandatory)"] || selectedBank.reference || "",
      );
      formData.append("fee", data.exchange_rate?.fee?.amount);
      formData.append("exchange_rate", data.exchange_rate?.exchange_rate?.exchange_rate || 1);
      formData.append("sendingAmount", data.exchange_rate?.sending?.amount);
      formData.append("sendingCurrency", selectedBank.Currency || selectedBank["Currency"] || "");
      formData.append("type", type);
      if (guestDetails) {
        formData.append("guest_details", JSON.stringify(guestDetails));
      }
      if (client_reference) {
        formData.append("client_reference", client_reference);
      }
      formData.append("file", file);

      createDepositMutation.mutate(formData);
    } else {
      dataHandler("bankStep", data.bankStep + 1);
    }
  };

  return (
    <div
      style={{
        minHeight: window.innerWidth < 1000 && isGuestPayment && "70vh",
      }}
      className={styles.container}
    >
      {/* Bank Lists */}
      {data.bankStep === 1 && (
        <>
          {showPaymentDets ? (
            <PaymentDetails data={data} dataHandler={dataHandler} isBankDeposit={true} />
          ) : (
            <div className={styles.bankList}>
              <h4>
                {t("Select the InstaPay bank account that you want to transfer the funds to")}:
              </h4>
              {isLoading ? (
                <div style={{ width: "200px", margin: "2rem auto" }}>
                  <InstaPayLoader />
                </div>
              ) : bankList?.length > 0 ? (
                <div className={styles.list}>
                  {bankList?.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setSelectedBank({
                          "Bank Name": item.bank_name,
                          "Holder Name": item.holder_name,
                          "Account Number": item.account_number,
                          ...(item.iban && { IBAN: item.iban }),
                          ...(item.swift_code && {
                            "SWIFT/BIC": item.swift_code,
                          }),
                          Address: item.bank_address,
                          "Country Name": item.country_name,
                          Currency: item.currency,
                          _id: item?._id,
                        })
                      }
                      className={`${styles.item} ${selectedBank?._id === item?._id && styles.selected}`}
                    >
                      <span>
                        {item.bank_name}, {item.country_name}
                      </span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="#5926F0"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#666",
                  }}
                >
                  {t("Sorry, no InstaPay bank accounts are available.")}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {data.bankStep === 2 && (
        <div className={styles.bankDets}>
          <h4>
            <Trans
              i18nKey="To fund your wallet, please make a bank transfer of <strong>{{amount}}</strong> to the account below. It is essential that you include your unique reference code: <strong>{{id}}</strong>  in the transfer details. This allows us to credit your wallet correctly."
              components={{
                strong: <strong />,
              }}
              values={{
                amount: `${formatCurrency(data.exchange_rate?.sending?.amount)} ${data.exchange_rate?.sending?.currency}`,
                id: selectedBank["Reference (Mandatory)"],
              }}
            />
          </h4>

          <div
            style={{
              height: window.innerWidth > 1000 && "500px",
              overflow: "auto",
            }}
            className={styles.bankData}
          >
            {Object.keys(selectedBank)?.map(
              (key, idx) =>
                key !== "_id" && (
                  <div key={idx} className={styles.data}>
                    <p>{key}</p>

                    <div>
                      <span>
                        {selectedBank[key]}
                        {copiedField === key && (
                          <em
                            style={{
                              marginLeft: 8,
                              color: "#5926F0",
                              fontSize: 12,
                            }}
                          >
                            {" "}
                            ({t("Copied")})
                          </em>
                        )}
                      </span>

                      <button
                        onClick={() => handleCopy(selectedBank[key], key)}
                        aria-label={`Copy ${key}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          marginLeft: 8,
                          cursor: "pointer",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_5849_2992)">
                            <path
                              d="M5.33203 5.33331V3.46665C5.33203 2.71991 5.33203 2.34654 5.47736 2.06133C5.60519 1.81044 5.80916 1.60647 6.06004 1.47864C6.34526 1.33331 6.71863 1.33331 7.46536 1.33331H12.532C13.2788 1.33331 13.6521 1.33331 13.9374 1.47864C14.1882 1.60647 14.3922 1.81044 14.52 2.06133C14.6654 2.34654 14.6654 2.71991 14.6654 3.46665V8.53331C14.6654 9.28005 14.6654 9.65342 14.52 9.93863C14.3922 10.1895 14.1882 10.3935 13.9374 10.5213C13.6521 10.6666 13.2788 10.6666 12.532 10.6666H10.6654M3.46536 14.6666H8.53203C9.27877 14.6666 9.65214 14.6666 9.93735 14.5213C10.1882 14.3935 10.3922 14.1895 10.52 13.9386C10.6654 13.6534 10.6654 13.28 10.6654 12.5333V7.46665C10.6654 6.71991 10.6654 6.34654 10.52 6.06133C10.3922 5.81044 10.1882 5.60647 9.93735 5.47864C9.65214 5.33331 9.27877 5.33331 8.53203 5.33331H3.46536C2.71863 5.33331 2.34526 5.33331 2.06004 5.47864C1.80916 5.60647 1.60519 5.81044 1.47736 6.06133C1.33203 6.34654 1.33203 6.71991 1.33203 7.46665V12.5333C1.33203 13.28 1.33203 13.6534 1.47736 13.9386C1.60519 14.1895 1.80916 14.3935 2.06004 14.5213C2.34526 14.6666 2.71863 14.6666 3.46536 14.6666Z"
                              stroke="#5926F0"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_5849_2992">
                              <rect width="16" height="16" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {data.bankStep === 3 && (
        <div className={styles.fileUpload}>
          <h4>
            {t(
              "After completing your bank transfer, upload a screenshot or receipt as proof of payment.",
            )}
          </h4>

          <Dropzone file={file} setFile={setFile} />
        </div>
      )}

      {data.bankStep === 4 && (
        <div className={styles.success}>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                d="M8.0013 15.4167H13.0013M6.0013 1.66666H15.0013C15.468 1.66666 15.7014 1.66666 15.8796 1.75748C16.0364 1.83738 16.1639 1.96486 16.2438 2.12166C16.3346 2.29992 16.3346 2.53328 16.3346 2.99999V4.72875C16.3346 5.1364 16.3346 5.34023 16.2886 5.53204C16.2478 5.7021 16.1804 5.86468 16.089 6.0138C15.986 6.18199 15.8418 6.32612 15.5536 6.61437L13.1108 9.05718C12.7808 9.3872 12.6158 9.5522 12.5539 9.74248C12.4996 9.90985 12.4996 10.0901 12.5539 10.2575C12.6158 10.4478 12.7808 10.6128 13.1108 10.9428L15.5536 13.3856C15.8418 13.6739 15.986 13.818 16.089 13.9862C16.1804 14.1353 16.2478 14.2979 16.2886 14.4679C16.3346 14.6597 16.3346 14.8636 16.3346 15.2712V17C16.3346 17.4667 16.3346 17.7001 16.2438 17.8783C16.1639 18.0351 16.0364 18.1626 15.8796 18.2425C15.7014 18.3333 15.468 18.3333 15.0013 18.3333H6.0013C5.53459 18.3333 5.30124 18.3333 5.12298 18.2425C4.96617 18.1626 4.83869 18.0351 4.7588 17.8783C4.66797 17.7001 4.66797 17.4667 4.66797 17V15.2712C4.66797 14.8636 4.66797 14.6597 4.71402 14.4679C4.75485 14.2979 4.82219 14.1353 4.91357 13.9862C5.01664 13.818 5.16076 13.6739 5.44902 13.3856L7.89183 10.9428C8.22184 10.6128 8.38685 10.4478 8.44867 10.2575C8.50305 10.0901 8.50305 9.90985 8.44867 9.74248C8.38685 9.5522 8.22184 9.38719 7.89183 9.05718L5.44902 6.61437C5.16077 6.32612 5.01664 6.18199 4.91357 6.0138C4.82219 5.86468 4.75485 5.7021 4.71402 5.53204C4.66797 5.34023 4.66797 5.1364 4.66797 4.72875V2.99999C4.66797 2.53328 4.66797 2.29992 4.7588 2.12166C4.83869 1.96486 4.96617 1.83738 5.12298 1.75748C5.30124 1.66666 5.53459 1.66666 6.0013 1.66666Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h4 style={{ color: "black", textAlign: "center", marginBottom: "0px" }}>
            {t(
              "We are checking your transfer details. This may take up to 1–3 business days. You’ll receive a confirmation when your wallet is credited.",
            )}
          </h4>
        </div>
      )}

      <div className={styles.bottom}>
        <div></div>
        <div
          className={`${styles?.buttons} ${isGuestPayment && window.innerWidth < 1000 && styles.mobileButtons}`}
        >
          {data.bankStep < 4 && (
            <button
              className={styles.transparent}
              onClick={onBackClickHandler}
              disabled={data.loading}
            >
              {t("Back")}
            </button>
          )}
          <button
            disabled={
              isLoading ||
              (data.bankStep === 3 && !file) ||
              isPending ||
              createDepositMutation.isPending
            }
            onClick={onClickHandler}
          >
            {data.bankStep === 4
              ? isGuestPayment
                ? t("Close")
                : t("Go back to wallets")
              : data.bankStep === 3
                ? t("Continue")
                : t("Next")}
            {window.innerWidth > 1000 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDeposit;
