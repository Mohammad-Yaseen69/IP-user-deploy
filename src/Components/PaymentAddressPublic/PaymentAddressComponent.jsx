import { useEffect, useRef, useReducer } from "react";
import styles from "./styles/PAC.module.scss";
import { Card, CardBody, CardText } from "reactstrap";
import countries from "../PaymentsNewer/CountriesData.json";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QrDetails from "./QrDetails";
import PayAsGuest from "./PayAsGuest";
import { formatCurrency } from "../../Helper/AmountFormat";
import { toast } from "react-toastify";
import InstaPayLoader from "../Loader";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "./styles/swiper.reset.css";
import PortfolioCard from "../Portfolio/PortfolioCard";
import useWindowWidth from "../../utils/useWindowWidth";
import ip from "./instapay_black.svg";
import { getCroppedImg } from "../../Context/UserContext";
import UserDets from "./UserDets";
import AmountContainer from "./AmountContainer";
import PayWithCrypto from "./PayWithCrypto";
import LanguagePicker from "../LanguagePicker";

// Initial state
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
  cryptoDetails: {
    name: "",
    phone: "",
    reason: "",
    email: "",
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
  const { t } = useTranslation();
  return (
    <div
      style={{
        flex: width > 1350 ? 1.7 : 1.4,
        alignSelf: userVideos.length >= 1 && "stretch",
        position: "relative"
      }}
      className={styles.left}
    >
      {width > 1000 &&
        <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
          <LanguagePicker newUI={true} />
        </div>
      }
      {width > 1000 && (
        <div className={styles.left_top}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexDirection: "row",
            }}
          >
            <div>
              <span>{t("Get Paid Instantly Worldwide. ")}</span>
              <p>{t("Your socials are now your bank—Receive money straight to your bank, wallet, crypto, or cash pick-up in 180+ countries")}</p>
            </div>
          </div>
          <img src={ip} alt="" />
        </div>
      )}
      <div className={styles.left_bottom}>
        <div>
          {(title || description) && (
            <div className={styles.about}>
              <h4 style={{ marginBottom: "0px" }}>{title}</h4>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#7E7E7E" }}>
                {description}
              </p>
            </div>
          )}
          {userVideos && userVideos.length > 0 && (
            <div className="p-swiper-videos-123">
              <Swiper
                modules={[FreeMode, Mousewheel]}
                spaceBetween={10}
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
    </div>
  );
};

const PaymentAddressComponent = ({ userDetails, userVideos }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const width = useWindowWidth();
  const playerRefs = useRef({});
  const { t } = useTranslation()

  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const handleKeyUp = (e) => {
    formatCurrency(e.target.value, false, (value) =>
      dataHandler("formattedAmount", value)
    );
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, (value) =>
      dataHandler("formattedAmount", value)
    );
  };

  useEffect(() => {
    dataHandler("amount", state.formattedAmount?.replaceAll(",", ""));
  }, [state.formattedAmount]);

  const { user_name } = useParams();

  const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

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

    if (userDetails?.country_name) {
      const normalize = normalizeText(userDetails?.country_name);
      const filteredCountry = countries.find((item) =>
        item.name.toLowerCase().includes(normalize.toLowerCase())
      );

      dataHandler("userCountry", filteredCountry);
    }
    if (user_name) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-payment-address-public/${user_name}`,)
        .then((res) => {
          const decrypted = decryptData(res.data.data);

          dataHandler(
            "paymentAddressDetails",
            decrypted?.paymentAddressDetails
          );
          dataHandler("title", decrypted?.paymentAddressDetails?.title);
          dataHandler("currency", decrypted?.paymentAddressDetails?.currency);
          dataHandler(
            "description",
            decrypted?.paymentAddressDetails?.description
          );
          dataHandler(
            "dp",
            decrypted?.paymentAddressDetails?.profileImage?.url
          );
          dataHandler(
            "cover",
            decrypted?.paymentAddressDetails?.coverImage?.url
          );
          dataHandler("currentWallet", decrypted?.wallet);
          dataHandler("limits", decrypted?.limits);

          const coverPromise = decrypted?.paymentAddressDetails?.coverImage?.url
            ? getImage(
              decrypted?.paymentAddressDetails?.coverImage?.url,
              decrypted?.paymentAddressDetails?.coverImage?.coordinates
            ).then((img) => {
              if (img) dataHandler("croppedCover", img);
            })
            : Promise.resolve();

          const dpPromise = decrypted?.paymentAddressDetails?.profileImage?.url
            ? getImage(
              decrypted?.paymentAddressDetails?.profileImage?.url,
              decrypted?.paymentAddressDetails?.profileImage?.coordinates
            ).then((img) => {
              if (img) dataHandler("croppedDp", img);
            })
            : Promise.resolve();

          Promise.allSettled([coverPromise, dpPromise]).catch(() => { });
        })
        .catch((err) => {
          let errorMsg = "";
          if (err.code === 'ECONNABORTED') {
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
    if (state.amount < state.limits?.topup_min_amount) {

      toast.error(
        t("Minimum amount for guest pay is") +
        formatCurrency(state.limits?.topup_min_amount, true) +
        " " +
        state.currentWallet?.currency?.code
      );
      dataHandler(
        "guestPayError",
        t("Minimum amount for guest pay is") +
        formatCurrency(state.limits?.topup_min_amount, true) +
        " " +
        state.currentWallet?.currency?.code
      );
      setTimeout(() => {
        dataHandler("guestPayError", "");
      }, 3000);
    } else if (state.amount > state.limits?.topup_max_amount) {
      toast.error(
        t("Maximum amount for guest pay is ") +
        formatCurrency(state.limits?.topup_max_amount, true) +
        " " +
        state.currentWallet?.currency?.code
      );
      dataHandler(
        "guestPayError",
        t("Maximum amount for guest pay is ") +
        formatCurrency(state.limits?.topup_max_amount, true) +
        " " +
        state.currentWallet?.currency?.code
      );
      setTimeout(() => {
        dataHandler("guestPayError", "");
      }, 3000);
    } else {
      dataHandler("showCreditModal", !state.showCreditModal);
    }
  };

  const url = `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${state.currentWallet?.wallet_id}&currency=${state.currency}&amount=${state.amount}`;

  return (
    <>
      {state.loading ? (
        <div
          style={{
            height: "100%",
            width: "100%",
            zIndex: 999
          }}
        >
          <InstaPayLoader />
        </div>
      ) : <div className={styles.container}>
        {state.paymentAddressDetails ? (
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
                    paymentAddress={true}
                  />

                  <AmountContainer
                    dataHandler={dataHandler}
                    handleBlur={handleBlur}
                    handleKeyUp={handleKeyUp}
                    isEditable={true}
                    state={state}
                    toggleCreditModal={toggleCreditModal}
                    url={url}
                    toggleCryptoModal={() =>
                      dataHandler("showCryptoModal", true)
                    }
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
                        setPlayingMediaId={(value) =>
                          dataHandler("playingMediaId", value)
                        }
                        title={state.title}
                        user_name={user_name}
                        userDetails={userDetails}
                        userVideos={userVideos}
                        width={width}
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
                    setPlayingMediaId={(value) =>
                      dataHandler("playingMediaId", value)
                    }
                    title={state.title}
                    user_name={user_name}
                    userDetails={userDetails}
                    userVideos={userVideos}
                    width={width}
                  />
                )}
                {/* basic info */}
              </CardBody>
            </Card>
          </>
        ) : (
          <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
            <CardBody>
              <CardText>
                {t("This user hasn't set their payment address yet.")}{" "}
                <Link
                  to={"/"}
                  style={{ textDecoration: "underline", fontWeight: 600 }}
                >
                  {t("Go back to Home.")}
                </Link>
              </CardText>
            </CardBody>
          </Card>
        )}
      </div>
      }
    </>
  );
};

export default PaymentAddressComponent;
