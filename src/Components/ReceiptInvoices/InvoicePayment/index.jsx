import { useEffect, useReducer } from "react";
import styles from "./styles/index.module.scss";
import background from "./files/bg.jpg";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceUsingId } from "../queries";
import InstaPayLoader from "../../Loader";
import PaymentUI from "./PaymentUI";
import DirectCardInvoicePayment from "./DirectCardInvoicePayment";
import { Card } from "reactstrap";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../Helper/AmountFormat";

const initialState = {
  showAboutModal: false,
  showCreditModal: false,
  guestPayError: "",
  amount: "",
  currentWallet: {},
  cryptoDetails: {
    name: "",
    phone: "",
    reason: "",
    email: "",
    dob: "",
  },
  shippingDetails: {
    houseNo: "",
    street: "",
    city: "",
    state: "",
    country: null,
    zipCode: "",
  },
};

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

const Wrapper = ({ children, directCard = false }) => (
  <div
    style={{
      background: directCard ? "#f5f6f8" : `url(${background})`,
      borderRadius: "none",
      minHeight: "100vh",
    }}
    className={`${styles.container} ${directCard ? styles.directCardPage : ""}`}
  >
    {!directCard && <div className={styles.overlay} />}
    {directCard && <div className={styles.directCardWatermark}>{t("InstaPay")}</div>}
    <Card
      style={{ marginBottom: "0px" }}
      className={`${styles.sub_container} ${directCard ? styles.directCardShell : ""}`}
    >
      {children}
    </Card>
  </div>
);

const InvoicePayment = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const { username: user_name, invoiceId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["GetInvoicePerId", invoiceId],
    queryFn: () => getInvoiceUsingId(invoiceId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const getLimits = async () => {
      try {
        const walletId = data?.receivingWallet?.wallet_id;
        if (!walletId) return;
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-address-limits/${user_name}/${walletId}`,
        );
        const dec = decryptData(res.data.data);
        dataHandler("limits", dec?.limits);
      } catch (err) {
        // fail silently — limits are optional
        console.error("Failed to load limits:", err);
      }
    };

    if (user_name && data?.receivingWallet?.wallet_id) {
      getLimits();
    }
  }, [user_name, data]);

  const toggleCreditModal = () => {
    if (data.amount < state.limits?.topup_min_amount) {
      toast.error(
        t("Minimum amount for guest pay is") +
          " " +
          formatCurrency(state.limits?.topup_min_amount, true) +
          " " +
          data?.currency,
      );
    } else if (data.amount > state.limits?.topup_max_amount) {
      toast.error(
        "The recipient has reached their incoming/balance limit and cannot receive this amount at the moment.",
      );
    } else {
      dataHandler("showCreditModal", !state.showCreditModal);
    }
  };

  if (isLoading) {
    return (
      <div style={{ position: "relative", width: "100%", zIndex: 100 }}>
        <InstaPayLoader transparent={true} />
      </div>
    );
  }

  if (!data) {
    return (
      <Wrapper>
        <h3
          style={{
            textAlign: "center",
            margin: "auto",
            zIndex: 100,
            padding: "24px",
          }}
        >
          {"This Invoice Does not exist"}
        </h3>
      </Wrapper>
    );
  }

  if (!data.active) {
    return (
      <Wrapper>
        <h3
          style={{
            textAlign: "center",
            margin: "auto",
            zIndex: 100,
            padding: "24px",
          }}
        >
          {"This Invoice is inactive!"}
        </h3>
      </Wrapper>
    );
  }

  const url = data
    ? `/payments?payment_action=send_money&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.currency}&amount=${data.amount}&invoiceId=${invoiceId}&isShipping=${data.shippingAddress}&payment_type=invoice`
    : "/";
  const invoiceType = data?.invoiceType?.toLowerCase();
  const guestPaymentMethod = data?.guestDetails?.paymentMethod?.toLowerCase();
  const isDirectCardInvoice = invoiceType === "direct-card" || invoiceType === "direct_card";

  return (
    <Wrapper directCard={isDirectCardInvoice}>
      {isDirectCardInvoice ? (
        <DirectCardInvoicePayment invoice={data} username={user_name} />
      ) : (
        <PaymentUI
          data={data}
          dataHandler={dataHandler}
          state={state}
          invoiceId={invoiceId}
          url={url}
          toggleCreditModal={toggleCreditModal}
          user_name={user_name}
        />
      )}
    </Wrapper>
  );
};

export default InvoicePayment;
