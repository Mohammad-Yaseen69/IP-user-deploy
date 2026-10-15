import { useEffect, useRef, useReducer, lazy } from "react";
import styles from "./styles/PAC.module.scss";
import countries from "../PaymentsNewer/CountriesData.json";
import "swiper/css";
import "swiper/css/pagination";
import "./styles/swiper.reset.css";
import axios from "axios";
import { getCroppedImg } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { Card, CardBody, CardText } from "reactstrap";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Pagination } from "swiper";
import { useQuery } from "@tanstack/react-query";
import useWindowWidth from "../../utils/useWindowWidth";
import ip from "./instapay_black.svg";
import PayWithCrypto from "./PayWithCrypto";
import UserDets from "./UserDets";
import { flagCheck } from "../../utils/Functions";
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation";
import VpnModal from "../Auth/VpnModal";

const QrDetails = lazy(() => import("./QrDetails"));
const PayAsGuest = lazy(() => import("./PayAsGuest"));
const InstaPayLoader = lazy(() => import("../Loader"));
const PortfolioCard = lazy(() => import("../Portfolio/PortfolioCard"));
const AmountContainer = lazy(() => import("./AmountContainer"));
const LanguagePicker = lazy(() => import("../LanguagePicker"));
const AnimatedHeader = lazy(() => import("./AnimatedHeader"));

const initialState = {
  userCountry: {},
  paymentAddressDetails: null,
  title: "",
  currency: "",
  description: "",
  currentWallet: null,
  dp: null,
  cover: null,
  amount: "1.00",
  formattedAmount: "1.00",
  loading: true,
  croppedDp: "",
  croppedCover: "",
  playingMediaId: null,
  limits: { topup_min_amount: 0, topup_max_amount: 0 },
  showAboutModal: false,
  showCreditModal: false,
  guestPayError: "",
  showVerTT: false,
  showCryptoModal: false,
  cryptoStatus: "Not Completed",
  cryptoDetails: {
    name: "",
    phone: "",
    reason: "",
    email: "",
    dob: "",
  },
};

// Simple reducer function
function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
}

<style>
  {`
    .swiper-pagination-bullet {
        background-color: #5926f0 !important;
        opacity: 1 !important;
        width: 8px !important;
        height: 8px !important;
    }
    .swiper-pagination-bullet-active {
        background-color: #5926f0 !important;
    }
`}
</style>;

export const LeftJsx = ({
  width,
  userDetails,
  title,
  description,
  userVideos,
  playingMediaId,
  setPlayingMediaId,
  playerRefs,
  currentWallet,
  amount,
  currency,
  user_name,
  invoiceId,
}) => {
  const queryParams = new URLSearchParams(location.search);
  const isFromQr = queryParams.get("fromQr");
  const { t } = useTranslation();
  return (
    <div
      style={{
        flex: width > 1350 ? 1.7 : 1.4,
        alignSelf: userVideos.length >= 1 && "stretch",
        position: "relative",
      }}
      className={styles.left}
    >
      {width > 1000 && (
        <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
          {flagCheck("allowMultiLanguage", userDetails, "paymentAddress") && (
            <LanguagePicker
              shouldOpenUpRequired={true}
              defaultLanguage={userDetails.langauge}
              newUI={true}
            />
          )}
        </div>
      )}
      {width > 1000 && (
        <div className={styles.left_top}>
          <AnimatedHeader />
          <img src={ip} alt="" onClick={() => (window.location.href = "https://insta-pay.ch")} />
        </div>
      )}
      {!isFromQr && (
        <div className={styles.left_bottom}>
          <div>
            {(flagCheck("allowTitle", userDetails, "paymentAddress") ? title : "") ||
            (flagCheck("allowDescription", userDetails, "paymentAddress") ? description : "") ? (
              <div className={styles.about}>
                {flagCheck("allowTitle", userDetails, "paymentAddress") && (
                  <h4 style={{ marginBottom: "0px" }}>{t(title)}</h4>
                )}
                {flagCheck("allowDescription", userDetails, "paymentAddress") && (
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#7E7E7E",
                    }}
                  >
                    {t(description)}
                  </p>
                )}
              </div>
            ) : null}
            {userVideos &&
              userVideos.length > 0 &&
              flagCheck("allowVideos", userDetails, "paymentAddress") && (
                <div className="p-swiper-videos-123">
                  <Swiper
                    modules={[FreeMode, Mousewheel, Pagination]}
                    spaceBetween={10}
                    pagination={{
                      clickable: true,
                      el: ".portfolio-swiper-pagination",
                    }}
                    slidesPerView={
                      userVideos.length === 1 || window.innerWidth < 700
                        ? 1
                        : userVideos.length === 2
                          ? 2
                          : 2.3
                    }
                    grabCursor={true}
                    freeMode={true}
                    mousewheel={{ forceToAxis: true }}
                  >
                    {userVideos.map((video, index) => (
                      <SwiperSlide key={video._id || index}>
                        <PortfolioCard
                          item={video}
                          pAddress={true}
                          publicP={true}
                          playingMediaId={playingMediaId}
                          setPlayingMediaId={setPlayingMediaId}
                          playerRefs={playerRefs}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div
                    className="portfolio-swiper-pagination"
                    style={{ marginTop: 0, textAlign: "center" }}
                  />
                </div>
              )}
          </div>

          <div>
            <QrDetails
              wallet={currentWallet}
              user={userDetails}
              amount={amount}
              currency={currency}
              username={user_name}
              address={true}
              currentWallet={currentWallet}
              invoiceId={invoiceId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const getLimits = async (userName, wallet_id) => {
  const res = await axios.get(
    `${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-address-limits/${userName}/${wallet_id}`,
  );
  return decryptData(res.data.data)?.limits;
};

const PaymentAddressComponent = ({ userDetails, userVideos }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const width = useWindowWidth();
  const { country, showNoticeModal } = useCountryLocation();
  const playerRefs = useRef({});
  const queryParams = new URLSearchParams(location.search);
  const amount = queryParams.get("amount");

  const { data: limits } = useQuery({
    queryKey: ["getLimits", state?.currentWallet?.wallet_id],
    queryFn: () => getLimits(user_name, state?.currentWallet?.wallet_id),
    enabled: !!state?.currentWallet?.wallet_id,
  });
  const { t } = useTranslation();

  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const handleKeyUp = (e) => {
    formatCurrency(e.target.value, false, (value) => dataHandler("formattedAmount", value));
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, (value) => dataHandler("formattedAmount", value));
  };

  useEffect(() => {
    if (amount) {
      dataHandler("amount", amount);
      dataHandler("formattedAmount", formatCurrency(amount, true));
    }
  }, [amount]);

  useEffect(() => {
    dataHandler("amount", state.formattedAmount?.replaceAll(",", ""));
  }, [state.formattedAmount]);

  const { user_name } = useParams();

  const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  console.log(country, "country");

  const getImage = async (img, c) => {
    try {
      const imageUrl = await getCroppedImg(img, c);
      const image = URL.createObjectURL(imageUrl);
      return image;
    } catch {
      return null;
    }
  };
  useEffect(() => {
    if (userDetails?.country_iso_code) {
      const code = userDetails?.country_iso_code;
      const filteredCountry = countries.find(
        (item) => item.alpha3?.toLowerCase() === code?.toLowerCase(),
      );

      dataHandler("userCountry", filteredCountry);
    }
    if (user_name) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-payment-address-public/${user_name}`,
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);

          dataHandler("paymentAddressDetails", decrypted?.paymentAddressDetails);
          dataHandler("title", decrypted?.paymentAddressDetails?.title);
          dataHandler("currency", decrypted?.paymentAddressDetails?.currency);
          dataHandler("description", decrypted?.paymentAddressDetails?.description);
          dataHandler("dp", decrypted?.paymentAddressDetails?.profileImage?.url);
          dataHandler("cover", decrypted?.paymentAddressDetails?.coverImage?.url);
          dataHandler("currentWallet", decrypted?.wallet);

          const coverPromise = decrypted?.paymentAddressDetails?.coverImage?.url
            ? getImage(
                decrypted?.paymentAddressDetails?.coverImage?.url,
                decrypted?.paymentAddressDetails?.coverImage?.coordinates,
              ).then((img) => {
                if (img) dataHandler("croppedCover", img);
              })
            : Promise.resolve();

          const dpPromise = decrypted?.paymentAddressDetails?.profileImage?.url
            ? getImage(
                decrypted?.paymentAddressDetails?.profileImage?.url,
                decrypted?.paymentAddressDetails?.profileImage?.coordinates,
              ).then((img) => {
                if (img) dataHandler("croppedDp", img);
              })
            : Promise.resolve();

          Promise.allSettled([coverPromise, dpPromise]).catch(() => {});
        })
        .catch((err) => {
          let errorMsg = "";
          if (err.code === "ECONNABORTED") {
            errorMsg = "Request timed out. Please try again later.";
          } else if (err?.response?.status === 404) {
            errorMsg = "This user hasn't set their payment address yet.";
          } else {
            errorMsg = "Failed to load payment address details. Please try again.";
          }
          dataHandler("error", errorMsg);
          try {
            console.log(decryptData(err?.response?.data?.data));
          } catch {
            /* noop */
          }
        })
        .finally(() => {
          dataHandler("loading", false);
        });
    }
  }, [userDetails, user_name]);

  // const copyHandler = () => {
  //     navigator.clipboard.writeText(pa_link)
  //     setUrlCopied(true)
  //     setTimeout(() => {
  //         setUrlCopied(false)
  //     }, 2500)
  // }
  const toggleCreditModal = () => {
    if (state.amount < limits?.topup_min_amount) {
      toast.error(
        t("Minimum amount for guest pay is") +
          " " +
          formatCurrency(limits?.topup_min_amount, true) +
          " " +
          state.currentWallet?.currency?.code,
      );
    } else if (state.amount > limits?.topup_max_amount) {
      toast.error(
        t(
          "The recipient has reached their incoming/balance limit and cannot receive this amount at the moment.",
        ),
      );
    } else {
      dataHandler("showCreditModal", !state.showCreditModal);
    }
  };

  const url = `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${state.currentWallet?.wallet_id}&currency=${state.currency}&amount=${state.amount}`;

  console.log(state);
  return (
    <>
      {state.loading ? (
        <div
          style={{
            height: "100%",
            width: "100%",
            zIndex: 999,
          }}
        >
          <InstaPayLoader fallback />
        </div>
      ) : (
        <div className={styles.container}>
          {showNoticeModal ? (
            <VpnModal showNoticeModal={showNoticeModal} />
          ) : state.paymentAddressDetails ? (
            <>
              {state.showCreditModal && (
                <PayAsGuest
                  amount={state.amount}
                  isOpen={state.showCreditModal}
                  toggle={toggleCreditModal}
                  user={userDetails}
                  wallet={state.currentWallet}
                  username={user_name}
                />
              )}

              {state.showCryptoModal && (
                <PayWithCrypto
                  user={userDetails}
                  data={state}
                  isOpen={state.showCryptoModal}
                  toggle={() => dataHandler("showCryptoModal", false)}
                  dataHandler={dataHandler}
                />
              )}

              <Card
                style={{ marginBottom: "0", boxShadow: "unset", width: "100%" }}
                className={styles.sub_container}
              >
                <CardBody className={styles.sc_body}>
                  <div
                    style={{
                      flex: width > 1000 && width > 1350 ? 0.7 : 1,
                      borderRadius: "16px",
                      background: "white",
                      width: width < 1000 && "100%",
                      overflow: width < 100 && "hidden",
                      alignSelf: width > 1000 && "stretch",
                      display: width > 1000 && "grid",
                      gap: "0px",
                    }}
                    className={styles.right}
                  >
                    <UserDets
                      cover={state.cover}
                      croppedCover={state.croppedCover}
                      croppedDp={state.croppedDp}
                      dp={state.dp}
                      setShowVerTT={(value) => dataHandler("showVerTT", value)}
                      showVerTT={state.showVerTT}
                      userCountry={state.userCountry}
                      userDetails={userDetails}
                      user_name={user_name}
                      user={userDetails}
                      paymentAddress={true}
                      data={state}
                      dataHandler={dataHandler}
                    />

                    <AmountContainer
                      dataHandler={dataHandler}
                      handleBlur={handleBlur}
                      handleKeyUp={handleKeyUp}
                      isEditable={true}
                      state={state}
                      toggleCreditModal={toggleCreditModal}
                      url={url}
                      toggleCryptoModal={() => {
                        dataHandler("showCryptoModal", true);
                        dataHandler("cryptoStatus", "Not Completed");
                      }}
                      userDetails={userDetails}
                    />

                    {width < 1000 && (
                      <div>
                        <LeftJsx
                          amount={state.amount}
                          currency={state.currency}
                          currentWallet={state.currentWallet}
                          description={state.description}
                          playerRefs={playerRefs}
                          playingMediaId={state.playingMediaId}
                          setPlayingMediaId={(value) => dataHandler("playingMediaId", value)}
                          title={state.title}
                          user_name={user_name}
                          userDetails={userDetails}
                          userVideos={userVideos}
                          width={width}
                        />
                      </div>
                    )}
                    {width < 1000 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          flexDirection: "column",
                          marginTop: "3rem",
                        }}
                      >
                        <AnimatedHeader mobileUI />
                        <img
                          src={ip}
                          alt=""
                          style={{ margin: "20px auto", width: "200px" }}
                          onClick={() => (window.location.href = "https://insta-pay.ch")}
                        />
                      </div>
                    )}
                  </div>
                  {width > 1000 && (
                    <LeftJsx
                      amount={state.amount}
                      currency={state.currency}
                      currentWallet={state.currentWallet}
                      description={state.description}
                      playerRefs={playerRefs}
                      playingMediaId={state.playingMediaId}
                      setPlayingMediaId={(value) => dataHandler("playingMediaId", value)}
                      title={state.title}
                      user_name={user_name}
                      userDetails={userDetails}
                      userVideos={userVideos}
                      width={width}
                    />
                  )}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
              <CardBody>
                <CardText>
                  {t("This user hasn't set their payment address yet.")}{" "}
                  <Link to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>
                    {t("Go back to Home.")}
                  </Link>
                </CardText>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  );
};

export default PaymentAddressComponent;
