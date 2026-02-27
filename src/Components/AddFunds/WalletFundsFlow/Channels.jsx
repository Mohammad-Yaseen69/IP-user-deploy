import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import bd from "../../PaymentsNewer/files/bd.png";
import mw from "../../PaymentsNewer/files/mw.png";
import pc from "../../PaymentsNewer/files/pc.png";
import i from "../../PaymentsNewer/files/i.svg";
import { Badge, Card, CardBody } from "reactstrap";
import TypingSpan from "../../TypingSpan";
import { Check } from "react-feather";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";

const Channels = ({
  setChannel,
  channel,
  thunesServices,
  thunesProviders = [],
}) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  console.log("user detail(18)", userDetails);
  const { data: methods, isLoading } = useQuery({
    queryKey: ["AvailableMethods"],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/payment/get-available-methods/${userDetails?._id}/${userDetails?.country_iso_code}`,
      }).then((dec) => dec?.data),
    retry: 3,
  });
  const payoutChannelData = [
    userDetails?.level?.topup_channel?.card_payment
      ? {
          name: "Payment Card",
          id: 5,
          icon: pc,
          value: "card",
          coming_soon:
            userDetails?.level?.topup_channel?.card_payment === "coming_soon",
        }
      : {},
    userDetails?.level?.topup_channel?.paypal
      ? {
          name: "Paypal",
          id: 5,
          icon: pc,
          value: "paypal",
          coming_soon:
            userDetails?.level?.topup_channel?.paypal === "coming_soon",
        }
      : {},
    userDetails?.level?.topup_channel?.bank_deposit
      ? {
          name: "Bank Deposit",
          id: 2,
          icon: bd,
          value: "bank",
          coming_soon:
            userDetails?.level?.topup_channel?.bank_deposit === "coming_soon",
        }
      : {},
    userDetails?.level?.topup_channel?.card_payment
      ? {
          name: "EU Bank Tranfer",
          id: 6,
          icon: bd,
          value: "EU_bank_transfer",
          coming_soon: false,
        }
      : {},
    userDetails?.level?.topup_channel?.crypto
      ? {
          name: "Crypto Transfer",
          id: 2,
          icon: bd,
          value: "crypto",
          coming_soon:
            userDetails?.level?.topup_channel?.crypto === "coming_soon",
        }
      : {},
  ];

  const thunesAllowed = [
    userDetails?.level?.topup_channel?.mobile_money
      ? {
          name: "Mobile Wallet",
          id: 1,
          icon: mw,
          value: "mobile_wallet",
          // coming_soon: userDetails?.level?.topup_channel?.mobile_money === "coming_soon",
          sub_name: "wallet",
        }
      : {},
  ];

  const filteredChannels = useMemo(() => {
    const allChannels = [...thunesAllowed, ...payoutChannelData].filter(
      (item) => item?.name,
    );

    if (!methods || isLoading) return allChannels;

    return allChannels.filter(
      (item) => methods?.includes(item.value) || item.value === "EU_bank_transfer",
    );
  }, [payoutChannelData, thunesAllowed, methods, isLoading]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxHeight: "550px",
        overflowY: "auto",
      }}
    >
      {filteredChannels.map((item) => (
        <Card
          key={item?.name}
          style={{ marginBottom: 0, borderRadius: "12px" }}
          onClick={() => {
            if (item?.coming_soon) return;
            setChannel(item);
          }}
        >
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              padding: "15px",
              justifyContent: "space-between",
              cursor: item?.coming_soon ? "not-allowed" : "pointer",
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
                  src={item?.icon}
                  draggable="false"
                  alt={item?.name?.[0]}
                  style={{
                    width: "19px",
                    objectFit: "contain",
                    aspectRatio: 1,
                  }}
                />
              </div>
              <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>
                {t(item?.name) + " "}
                {window.innerWidth < 1000 && <br />}
                {thunesProviders?.length > 0 && item?.sub_name === "wallet" ? (
                  <>
                    (
                    <TypingSpan
                      words={thunesProviders.map((item) => item?.name ?? "")}
                    />
                    )
                  </>
                ) : (
                  ""
                )}
              </h5>
            </div>
            {item?.coming_soon ? (
              <Badge color="primary">{t("Coming Soon")}</Badge>
            ) : channel?.name === item?.name ? (
              <Check
                color="green"
                size={24}
                style={{ position: "absolute", right: "20px" }}
              />
            ) : (
              <img
                src={i}
                alt="i"
                style={{
                  objectFit: "cover",
                  position: "absolute",
                  right: "14px",
                  top: "19px",
                }}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default Channels;
