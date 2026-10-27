import styles from "./styles/PaySocial.module.css";
import { socialPayConfig } from "./requiredFields";
import ChannelCard from "./Channel";
import ComingSoonCard from "./ComingSoonCard";
import pinIcon from "./files/pinIcon.svg";
import heroImage from "./files/hero-bg.png";
import HiIcons from "./files/Hi.Icon.png";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { useQuery } from "@tanstack/react-query";
import InstaPayLoader from "../Loader";
import TopRight from "../topRight";
import useWindowWidth from "../../utils/useWindowWidth";

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PayViaSocial = () => {
  const { header, themes, activeChannels, comingSoonChannels } = socialPayConfig;
  const width = useWindowWidth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails } = useContext(UserContext);
  const [isPinAdded, setIsPinAdded] = useState(false);
  const can = usePermission();
  const isEdit = can("settings.social-accounts.update");

  const { data, isLoading } = useQuery({
    queryKey: ["channelstatus"],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/instagram/channel-status`,
      }),
  });

  useEffect(() => {
    if (userDetails?.pin_status) {
      setIsPinAdded(true);
    }
  }, [userDetails]);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Pay via Social")}</h1>
          <p>{t("Send money through Instagram, WhatsApp or Telegram")}</p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <section className={styles.hero} style={{ "--hero-bg": `url("${heroImage}")` }}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            {t("Just say")}{" "}
            <span className={styles.hiBubble}>
              <img src={HiIcons} alt="" />
            </span>
            {t("to pay")}.
          </h2>
          <p className={styles.heroDesc}>
            {t(
              "Message the InstaPay bot on Instagram, WhatsApp, or Telegram - and your full wallet is right there in the conversation. No new app. No extra login.",
            )}
          </p>
        </div>
      </section>

      <div className={styles.pinBanner}>
        <div className={styles.pinLeft}>
          <div className={styles.pinIconBox}>
            <img src={pinIcon} alt="" className={styles.pinIcon} />
          </div>
          <div>
            <h4 className={styles.pinTitle}>
              {t(!isPinAdded ? "Set Your Security PIN" : "Update Your Pin")}
            </h4>
            <p className={styles.pinSub}>{isPinAdded && t("Need to change your PIN?")}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(!isPinAdded ? "/create-pin" : "/update-pin")}
          type="button"
          disabled={!isEdit}
          className={styles.pinBtn}
        >
          {t(!isPinAdded ? "Set your PIN" : "Update your PIN")}
        </button>
      </div>

      {isLoading ? (
        <div className="mx-auto w-50">
          <InstaPayLoader />
        </div>
      ) : (
        <section
          className={styles.activeGrid}
          style={{
            opacity: !isPinAdded ? "0.5" : "1",
            pointerEvents: !isPinAdded ? "none" : "auto",
          }}
        >
          {activeChannels.map((item) => {
            const channel = data?.channels?.[item.id];
            return (
              <ChannelCard
                isPinAdded={isPinAdded}
                key={item.id}
                item={{ ...item, ...channel }}
                themes={themes}
              />
            );
          })}
        </section>
      )}
      <h3 className={styles.sectionHeading}>{t("Coming Soon")}</h3>
      <section className={styles.comingSoonGrid}>
        {comingSoonChannels.map((item) => (
          <ComingSoonCard key={item.id} item={item} themes={themes} />
        ))}
      </section>
    </div>
  );
};

export default PayViaSocial;
