import axios from "axios";
import { countries } from "country-list-json";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Check, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import { Input, Label } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../../Loader";
import faded_lines from "../files/faded_lines.png";
import styles from "./styles/AirlineDetails.module.css";

let timeout;

const AirtimeDetails = ({
  setSubStep,
  service,
  providers,
  serviceType,
  setServiceType,
  country,
  wallet,
  setWallet,
  packages,
  setPackages,
  pkgDetails,
  setPkgDetails,
  amount,
  setAmount,
  setConfirmed,
  phone,
  setToken,
  subServices,
  setSubServices,
  subServicesProvider,
  setSubServicesProvider,
  setProviders,
  setPhone,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [exchangeLoader, setExchangeLoader] = useState(false);
  const [exchangeError, setExchangeError] = useState("");

  const { userWallets, authHeader, userDetails } = useContext(UserContext);
  const countryCode = useMemo(
    () =>
      countries.filter((it) => country?.name?.toLowerCase()?.includes(it.name.toLowerCase()))?.[0]
        ?.code,
    [country],
  );
  const [showBelowPhone, setShowBelowPhone] = useState(false);

  const verifyPhone = async () => {
    setShowBelowPhone(false);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-airtime/+${phone}`,
      );
      const data = await decryptData(res.data.data);
      setProviders(...data);
      setShowBelowPhone(true);
    } catch (error) {
      // console.log(decryptData(error?.response?.data?.data))
      toast.error("Invalid phone number!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (phone.length >= 7) {
        verifyPhone();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [phone]);

  const getExchangeRate = async (setLoader, currency, amount, exchangeCurrency) => {
    setExchangeError("");
    setLoader(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-exchange-rate?from=${currency}&to=${exchangeCurrency}&amount=${amount}&type=wallet_to_wallet&level_id=${userDetails.level?._id}&account_id=${userDetails?._id}`,
        {
          headers: authHeader,
        },
      );

      const dec = await decryptData(res.data.data);
      // console.log(dec)
      setPkgDetails((prev) => {
        return {
          ...prev,
          ["prices"]: {
            ["unit"]: dec?.data?.recipient?.currency,
            ["amount"]: dec?.data?.recipient?.value,
          },
        };
      });
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      setExchangeError(dec?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    const getSubServices = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/dt/sub-services-in-country/${country?.alpha3}/${providers?.id}/${service}`,
        );
        const data = decryptData(res.data.data);
        // console.log(data)
        setSubServices(data);
      } catch (error) {
        // console.log(decryptData(error?.response?.data?.data))
        toast.error("Something went wrong while getting details!");
      } finally {
        setIsLoading(false);
      }
    };

    if (service && showBelowPhone) {
      getSubServices();
    }
  }, [showBelowPhone, service]);

  const getServices = async () => {
    setServiceLoading(true);
    setSubServicesProvider([]);
    setPackages("");
    setPkgDetails(null);
    try {
      const data = {
        wallet_id: wallet,
        amount,
      };
      // console.log(data)
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/dt/products/${country?.alpha3}/${providers?.id}/${service}/${serviceType}`,
        {
          data: encryptData(data),
        },
      );
      const dec = await decryptData(res.data.data);
      setSubServicesProvider(dec?.products);
      // console.log(dec?.products)
    } catch (error) {
      // console.log(decryptData(error?.response?.data?.data))
      toast.error("Something went wrong while getting details!");
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => {
    if (serviceType !== "") {
      getServices();
    }
  }, [serviceType]);

  const curWal = useMemo(() => {
    return userWallets?.filter((item) => item?._id === wallet)?.[0];
  }, [wallet]);

  useEffect(() => {
    if (wallet && serviceType !== "") {
      const curWal = userWallets?.filter((item) => item?._id === wallet)?.[0];
      // console.log("pkg", curWal, pkgDetails)
      if (curWal?.currency?.code !== "USD") {
        getExchangeRate(
          setExchangeLoader,
          pkgDetails?.prices?.unit,
          pkgDetails?.prices?.amount,
          curWal?.currency?.code,
        );
        return;
      }
      getServices();
    }
  }, [wallet]);
  useEffect(() => {
    if (packages) {
      const curWal = userWallets?.filter((item) => item?._id === wallet)?.[0];
      const pkg = subServicesProvider?.filter((i) => i?.id == packages)?.[0];
      // console.log("load", curWal, pkg)
      setPkgDetails(pkg);
      getExchangeRate(
        setServiceLoading,
        pkg?.prices?.unit ?? pkg?.unit,
        pkg?.prices?.amount ?? amount,
        curWal?.currency?.code,
      );
      // console.log(pkg)
    }
  }, [packages]);

  useEffect(() => {
    if (serviceType == 11 && subServicesProvider.length === 1) {
      setPackages(subServicesProvider?.[0]?.id);
    }
  }, [subServicesProvider]);

  // dragger
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const [slided, setSlided] = useState(false);

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      setComplete(true);
      setTimeout(() => {
        setSlided(true);
      }, 500);
    } else {
      setConfirmed(false);
    }
  };

  const [selectedPackage, setSelectedPackage] = useState("");

  const getPackageDetails = async () => {
    setExchangeError("");
    setSelectedPackage("");
    try {
      const data = amount
        ? {
            amount: +amount,
            type: "RANGED_VALUE_RECHARGE",
            wallet_id: wallet,
            type: "Other",
          }
        : {
            wallet_id: wallet,
            type: "Other",
          };
      // console.log(data)
      const enc = encryptData(data);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/dt/products/${packages}`,
        {
          data: enc,
        },
        {
          headers: authHeader,
        },
      );
      const decrypted = decryptData(res.data.data);
      setSelectedPackage(decrypted);
    } catch (err) {
      const decrypted = decryptData(err.response.data.data);
      setExchangeError(
        decrypted?.message ??
          decrypted ??
          "We cannot process your request at the moment, please try again later.",
      );
    } finally {
      setExchangeLoader(false);
    }
  };

  useEffect(() => {
    setExchangeLoader(true);
    if (packages) {
      getPackageDetails();
    }
  }, [packages, wallet]);

  useEffect(() => {
    setExchangeLoader(true);
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      getPackageDetails();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [amount]);

  useEffect(() => {
    const createTransaction = async () => {
      // console.log(serviceType, subServicesProvider)
      if (serviceType == 11 && subServicesProvider.length > 1) {
        try {
          const pkg = subServicesProvider.find((item) => item?.id == packages);
          const data = {
            product_id: pkg?.id,
            wallet_id: wallet,
            token: selectedPackage?.token,
            amount: pkg?.prices?.amount,
            number: `+${phone}`,
          };
          const res = await axios.post(
            `${import.meta.env.VITE_IP_DEV_API}/api/dt/create-airtime-transaction`,
            {
              data: encryptData(data),
            },
            {
              headers: authHeader,
            },
          );
          const dec = decryptData(res.data.data);
          // console.log(dec)
          setToken(dec?.token);
          setConfirmed(true);
          setSubStep(4);
        } catch (error) {
          setSlided(false);
          toast.error("Something went wrong while creating transactions!");
          // console.log(decryptData(error?.response?.data?.data))
        }
      } else {
        try {
          const ctData = {
            wallet_id: wallet,
            number: `+${phone}`,
            token: selectedPackage?.token,
            amount: +amount,
          };
          // console.log(ctData)
          const res = await axios.post(
            `${import.meta.env.VITE_IP_DEV_API}/api/dt/create-transaction`,
            {
              data: encryptData(ctData),
            },
            {
              headers: authHeader,
            },
          );
          const dec = decryptData(res.data.data);
          // console.log(dec)
          setToken(dec?.token);
          setConfirmed(true);
          setSubStep(4);
        } catch (error) {
          toast.error("Something went wrong while creating transaction!");
          const decrypted = decryptData(error?.response?.data?.data);
          // console.log(decrypted)
          setSlided(false);
        }
      }
    };

    if (slided) {
      createTransaction();
    }
  }, [slided]);

  useEffect(() => {
    setAmount((pkgDetails?.baseAmount?.min + 1) * 2);
  }, [pkgDetails]);

  return (
    <div className={styles.container}>
      <h5>{t("Airtime Details")}</h5>
      <form className={styles.form}>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <Label>{t("Enter The Phone Number")}</Label>
            <PhoneInput
              countryCodeEditable={false}
              country={countryCode?.toLowerCase()}
              disableDropdown={true}
              value={phone}
              onChange={(e) => {
                setPhone(e);
              }}
              containerStyle={{
                border: "none",
                display: "flex",
                gap: ".5rem",
                flexDirection: "row-reverse",
                height: "40px",
              }}
              inputStyle={{
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.13)",
                background: "#FFF",
                padding: "1.25rem",
                width: "100%",
                height: "40px",
              }}
              buttonStyle={{
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.13)",
                background: "#FFF",
                position: "static",
              }}
            />
          </div>
          {showBelowPhone ? (
            <>
              {" "}
              {isLoading ? (
                <div
                  style={{
                    height: "200px",
                    width: "200px",
                    margin: "1rem auto",
                  }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <div>
                  <Label
                    style={{
                      color: "#7D7D7D",
                      fontSize: "1rem",
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: "170%",
                    }}
                  >
                    {t("Service Type")}
                  </Label>
                  <Input
                    style={{
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.13)",
                      background: "#FFF",
                    }}
                    type="select"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("--Select-A-Service--")}
                    </option>
                    {subServices.map((item) => (
                      <option value={item?.id}>{item?.name}</option>
                    ))}
                  </Input>
                </div>
              )}
              {serviceType && (serviceType != 11 || subServicesProvider.length > 1) && (
                <>
                  {serviceLoading ? (
                    <div
                      style={{
                        height: "200px",
                        width: "200px",
                        margin: "1rem auto",
                      }}
                    >
                      <InstaPayLoader />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <Label
                            style={{
                              color: "#7D7D7D",
                              fontSize: "1rem",
                              fontStyle: "normal",
                              fontWeight: 600,
                              lineHeight: "170%",
                            }}
                          >
                            {t("Package")}
                          </Label>
                          <Input
                            style={{
                              borderRadius: "8px",
                              border: "1px solid rgba(0, 0, 0, 0.13)",
                              background: "#FFF",
                            }}
                            type="select"
                            value={packages}
                            onChange={(e) => setPackages(e.target.value)}
                          >
                            <option value="" disabled>
                              {t("--Select-A-Package--")}
                            </option>
                            {subServicesProvider?.map((item) => (
                              <option value={item?.id}>{item?.name}</option>
                            ))}
                          </Input>
                        </div>
                        <div style={{ width: "120px" }}>
                          <Label
                            style={{
                              color: "#7D7D7D",
                              fontSize: "1rem",
                              fontStyle: "normal",
                              fontWeight: 600,
                              lineHeight: "170%",
                            }}
                          >
                            {t("Wallet")}
                          </Label>
                          <Input
                            style={{
                              borderRadius: "8px",
                              border: "1px solid rgba(0, 0, 0, 0.13)",
                              background: "#FFF",
                            }}
                            type="select"
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                          >
                            {userWallets
                              ?.filter(
                                (item) =>
                                  item?.wallet_type === "insta" &&
                                  !item?.blocked &&
                                  !item?.admin_blocked &&
                                  !item?.blocked &&
                                  !item?.admin_blocked &&
                                  item?.status === "active",
                              )
                              ?.map((item) => (
                                <option value={item?._id}>{item?.currency?.code} </option>
                              ))}
                          </Input>
                        </div>
                      </div>
                      {pkgDetails && (
                        <>
                          {exchangeLoader ? (
                            <div
                              style={{
                                height: "70px",
                                width: "70px",
                                margin: "0 auto",
                              }}
                            >
                              <InstaPayLoader />
                            </div>
                          ) : exchangeError ? (
                            <div
                              style={{
                                fontSize: ".8rem",
                                fontWeight: 500,
                                textAlign: "center",
                                margin: "1rem",
                              }}
                            >
                              {exchangeError}
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  marginTop: ".5rem",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0 .7rem",
                                }}
                              >
                                <span style={{ fontWeight: "600" }}>{t("Total")}:</span>
                                <strong style={{ fontWeight: "700" }}>
                                  {selectedPackage?.response ? (
                                    <>
                                      {selectedPackage?.response?.total}{" "}
                                      {selectedPackage?.response?.unit}
                                    </>
                                  ) : (
                                    <>
                                      {selectedPackage?.filteredData?.[0]?.total}{" "}
                                      {selectedPackage?.filteredData?.[0]?.unit}
                                    </>
                                  )}
                                </strong>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  marginTop: ".5rem",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0 .7rem",
                                }}
                              >
                                <span style={{ fontWeight: "600" }}>{t("Fees")}:</span>
                                <strong style={{ fontWeight: "700" }}>
                                  {selectedPackage?.response ? (
                                    <>
                                      {selectedPackage?.response?.fee}{" "}
                                      {selectedPackage?.response?.unit}
                                    </>
                                  ) : (
                                    <>
                                      {selectedPackage?.filteredData?.[0]?.fee}{" "}
                                      {selectedPackage?.filteredData?.[0]?.unit}
                                    </>
                                  )}
                                </strong>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              {serviceType == 11 && subServicesProvider.length === 1 && (
                <>
                  {serviceLoading ? (
                    <div
                      style={{
                        height: "200px",
                        width: "200px",
                        margin: "1rem auto",
                      }}
                    >
                      <InstaPayLoader />
                    </div>
                  ) : (
                    <>
                      <>
                        {pkgDetails && (
                          <>
                            <div style={{ display: "flex", gap: "1rem" }}>
                              <div style={{ flex: 1 }}>
                                <Label
                                  style={{
                                    color: "#7D7D7D",
                                    fontSize: "1rem",
                                    fontStyle: "normal",
                                    fontWeight: 600,
                                    lineHeight: "170%",
                                  }}
                                >
                                  {t("Amount")} ({(pkgDetails?.baseAmount?.min + 1)?.toFixed(2)}{" "}
                                  {curWal?.currency?.code} -{" "}
                                  {(pkgDetails?.baseAmount?.max + 1)?.toFixed(2)}{" "}
                                  {curWal?.currency?.code} )
                                </Label>
                                <Input
                                  style={{
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0, 0, 0, 0.13)",
                                    background: "#FFF",
                                  }}
                                  className="mb-2"
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                />
                                <span style={{ color: "red" }}>
                                  {pkgDetails?.baseAmount?.min + 1 > amount ||
                                  pkgDetails?.baseAmount?.max + 1 < amount
                                    ? `Amount must be between ${(pkgDetails?.baseAmount?.min + 1)?.toFixed(2)} ${curWal?.currency?.code}  - ${(pkgDetails?.baseAmount?.max + 1)?.toFixed(2)} ${curWal?.currency?.code} `
                                    : ""}
                                </span>
                              </div>
                              <div style={{ width: "120px" }}>
                                <Label
                                  style={{
                                    color: "#7D7D7D",
                                    fontSize: "1rem",
                                    fontStyle: "normal",
                                    fontWeight: 600,
                                    lineHeight: "170%",
                                  }}
                                >
                                  {t("Wallet")}
                                </Label>
                                <Input
                                  style={{
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0, 0, 0, 0.13)",
                                    background: "#FFF",
                                  }}
                                  type="select"
                                  value={wallet}
                                  onChange={(e) => setWallet(e.target.value)}
                                >
                                  {userWallets
                                    ?.filter(
                                      (item) =>
                                        item?.wallet_type === "insta" &&
                                        !item?.blocked &&
                                        !item?.admin_blocked &&
                                        !item?.blocked &&
                                        !item?.admin_blocked &&
                                        item?.status === "active",
                                    )
                                    ?.map((item) => (
                                      <option value={item?._id}>{item?.currency?.code} </option>
                                    ))}
                                </Input>
                              </div>
                            </div>
                            {pkgDetails && (
                              <>
                                {exchangeLoader ? (
                                  <div
                                    style={{
                                      height: "70px",
                                      width: "70px",
                                      margin: "0 auto",
                                    }}
                                  >
                                    <InstaPayLoader />
                                  </div>
                                ) : exchangeError ? (
                                  <div
                                    style={{
                                      fontSize: ".8rem",
                                      fontWeight: 500,
                                      textAlign: "center",
                                      margin: "1rem",
                                    }}
                                  >
                                    {exchangeError}
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        marginTop: ".5rem",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0 .7rem",
                                      }}
                                    >
                                      <span style={{ fontWeight: "600" }}>{t("Total")}:</span>
                                      <strong style={{ fontWeight: "700" }}>
                                        {selectedPackage?.response ? (
                                          <>
                                            {selectedPackage?.response?.total}{" "}
                                            {selectedPackage?.response?.unit}
                                          </>
                                        ) : (
                                          <>
                                            {selectedPackage?.filteredData?.[0]?.total}{" "}
                                            {selectedPackage?.filteredData?.[0]?.unit}
                                          </>
                                        )}
                                      </strong>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        marginTop: ".5rem",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0 .7rem",
                                      }}
                                    >
                                      <span style={{ fontWeight: "600" }}>{t("Fees")}:</span>
                                      <strong style={{ fontWeight: "700" }}>
                                        {selectedPackage?.response ? (
                                          <>
                                            {selectedPackage?.response?.fee}{" "}
                                            {selectedPackage?.response?.unit}
                                          </>
                                        ) : (
                                          <>
                                            {selectedPackage?.filteredData?.[0]?.fee}{" "}
                                            {selectedPackage?.filteredData?.[0]?.unit}
                                          </>
                                        )}
                                      </strong>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        marginTop: ".5rem",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0 .7rem",
                                      }}
                                    >
                                      <span style={{ fontWeight: "600" }}>
                                        {t("Total Receiver Gets")}:
                                      </span>
                                      <strong style={{ fontWeight: "700" }}>
                                        {selectedPackage?.response ? (
                                          <>
                                            {selectedPackage?.response?.sending_amount}{" "}
                                            {selectedPackage?.response?.unit}
                                          </>
                                        ) : (
                                          <>
                                            {selectedPackage?.filteredData?.[0]?.sending_amount ??
                                              amount}{" "}
                                            {selectedPackage?.filteredData?.[0]?.unit}
                                          </>
                                        )}
                                      </strong>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            ""
          )}
        </div>
        {serviceType &&
          selectedPackage &&
          (serviceType != 11 || subServicesProvider.length > 1
            ? packages && wallet
            : pkgDetails?.baseAmount?.min + 1 <= amount &&
              pkgDetails?.baseAmount?.max + 1 >= amount &&
              wallet) && (
            <div
              ref={divRef}
              style={{
                textAlign: "center",
                position: "relative",
                background:
                  "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                backgroundBlendMode: "color-burn,normal",
                boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                borderRadius: "16px",
                padding: "1rem",
                width: "100%",
                margin: "1rem auto 0",
                overflow: "hidden",
              }}
            >
              <img
                src={faded_lines}
                alt="faded"
                style={{
                  position: "absolute",
                  left: "-130px",
                  display: complete ? "none" : "inherit",
                  width: "130px",
                }}
                ref={svgRef}
              />
              <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid white",
                    height: "40px",
                    width: "40px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                  ref={chevRef}
                >
                  {complete ? (
                    <Check color="white" size={30} />
                  ) : (
                    <ChevronRight color="white" size={30} />
                  )}
                </div>
              </Draggable>
              <p
                style={{
                  marginBottom: "0",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: "white",
                  display: complete ? "none" : "inherit",
                }}
                ref={pRef}
              >
                {t("Slide To Confirm")}
              </p>
              {complete && (
                <p
                  style={{
                    marginBottom: "0",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  {t("Payment Confirmed")}
                </p>
              )}
            </div>
          )}
      </form>
    </div>
  );
};

export default AirtimeDetails;
