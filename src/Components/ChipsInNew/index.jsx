import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Info } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardBody, CardText } from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import QrGenerate from "../Settings/QrGenerate";
import TopRight from "../topRight";
import LeftContainer from "./LeftContainer";
import MobileComponent from "./MobileComponent";
import SpecificQrs from "./SpecificQrs";
import styles from "./styles/index.module.scss";
import vt from "./view_trans.png";

const ChipsInNew = () => {
  const { userWallets, authHeader, userDetails, setWalletRefresh, getUserWallets } =
    useContext(UserContext);
  const [currentWallet, setCurrentWallet] = useState({});
  const [currency, setCurrency] = useState("");
  const [defaultWal, setDefaultWal] = useState(null);

  useEffect(() => {
    if (userDetails) {
      getUserWallets();
    }
  }, [userDetails]);

  useEffect(() => {
    if (userWallets.length > 0) {
      const filtered = userWallets?.[0];
      setCurrentWallet(filtered);
      setCurrency(filtered?.currency?.code);

      const filterDefault = userWallets.filter((wal) => wal?.default)[0];
      setDefaultWal(filterDefault);
    }
  }, [userWallets]);

  useEffect(() => {
    if (userWallets.length > 0) {
      userWallets.map((wal) => {
        if (wal?.wallet_id && !wal?.qrCode?.url && wal.wallet_type.toLowerCase() === "insta") {
          // console.log(wal)
          const data = {
            title: `${userDetails?.user?.first_name ?? userDetails?.company_name} ${userDetails?.user?.last_name ?? ""}`,
            description: wal?.currency?.code,
            status: "true",
          };
          // console.log(data)
          const encrypted = encryptData(data);
          axios
            .post(
              `${import.meta.env.VITE_IP_DEV_API}/api/wallet/wallet-qrcode/${wal?.wallet_id}`,
              {
                data: encrypted,
              },
              {
                headers: authHeader,
              },
            )
            .then((res) => {
              setWalletRefresh((prev) => prev + 1);
            });
        }
      });
    }
  }, []);

  const [showTooltip, setShowTooltip] = useState(!sessionStorage.getItem("show_qr_modal"));

  useEffect(() => {
    sessionStorage.setItem("show_qr_modal", true);
  }, []);

  const { t } = useTranslation();

  const [current, setCurrent] = useState(0);
  return (
    <>
      {userDetails?.level?.qr_pay?.receive ? (
        <>
          <div className={styles.container}>
            <div className={styles.top}>
              <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {t("My QR Code Sticker")}{" "}
                <Info
                  color="#5926f0"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTooltip(!showTooltip)}
                  size={16}
                />
              </h4>
              <TopRight />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {/* <GeneralContainer currency={currency} setCurrency={setCurrency} currentWallet={currentWallet} setWalletRefresh={setWalletRefresh} authHeader={authHeader} defaultWal={defaultWal} showTooltip={showTooltip} setShowTooltip={setShowTooltip} /> */}
              <LeftContainer
                currency={currency}
                setCurrency={setCurrency}
                currentWallet={currentWallet}
                setWalletRefresh={setWalletRefresh}
                authHeader={authHeader}
                defaultWal={defaultWal}
                showTooltip={showTooltip}
                setShowTooltip={setShowTooltip}
                setCurrentWallet={setCurrentWallet}
              />
              <SpecificQrs />
            </div>
          </div>
          <div className={styles.mobile}>
            <div className={styles.top}>
              <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {t("My QR Code Sticker")}{" "}
                <Info
                  color="#5926f0"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTooltip(!showTooltip)}
                  size={16}
                />
              </h4>
            </div>
            <div className={styles.bottom}>
              <Swiper
                className="mySwiper"
                onSlideChange={(e) => setCurrent(e.activeIndex)}
                spaceBetween={15}
                style={{ padding: "1rem" }}
                loop={true}
              >
                {userWallets
                  ?.filter(
                    (item) =>
                      item?.wallet_type === "insta" &&
                      item?.status &&
                      !item?.blocked &&
                      !item?.admin_blocked &&
                      !item?.blocker,
                  )
                  ?.map((item) => (
                    <SwiperSlide
                      style={{
                        boxShadow: "0 7px 10px 0px rgba(0, 0, 0, .08)",
                        borderRadius: "40px",
                      }}
                    >
                      <MobileComponent wallet={item} current={current} />
                    </SwiperSlide>
                  ))}
              </Swiper>
              <div className={styles.dots}>
                {userWallets
                  ?.filter(
                    (item) =>
                      item?.wallet_type === "insta" &&
                      item?.status &&
                      !item?.blocked &&
                      !item?.admin_blocked &&
                      !item?.blocker,
                  )
                  ?.map((item, i) => (
                    <div
                      className={styles.dot}
                      style={{
                        background: current === i ? "#5926f0" : "#b3b3b3",
                      }}
                    ></div>
                  ))}
              </div>
              <Link to={"/wallets"}>
                <img src={vt} alt="icon" loading="lazy" />
                <span>{t("View Transactions")}</span>
              </Link>
            </div>
          </div>
          <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
        </>
      ) : (
        <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
          <CardBody>
            <CardText>
              {t("Not supported on this level.")}
              <Link to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>
                {t("Go back to Home.")}
              </Link>
            </CardText>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default ChipsInNew;
