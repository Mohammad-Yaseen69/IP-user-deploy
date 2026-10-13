import { Check, ChevronLeft, ChevronRight, HelpCircle, Search, X, XCircle } from "react-feather";
import { Badge, Button, Card, CardBody, Input } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import BeneficiaryCard from "./BeneficiaryCard";
import InviteFriendModal from "./InviteFriendModal";
import { useLocation, useNavigate } from "react-router";
import AddCSVModal from "../Payments/CSVModal";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import countries from "./CountriesData.json";
import { BsThreeDots } from "react-icons/bs";
import InstaPayLoader from "../Loader";
import { Link } from "react-router-dom";
import stylesForButtons from "./InternationalFlow/styles/index.module.css";
import i18next from "i18next";

const PaymentsBeneficiary = ({
  beneficiary,
  setBeneficiary,
  setSubStep,
  type = "Sending",
  payoutChannel = "",
  international = null,
  country = null,
  countryCode = null,
  backHandler = () => {},
}) => {
  const { t } = useTranslation();
  const {
    beneficiaries,
    userWallets,
    authHeader,
    registeredBeneficiaries,
    userDetails,
    getUserBeneficiaries,
  } = useContext(UserContext);
  const [filtered, setFiltered] = useState([]);
  const [searched, setSearched] = useState([]);
  const [isBulk, setIsBulk] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const csvModalToggle = () => setShowCSVModal(!showCSVModal);
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [quotationError, setQuotationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addMessage, setAddMessage] = useState("");

  // useEffect(() => {
  //     // console.log(country, filtered)
  //     if (country && filtered.length > 0) {
  //         const f = filtered.filter(item => item?.country_name?.toLowerCase()?.includes(country?.toLowerCase()))
  //         setFiltered(f)
  //     }
  // }, [country])

  useEffect(() => {
    let fil = payoutChannel
      ? beneficiaries.filter((item) =>
          item.account_type.some((item) =>
            item.toLowerCase().includes(payoutChannel.toLowerCase()),
          ),
        )
      : registeredBeneficiaries;

    fil = [];
    if (fil?.length === 0) {
      setAddMessage(t(`You have no beneficiary.`));
    }

    if (country) {
      fil = fil.filter((item) =>
        item?.country_name?.toLowerCase()?.includes(country?.toLowerCase()),
      );

      if (fil?.length === 0) {
        setAddMessage(
          t("You have no beneficiary from ${country} having ${payoutChannel} details.")
            .replace("${country}", country)
            ?.replace("${payoutChannel}", payoutChannel),
        );
      }
    }

    if (payoutChannel === "mobile") {
      // You have no beneficiary from ${country} having ${} details.
      fil = fil.filter(
        (item) => item?.mobile_wallet?.[0]?.money_provider == international?.payer_id,
      );
      if (fil?.length === 0) {
        setAddMessage(
          t("You have no beneficiary from ${country} having ${payoutChannel} details.")
            .replace("${country}", country)
            ?.replace(
              "${payoutChannel}",
              international?.subServices?.find((item) => item?.id === international?.payer_id)
                ?.name,
            ),
        );
      }
    }

    setFiltered(fil);
  }, [registeredBeneficiaries, i18next.language]);

  useEffect(() => {
    getUserBeneficiaries();
  }, []);

  const createQuotations = (ben = []) => {
    const benef = ben?.length > 0 ? ben : beneficiary;
    setQuotationError(false);
    setIsChecking(true);
    if (type === "Requesting" || type === "Quoting") {
      setIsChecking(false);
      setSubStep((prev) => prev + 1);
    }
    if (benef.length > 0 && international !== null) {
      benef.forEach((item) => {
        const data = {
          amount: +international?.amount,
          token: international?.token,
          payerId: international?.payer_id,
          wallet_id: userWallets?.filter(
            (it) => it?.currency?.code?.toLowerCase() === international?.currency?.toLowerCase(),
          )[0]?._id,
          transaction_type: item?.beneficiary_type
            ? item?.beneficiary_type === "individual"
              ? "C2C"
              : "C2B"
            : item?.account_type === "individual"
              ? "C2C"
              : "C2B",
          service_name:
            payoutChannel === "bank"
              ? "international_bank_transfer"
              : payoutChannel === "mobile"
                ? "international_mobile_wallet"
                : payoutChannel === "card"
                  ? "international_card_payment"
                  : payoutChannel === "cash"
                    ? "international_cash_pickup"
                    : "",
          channel_name:
            payoutChannel === "bank"
              ? "bank_account"
              : payoutChannel === "mobile"
                ? "mobile_money"
                : payoutChannel === "card"
                  ? "card_payment"
                  : payoutChannel === "cash"
                    ? "cash_pickup"
                    : "",
          iso_code: countryCode,
        };
        console.log(data);
        const encrypted = encryptData(data);

        axios
          .post(
            `${import.meta.env.VITE_THUNES_API}/createQuotation`,
            {
              data: encrypted,
            },
            {
              headers: authHeader,
            },
          )
          .then((res) => {
            international.setCreatedQuotation(decryptData(res.data.data));
            setIsValid(true);
            setIsChecking(false);
          })
          .catch((err) => {
            // console.log(decryptData(err.response.data.data))
            setIsValid(false);
            setIsChecking(false);
            setQuotationError(true);
          });
      });
    }
  };
  useEffect(() => {
    if (isValid) {
      setSubStep((prev) => prev + 1);
    }
  }, [isValid]);

  const searchUser = (argQuery = "") => {
    if (international === null) {
      setIsLoading(true);
      const query = argQuery
        ? argQuery
        : searchQuery.startsWith("@")
          ? searchQuery.slice(1)
          : searchQuery;
      console.log(query);
      axios
        .get(`${import.meta.env.VITE_IP_DEV_API}/api/account/search-users/${query}`, {
          headers: authHeader,
        })
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          setSearched(decrypted?.users ?? []);
          setIsLoading(false);
          setIsError("");
          if (decrypted?.users?.length === 0) {
            setIsError("No User Found.");
          }
        })
        .catch((err) => {
          setIsError("No User Found.");
          setSearched([]);
          setIsLoading(false);
        });
    } else {
      const searchBenef = registeredBeneficiaries?.filter((item) => {
        return (
          // ||
          // item?.email?.toLowerCase()?.includes(e.target.value.toLowerCase())
          item?.first_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          item?.last_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          item?.company_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
      });
      setFiltered(searchBenef);
    }
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const user_name = queryParams.get("username");

  useEffect(() => {
    if (user_name) {
      setSearchQuery(user_name);
      searchUser(user_name);
    }
  }, [user_name]);

  useEffect(() => {
    if (user_name && searched) {
      setBeneficiary([searched?.find((item) => item?.username == user_name)]);
    }
  }, [user_name, searched]);

  // url queries
  const url_recipient = queryParams.get("recipient");

  useEffect(() => {
    if (url_recipient && beneficiaries?.length > 0) {
      const fil = beneficiaries?.filter((item) => item?._id == url_recipient)?.[0];
      setBeneficiary([fil]);
      createQuotations([fil]);
    }
  }, [beneficiaries, url_recipient]);
  return (
    <Card
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        // gap: "1.3rem",
        // maxHeight: "540px",
        display: "flex",
        position: "relative",
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          borderRadius: "20px",
          padding: "14px",
          background: window.innerWidth > 1000 ? "rgba(0,0,0,.03)" : "#fff",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        {type !== "Quoting" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h5
                style={{
                  fontSize: ".8rem",
                  fontWeight: 500,
                  color: "#a0a0a0",
                  marginBottom: 0,
                }}
              >
                {t("Beneficiaries")}:
              </h5>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button
                  style={{
                    all: "unset",
                    padding: ".3rem 1rem",
                    fontSize: ".6rem",
                    background:
                      "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                    borderRadius: "40px",
                    boxShadow:
                      "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                    cursor: "pointer",
                  }}
                  onClick={toggle}
                >
                  <span
                    style={{
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {t("Invite")}
                  </span>
                </button>
                <InviteFriendModal isOpen={isOpen} toggle={toggle} />
                <button
                  style={{
                    all: "unset",
                    padding: ".3rem 1rem",
                    fontSize: ".6rem",
                    background: "white",
                    borderRadius: "40px",
                    boxShadow:
                      "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/beneficiaries")}
                >
                  <span
                    style={{
                      background:
                        "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 500,
                    }}
                  >
                    {t("My Beneficiaries")}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchUser();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            padding: ".25rem .75rem",
            borderRadius: "10px",
            background: "#fff",
            position: "relative",
          }}
        >
          <Search color="#a0a0a0" size={18} />
          <Input
            type="text"
            placeholder={t("Search Users")}
            style={{
              border: "none",
              outline: "none",
              fontSize: ".8rem",
            }}
            value={searchQuery}
            onChange={(e) => {
              setIsError("");
              setSearchQuery(e.target.value);
            }}
          />
          {searchQuery.length > 0 && (
            <Button
              type="submit"
              color="primary"
              disabled={isLoading}
              style={{
                position: "absolute",
                top: "50%",
                right: ".75rem",
                transform: "translateY(-50%)",
                borderRadius: "7px",
                padding: "6px 10px",
                fontSize: ".7rem",
              }}
            >
              {t("Search")}
            </Button>
          )}
        </form>
        {isBulk && (
          <p style={{ fontSize: ".7rem", padding: 0, margin: 0 }}>
            {t("Click on the beneficiaries to select multiple")}
          </p>
        )}
        {(type === "Requesting" || type === "Quoting") &&
        searched.length == 0 &&
        searchQuery.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <p style={{ marginBottom: 0, fontWeight: 600 }}>
              {t("Please follow these examples:")}{" "}
            </p>
            <div>
              {t("Full Name")}: <strong>{t("Muhammad Imtiaz")}</strong>
            </div>
            <div>
              {t("InstaPay/Instagram Username")}: <strong>{t("instauser")}</strong>
            </div>
            <div>
              {t("Email")}: <strong>{t("user@email.com")}</strong>
            </div>
            <div>
              {t("Phone Number")}: <strong>44795396600</strong> ({t("With Country Code")})
            </div>
          </div>
        ) : (
          ""
        )}

        {/* <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "0 0 0", height: "100%", overflowY: "auto", scrollbarWidth: "none", "--max-height": type === "Requesting" ? window.innerWidth > 1000 ? "180px" : "46vh" : type === "Quoting" ? window.innerWidth > 1000 ? "310px" : "65vh" : "none" }} className={"i_t_b_con"}> */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            margin: "0 0 0",
            scrollbarWidth: "none",
            height: "100%",
            overflowY: "auto",
            maxHeight: window.innerWidth > 1600 ? "45vh" : "35vh",
          }}
        >
          {isLoading ? (
            <div style={{ width: "60px", height: "60px", margin: "0 auto" }}>
              <InstaPayLoader />
            </div>
          ) : (
            <>
              {/* {
                                    searched?.some(item => item?._id === userDetails?._id)
                                    &&
                                    <div style={{ textAlign: "center", margin: "1rem 0" }}>{t("You can't perform this action to yourself")}</div>
                                } */}
              {isError && <div style={{ textAlign: "center", margin: "1rem 0" }}>{t(isError)}</div>}
              {searched.length > 0 && (
                <>
                  {/* {searched?._id !== userDetails?._id
                                            ? */}
                  {searched
                    .filter((item) => item?._id !== userDetails?._id)
                    .map((user_searched, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          padding: ".5rem",
                          cursor: "pointer",
                          flex: 1,
                        }}
                      >
                        <div
                          key={user_searched?.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            maxHeight: "72px",
                          }}
                          onClick={() => {
                            // console.log(user_searched)
                            setBeneficiary([user_searched]);
                            window.scrollTo({ top: window.innerHeight * 2 });
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".5rem",
                            }}
                          >
                            {user_searched?.profileImage ? (
                              <img
                                src={user_searched?.profileImage}
                                alt="dp"
                                style={{
                                  width: "35px",
                                  height: "35px",
                                  borderRadius: "25px",
                                  boxShadow: "0 0 3px #1111113e",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "35px",
                                  height: "35px",
                                  borderRadius: "25px",
                                  display: "grid",
                                  placeItems: "center",
                                  background:
                                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                  color: "white",
                                  fontSize: "1rem",
                                  fontWeight: 800,
                                }}
                              >
                                {user_searched?.account_type === "individual"
                                  ? user_searched?.first_name?.[0]?.toUpperCase()
                                  : user_searched?.company_name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: ".3rem",
                                  alignItems: "center",
                                }}
                              >
                                <h5 className="mb-0" style={{ fontSize: ".9rem" }}>
                                  {user_searched?.account_type === "individual"
                                    ? `${user_searched?.first_name} ${user_searched?.last_name}`
                                    : user_searched?.company_name}
                                </h5>
                                {window.innerWidth > 1000 && (
                                  <Badge
                                    style={{
                                      background:
                                        "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                      border: "none",
                                      outline: "none",
                                      fontSize: ".55rem",
                                    }}
                                  >
                                    {user_searched?.account_type?.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              <span style={{ fontSize: ".7rem" }}>
                                {user_searched?.username ?? "No username"}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                              }}
                            >
                              <img
                                src={
                                  countries.filter(
                                    (it) =>
                                      it.name.toLowerCase() ===
                                      user_searched?.country_name?.toLowerCase(),
                                  )[0]?.file_url
                                }
                                alt="flag"
                                style={{
                                  borderRadius: "4px",
                                  boxShadow: "0 0 10px rgba(0,0,0,.3)",
                                  width: "40px",
                                }}
                                className="i_t_flag"
                                draggable="false"
                              />
                              {/* <span style={{ fontSize: "1rem", fontWeight: "700" }}>{countries.filter(it => it.name.toLowerCase() === user_searched?.country?.toLowerCase())[0]?.name}</span> */}
                            </div>
                            {beneficiary?.some((it) => it?._id === user_searched?._id) ? (
                              <Check style={{ fontWeight: "900" }} color="green" />
                            ) : (
                              <BsThreeDots />
                            )}
                          </div>
                        </div>
                        {user_searched?.about_me && (
                          <p
                            style={{
                              margin: ".5rem 45px 0",
                              WebkitLineClamp: 3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <strong>{t("About:")} </strong>
                            {user_searched?.about_me}
                          </p>
                        )}
                      </div>
                    ))}
                  {/* : <div style={{ margin: "1rem auto", textAlign: "center" }}>You can't perform this action to yourself.</div>
                                         } */}
                </>
              )}
            </>
          )}
          <h5>{t("My Beneficiaries")}: </h5>
          {filtered.length > 0 ? (
            filtered
              ?.filter(
                (item) =>
                  item?.email &&
                  item?.phone &&
                  item?.email !== userDetails?.email &&
                  item?.phone !== userDetails?.phone,
              )
              .map((user) => (
                <BeneficiaryCard
                  key={user?._id ?? Date.now()}
                  user={user}
                  isBulk={isBulk}
                  setBeneficiary={setBeneficiary}
                  selectedUser={beneficiary}
                  payoutChannel={payoutChannel}
                  type={type}
                  subService={international?.subServices ?? {}}
                />
              ))
          ) : (
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gpa: ".5rem",
                alignItems: "center",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  display: "flex",
                  gap: "1rem",
                  textAlign: "center",
                  maxWidth: "30ch",
                }}
              >
                {addMessage}
              </span>
              <Link
                style={{
                  textDecoration: "underline",
                  color: "#5926f0",
                  fontWeight: "600",
                }}
                to={"/beneficiaries/add"}
              >
                {t("Add Now")}
              </Link>
            </div>
          )}
        </div>
      </CardBody>
      <div
        className={stylesForButtons.buttonsDesktop}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
        {/* <p style={{ fontSize: window.innerWidth > 1000 ? ".7vw" : ".7rem", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}> */}
        <p
          style={{
            fontSize: window.innerWidth > 1000 ? ".7vw" : ".7rem",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            cursor: "pointer",
          }}
          onClick={() => window.open("https://insta-pay.ch/faqs", "_blank")}
        >
          {quotationError ? (
            <>
              <XCircle size={12} color="red" />
              <span style={{ color: "red" }}>{t("Something went wrong.")}</span>
            </>
          ) : (
            <>
              <HelpCircle size={12} />
              <span>{t(`Trouble ${type} Money?`)}</span>
            </>
          )}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
          <button style={{ all: "unset", cursor: "pointer" }} onClick={backHandler}>
            {t("Back")}
          </button>
          <Button
            size="sm"
            style={{
              border: "none",
              outline: "none",
              background:
                " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
              backgroundBlendMode: "overlay, normal",
              boxShadow:
                "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
            className="i_t_button"
            onClick={createQuotations}
            disabled={isChecking || beneficiary.length < 1}
          >
            {isChecking ? t("Confirming") : t("Confirm")} <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      <div
        className={stylesForButtons.mobileButtons}
        style={{
          display: "none",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
        {/* <p style={{ fontSize: window.innerWidth > 1000 ? ".7vw" : ".7rem", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}> */}
        <div className={stylesForButtons?.buttons}>
          <button onClick={backHandler}>
            <ChevronLeft />
          </button>
          <button
            className={stylesForButtons?.full}
            onClick={createQuotations}
            disabled={isChecking || beneficiary.length < 1}
          >
            {isChecking ? t("Confirming") : t("Confirm")} <ChevronRight size={20} />
          </button>
        </div>

        <p
          style={{
            fontSize: window.innerWidth > 1000 ? ".7vw" : ".7rem",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            cursor: "pointer",
          }}
          onClick={() => window.open("https://insta-pay.ch/faqs", "_blank")}
        >
          {quotationError ? (
            <>
              <XCircle size={12} color="red" />
              <span style={{ color: "red" }}>{t("Something went wrong.")}</span>
            </>
          ) : (
            <>
              <HelpCircle size={12} />
              <span>{t(`Trouble ${type} Money?`)}</span>
            </>
          )}
        </p>
      </div>
    </Card>
  );
};

export default PaymentsBeneficiary;
