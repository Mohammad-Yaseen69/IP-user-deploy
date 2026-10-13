import { useContext, useEffect, useRef, useState } from "react";
import TopRight from "../topRight";
import OnBoarding from "./OnBoarding";
import CardPurchased from "./CardPurchased";
import styles from "./styles/index.module.scss";
import TransactionsTable from "./TransactionTable";
import CustomizerContext from "../../Helper/Customizer";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import InstaPayLoader from "../Loader";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import useWindowWidth from "../../utils/useWindowWidth";
import { useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Success from "../AddFunds/ResponseModals/Success";
import Error from "../AddFunds/ResponseModals/Error";

const MyMasterCard = () => {
  const [cardPurchased, setCardPurchased] = useState(false);
  const { setTogglSidebar } = useContext(CustomizerContext);
  const [currentCardDetails, setCurrentCardDetails] = useState({});
  const { userDetails, authHeader } = useContext(UserContext);
  const [cards, setCards] = useState([]);
  const [reRender, setReRender] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const width = useWindowWidth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const addFundsMobile = queryParams.get("addFundsMobile");
  const [searchQuery, setSearchQuery] = useState("");
  const ctcMobile = queryParams.get("ctcMobile");
  const ctwMobile = queryParams.get("ctwMobile");
  const showT = queryParams.get("showT");
  const { status } = useParams();
  const paymentThrough = queryParams.get("payment_through");
  const ref = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (cardPurchased) {
      setTogglSidebar(true);
    }
  }, [userDetails, cardPurchased]);

  useEffect(() => {
    if (showT) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showT]);

  useEffect(() => {
    const getCard = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-user-vvc`,
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data.data);
        console.log(dec);
        // dec?.data?.pop()

        if (dec?.data?.length === 1) {
          setCurrent(0);
        }
        setCards(dec?.data ?? []);
        if (dec?.data.length) {
          setCardPurchased(true);
        } else {
          setCardPurchased(false);
        }
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        setCardPurchased(false);
        console.log(dec);
      }

      setLoading(false);
    };

    getCard();
  }, [userDetails, reRender]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const getTransactions = async () => {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-card-transcations`,
            {
              data: encryptData({
                cardId: cards[current].card_id,
                account_id: userDetails._id,
                search: searchQuery.trim(),
              }),
            },
            { headers: authHeader },
          );
          const dec = decryptData(res.data.data);
          setTransactions(dec.data);
        } catch (error) {
          const dec = decryptData(error?.response?.data?.data);
          console.log(dec);
        }
      };
      if (cards[current]) getTransactions();
    }, 400);

    return () => clearTimeout(timer);
  }, [current, cards, userDetails, reRender, searchQuery]);

  return (
    <div style={{ minHeight: "100vh" }} className={styles.container}>
      <div className={styles.top}>
        <h4
          style={{
            display:
              width < 1000 &&
              (addFundsMobile || ctcMobile || ctwMobile) &&
              "none",
          }}
        >
          {t("My Mastercard")}
        </h4>
        {width > 1000 && <TopRight />}
      </div>

      {status ? (
        status === "success" && paymentThrough !== "paypal" ? (
          <Success
            page=""
            linkText=""
            link="/my-mastercard"
            message="Your transaction has been completed successfully.You may now close this window or continue."
          />
        ) : status === "failed" ? (
          <Error linkText="" link="/my-mastercard" />
        ) : (
          <Success
            page=""
            linkText=""
            link="/my-mastercard"
            type="pending"
            message="Your transaction is currently being processed. Please try refreshing the page in a moment. If the status remains pending for an extended period, please contact support for assistance."
          />
        )
      ) : null}

      <>
        {!loading ? (
          <>
            {cardPurchased ? (
              <>
                <CardPurchased
                  currentCardDetails={currentCardDetails}
                  setCurrentCardDetails={setCurrentCardDetails}
                  setLoading={setLoading}
                  current={current}
                  setCurrent={setCurrent}
                  cards={cards}
                  setCardPurchased={setCardPurchased}
                  transactions={transactions}
                />
                {((!addFundsMobile && !ctcMobile && !ctwMobile) ||
                  width > 1000) && (
                  <TransactionsTable
                    ref={ref}
                    cardNo={currentCardDetails?.card_number}
                    transactions={transactions}
                    isLoading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                )}
              </>
            ) : (
              <OnBoarding
                alreadyHaveCard={cards.length !== 0}
                setReRender={setReRender}
                setCardPurchased={setCardPurchased}
              />
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <InstaPayLoader />{" "}
          </div>
        )}
      </>
    </div>
  );
};

export default MyMasterCard;
