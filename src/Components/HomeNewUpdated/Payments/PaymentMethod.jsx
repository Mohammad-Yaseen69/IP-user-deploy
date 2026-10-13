import React, { useContext, useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { payoutChannelData } from "../../PaymentsNewer/PayoutChannel";
import iw from "../../../assets/images/logo/logo_white.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import CitiesData from "../../CitiesDropDown/CitiesData.json";
import { currencies } from "../../PaymentsNewer/InternationalFlow/StepOne";

const payoutChannels = [
  ...payoutChannelData,
  {
    name: "InstaPay Wallet",
    id: 7,
    icon: iw,
    value: "wallet",
  },
];

const PaymentMethod = ({ setPaymentMethod, item, setStep }) => {
  const { t } = useTranslation();
  const { authHeader, userDetails, userWallets } = useContext(UserContext);
  const [minimumAmount, setminimumAmount] = useState("");

  const channels = payoutChannels?.filter((i) => {
    return item?.account_type?.some((j) => {
      return j.toLowerCase() === i.value.toLowerCase();
    });
  });

  const getCurrency = async (channelId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_IP_DEV_API}/api/thunes/get-payer-details?payerId=${item?.mobile_wallet?.[0]?.money_provider}`,
      {
        headers: authHeader,
      },
    );
    const dec = await decryptData(res.data.data);

    return dec?.data?.destination_currency;
  };

  const localCurrency = () => {
    const cont = CitiesData.find(
      (item) =>
        item.iso3?.toUpperCase() ===
        userDetails?.country_iso_code?.toUpperCase(),
    );
    return cont.currency;
  };
  const getWallet = () => {
    const wallet = userWallets?.find(
      (item) => item?.currency?.code === localCurrency(),
    );
    if (wallet?.currency?.code) {
      return {
        ...currencies.find(
          (item) => item.currency_code === wallet?.currency?.code,
        ),
        ...wallet,
      };
    }
    return currencies[0];
  };

  const getConversionRate = async (channel) => {
    const destinationCurrency = await getCurrency();
    try {
      const url = `${import.meta.env.VITE_IP_DEV_API}/api/thunes/get-markup-conversion-rates?from=${getWallet()?.currency?.code}&to=${destinationCurrency}&amount=${"1.00"}&fromOrTo=${"from"}&service_name=${"international_mobile_wallet"}&account_id=${userDetails?._id}&payer_id=${item?.mobile_wallet?.[0]?.money_provider}&service_id=${channel?.id}`;
      const res = await axios.get(url, {
        headers: authHeader,
      });
      const dec = await decryptData(res.data.data);
      console.log(dec);
    } catch (err) {
      const dec = decryptData(err.response.data.data);
      console.log(dec);
      if (dec.message.toLowerCase().includes("minimum")) {
        console.log("adf");
        setminimumAmount(dec.value);
      }
    }
  };

  useEffect(() => {
    getConversionRate();
  }, [item, userDetails]);
  const generateLink = (channel) => {
    if (channel?.value == "wallet") {
      return `/payments?payment_action=send_money&send_type=wallet&wallet_id=${item?.wallet?.[0]?.wallet_id ?? ""}`;
    } else {
      return `/payments?payment_action=send_money&send_type=international&service_id=${channel?.id}&recipient=${item?._id}&country=${item?.country_iso_code}&payer_id=${item?.mobile_wallet?.[0]?.money_provider}&amount=${Number(minimumAmount).toFixed(2) || "1.00"}`;
    }
  };
  console.log(item);
  return (
    <>
      {channels.map((channel) => (
        <Link
          className="card"
          to={generateLink(channel)}
          key={channel?.name}
          style={{ marginBottom: 0, borderRadius: "12px", cursor: "pointer" }}
          onClick={() => {
            setPaymentMethod(channel);
            setStep(2);
          }}
        >
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              padding: "15px",
              justifyContent: "space-between",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  height: "35px",
                  width: "35px",
                  background:
                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                }}
              >
                <img
                  src={channel?.icon}
                  draggable="false"
                  alt={channel?.name[0]}
                  style={{
                    width: channel.name === "InstaPay Wallet" ? "15px" : "19px",
                    objectFit: "contain",
                    aspectRatio: 1,
                  }}
                />
              </div>
              <h5
                style={{ marginBottom: 0, fontSize: "1.2rem", color: "black" }}
              >
                {t(channel?.name)}
              </h5>
            </div>
          </CardBody>
        </Link>
      ))}
    </>
  );
};

export default PaymentMethod;
