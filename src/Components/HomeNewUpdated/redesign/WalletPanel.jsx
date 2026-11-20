import "swiper/css";
import "swiper/css/effect-cards";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Gauge, Plus } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { isSafari } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { EffectCards, EffectFade } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Segmented } from "../../../Common/WalletUI/Primitives";
import u from "../../../Common/WalletUI/ui.module.scss";
import WalletCard from "../../../Common/WalletUI/WalletCard";
import { UserContext } from "../../../Context/UserContext";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import { getLimits } from "../../WalletsNew/getLimits";
import d from "./dashboard.module.scss";

// Each card loads its own monthly limit, as the old dashboard card did.
const LimitCard = ({ wallet, hidden }) => {
  const { authHeader } = useContext(UserContext);
  const [limits, setLimits] = useState({});

  useEffect(() => {
    if (wallet?._id) {
      getLimits(
        wallet,
        setLimits,
        authHeader,
        () => {},
        () => {},
      );
    }
  }, [wallet?._id]);

  return <WalletCard wallet={wallet} limits={limits} small hidden={hidden} />;
};

// Wallet carousel of the dashboard hero. Same wallet list, selection and shortcuts as the old RightContainer.
const WalletPanel = ({ setCurrentWallet, hidden }) => {
  const [activeDot, setActiveDot] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userWallets: allWallets, getUserWallets } = useContext(UserContext);
  const swiperRef = useRef(null);
  const can = usePermission();
  const userWallets = useMemo(
    () => (allWallets ?? []).filter((w) => w?.wallet_type !== "crypto"),
    [allWallets],
  );
  const wallet = userWallets?.[activeDot];

  useEffect(() => {
    getUserWallets();
  }, []);

  useEffect(() => {
    setCurrentWallet(userWallets?.[activeDot]);
  }, [userWallets, activeDot]);

  const options = [
    {
      name: "Top Up",
      Icon: Plus,
      link: `/add-funds?type=${wallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${wallet?.wallet_id}`,
      permission: "wallet.payment.topup",
    },
    {
      name: "Statement",
      Icon: FileText,
      link: `/wallets?action=download&wallet_address=${wallet?.wallet_id}`,
      permission: "transactions.wallet.export",
    },
    {
      name: "Withdraw",
      Icon: ArrowUpRight,
      link: `/wallets?action=withdraw&wallet_address=${wallet?.wallet_id}`,
      permission: "wallet.payment.withdraw",
    },
    {
      name: "Limits",
      Icon: Gauge,
      link: `/wallets?wallet_address=${wallet?.wallet_id}`,
      permission: "wallet.view",
    },
  ];

  return (
    <div className={d.side}>
      <div className={d.sideTop}>
        <Segmented
          label={t("Wallet or card")}
          options={[
            { value: "wallet", label: t("Wallet") },
            { value: "card", label: t("Card") },
          ]}
          value="wallet"
          onChange={(value) => value === "card" && navigate("/my-mastercard")}
        />
        {can("wallet.view") && (
          <Link to={`/wallets?wallet_address=${wallet?.wallet_id}`} className={u.link}>
            {t("Open wallet")}
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <Swiper
        effect={isSafari ? "fade" : "cards"}
        grabCursor={true}
        speed={isSafari && 1000}
        modules={[isSafari ? EffectFade : EffectCards]}
        cardsEffect={{
          rotate: false,
          slideShadows: false,
        }}
        className={`mySwiper ${d.carousel}`}
        onSlideChange={(e) => {
          setActiveDot(e.activeIndex);
          setCurrentWallet(userWallets?.[e.activeIndex]);
        }}
        ref={swiperRef}
      >
        {userWallets.map((item, index) => (
          <SwiperSlide key={item?._id ?? index} style={{ borderRadius: "10px" }}>
            <LimitCard wallet={item} hidden={hidden} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={d.pager}>
        <button
          type="button"
          aria-label={t("Previous wallet")}
          onClick={() => swiperRef?.current?.swiper?.slidePrev()}
        >
          <ChevronLeft size={16} />
        </button>
        <div className={d.pagerDots}>
          {userWallets.map((item, index) => (
            <button
              key={item?._id ?? index}
              type="button"
              aria-label={`${item?.currency?.code} ${t("Wallet")}`}
              className={activeDot === index ? d.pagerDotActive : ""}
              onClick={() => {
                setActiveDot(index);
                setCurrentWallet(userWallets?.[index]);
                swiperRef?.current?.swiper?.slideTo(index);
              }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={t("Next wallet")}
          onClick={() => swiperRef?.current?.swiper?.slideNext()}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={d.sideActions}>
        {options.map(
          ({ name, Icon, link, permission }) =>
            can(permission) && (
              <Link key={name} to={link} className={d.sideAction}>
                <i>
                  <Icon size={20} strokeWidth={1.75} />
                </i>
                {t(name)}
              </Link>
            ),
        )}
      </div>
    </div>
  );
};

export default WalletPanel;
