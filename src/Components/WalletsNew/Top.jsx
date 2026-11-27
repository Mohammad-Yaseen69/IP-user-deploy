import "swiper/css";
import "swiper/css/effect-cards";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Power,
  ScrollText,
  Snowflake,
} from "lucide-react";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import DefaultWalletModal from "./DefaultWalletModal";
import AddCurrencyModal from "./AddCurrencyModal";
import { useLocation, useNavigate } from "react-router";
import Withdraw from "./Withdraw";
import DownloadStatement from "./DownloadStatement";
import axios from "axios";
import { toast } from "react-toastify";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import CurConversion from "../HomeNewUpdated/CurConversion";
import AddWithdrawalsModal from "../AddWithdrawa;sModal";
import QrGenerate from "../Settings/QrGenerate";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import useEffectivePermission, { PERMISSIONS } from "../../hooks/GeneralUse/useEffectivePermission";
import { Tooltip } from "@mui/material";
import SendCryptoModal from "./SendCryptoModal";
import WalletCard from "../../Common/WalletUI/WalletCard";
import { currencySymbol } from "../../Common/WalletUI/utils";
import u from "../../Common/WalletUI/ui.module.scss";
import r from "./styles/redesign.module.scss";

// One action tile of the wallet hero. The wrapper span lets the tooltip show on a disabled button.
const Tile = ({
  Icon,
  title,
  sub,
  tooltip = "",
  showTooltip = false,
  danger,
  children,
  ...rest
}) => (
  <Tooltip title={tooltip} arrow disableHoverListener={!showTooltip}>
    <span className={r.tileWrap}>
      <button type="button" className={r.tile} {...rest}>
        <span className={`${r.tileIcon} ${danger ? r.tileIconDanger : ""}`}>
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <span className={r.tileText}>
          <strong>{title}</strong>
          <small>{sub}</small>
        </span>
        {children}
      </button>
    </span>
  </Tooltip>
);

const Switch = ({ on }) => (
  <span className={`${r.switch} ${on ? r.switchOn : ""}`} aria-hidden>
    <i />
  </span>
);

const Top = ({ currentWallet, setCurrentWallet, data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const swiperRef = useRef(null);
  const {
    userWallets: allWallets,
    authHeader,
    getUserWallets,
    userDetails,
    getWithdrawals,
    userWithdrawals,
  } = useContext(UserContext);
  const can = usePermission();
  const hasPermission = useEffectivePermission();
  const canSendCrypto = hasPermission(PERMISSIONS.CRYPTO_PAYOUT);
  // Crypto wallets live on the Crypto & Stablecoins page, not here.
  const userWallets = useMemo(
    () => (allWallets || []).filter((w) => w?.provider !== "bvnk" && w?.wallet_type !== "crypto"),
    [allWallets],
  );
  const [activeDot, setActiveDot] = useState(0);
  const [currentDefault, setCurrentDefault] = useState(false);
  const [currentActive, setCurrentActive] = useState(false);
  const [adminBlocked, setAdminBlocked] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");
  const wallet_address = queryParams.get("wallet_address");

  useEffect(() => {
    if (userDetails) {
      getWithdrawals();
    }
  }, [userDetails]);

  // A link is applied once: later wallet refreshes must not drag the carousel back to the linked wallet.
  const appliedLinkRef = useRef(null);
  useEffect(() => {
    const link = `${action}|${wallet_address}`;
    if (!wallet_address) {
      appliedLinkRef.current = null;
    } else if (userWallets?.length > 0 && appliedLinkRef.current !== link) {
      const wallet = userWallets?.find((item) => item?.wallet_id === wallet_address);
      const index = userWallets?.findIndex((item) => item?.wallet_id === wallet_address);
      if (wallet?.wallet_id && index !== -1) {
        appliedLinkRef.current = link;
        setActiveDot(index);
        setCurrentWallet(wallet);
        if (swiperRef?.current?.swiper) {
          swiperRef.current.swiper.slideTo(index);
        } else {
          setTimeout(() => {
            swiperRef?.current?.swiper?.slideTo(index);
          }, 100);
        }
        if (action === "withdraw") {
          if (wallet?.wallet_type === "crypto") openSendCryptoModal(wallet);
          else setShowWithdrawalModal(true);
        } else if (action === "download") {
          setShowDownloadStatementModal(true);
        }
      }
    }
  }, [action, wallet_address, userWallets]);

  useEffect(() => {
    if (userWallets?.length > 0) {
      setCurrentWallet(userWallets?.[activeDot]);
    }
  }, [userWallets, activeDot]);

  useEffect(() => {
    setCurrentDefault(currentWallet?.default);
    setCurrentActive(currentWallet?.status === "active");
    setAdminBlocked(currentWallet?.admin_blocked);
    setBlocked(currentWallet?.blocked);
  }, [currentWallet]);
  // modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showDownloadStatementModal, setShowDownloadStatementModal] = useState(false);
  const [showSendCryptoModal, setShowSendCryptoModal] = useState(false);
  const [sendCryptoWallet, setSendCryptoWallet] = useState(null);

  const openSendCryptoModal = (wallet) => {
    if (!canSendCrypto) return;
    setSendCryptoWallet(wallet);
    setShowSendCryptoModal(true);
  };

  useEffect(() => {
    if (action === "convert") setShowConversionModal(true);
    else if (action === "withdraw") {
      if (currentWallet?.wallet_type === "crypto") openSendCryptoModal(currentWallet);
      else setShowWithdrawalModal(true);
    } else if (action === "add-currency") setShowAddCurrencyModal(true);
    else if (action === "statement") setShowDownloadStatementModal(true);
  }, [action]);

  useEffect(() => {
    getUserWallets();
  }, []);

  const handleChangeStatus = () => {
    if (currentActive) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/deactivate-wallet/${currentWallet?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          getUserWallets(true);
          setCurrentActive(false);
        })
        .catch((err) => {
          toast.error("We cannot process your request at the moment, please try again later.");
        });
    } else {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/activate-wallet/${currentWallet?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          setCurrentActive(true);
        })
        .catch((err) => {
          toast.error("We cannot process your request at the moment, please try again later.");
        });
    }
  };

  const handleBlockWallet = () => {
    setBlocking(true);
    if (blocked) {
      axios
        .post(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/unblock-wallet-user/${currentWallet?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          setBlocked(false);
          getUserWallets(true);
        })
        .catch((err) => {
          toast.error("We cannot process your request at the moment, please try again later.");
        })
        .finally(() => {
          setBlocking(false);
        });
    } else {
      axios
        .post(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/block-wallet-user/${currentWallet?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          setBlocked(true);
          getUserWallets(true);
        })
        .catch((err) => {
          toast.error("We cannot process your request at the moment, please try again later.");
        })
        .finally(() => {
          setBlocking(false);
        });
    }
  };
  const [savedWallet, setSavedWalelt] = useState({});

  const isCryptoWallet = useMemo(() => currentWallet?.wallet_type === "crypto", [currentWallet]);

  const blockedWallet = useMemo(() => {
    return (
      currentWallet?.blocked ||
      currentWallet?.admin_blocked ||
      currentWallet?.blocked ||
      currentWallet?.admin_blocked ||
      currentWallet?.status !== "active"
    );
  }, [currentWallet]);

  const [tooltips, setTooltips] = useState({
    add: false,
    convert: false,
    withdraw: false,
    downlaod: false,
    block: false,
    status: false,
  });

  const updateTooltip = (type) => {
    setTooltips((prev) => ({
      ...prev,
      [type]: !tooltips[type],
    }));
  };

  // Drops ?action / ?wallet_address so a modal opened from a link does not reopen itself.
  const clearLinkParams = () => {
    queryParams.delete("action");
    queryParams.delete("wallet_address");
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString() ? `?${queryParams.toString()}` : "",
      },
      { replace: true },
    );
  };

  const handleClose = () => {
    setShowWithdrawalModal(false);
    clearLinkParams();
  };

  const setStatementModal = (open) => {
    setShowDownloadStatementModal(open);
    if (!open && (action || wallet_address)) clearLinkParams();
  };

  const canSetDefault =
    can("wallet.status.update") && currentWallet?.wallet_type !== "crypto" && !blockedWallet;

  const statusLabel = adminBlocked
    ? t("Blocked By Admin")
    : blocked
      ? t("Blocked")
      : currentActive
        ? t("Active")
        : t("Disabled");

  return (
    <div className={r.hero}>
      {savedWallet?._id && userDetails?.username ? (
        <QrGenerate wallets={[savedWallet]} key={"LOLO"} />
      ) : (
        ""
      )}
      <div className={r.heroHead}>
        <div className={r.heroTitle}>
          <span className={r.currencyTile}>{currencySymbol(currentWallet?.currency?.code)}</span>
          <div>
            <h2 className={u.title}>
              {currentWallet?.currency?.code} {t("Wallet")}
            </h2>
            <p className={u.sub}>{statusLabel}</p>
          </div>
        </div>
        {can("wallet.currencies.add") && (
          <button
            type="button"
            className={r.addCurrency}
            onClick={() => setShowAddCurrencyModal(!showAddCurrencyModal)}
          >
            <Plus size={18} />
            {t("Add new currency")}
          </button>
        )}
      </div>

      <div className={r.heroBody}>
        <div className={r.cards}>
          {can("wallet.list.view") && (
            <Swiper
              effect={"cards"}
              grabCursor={true}
              modules={[EffectCards]}
              // Keep Swiper's default perSlideOffset: at 0 it writes an invalid `--0.75%` offset for the
              // previous card, which then stays frozen where the drag left it. The stack is clipped in CSS.
              cardsEffect={{
                rotate: false,
                slideShadows: false,
              }}
              className={`mySwiper ${r.swiper}`}
              onSwiper={(swiper) => {
                if (activeDot > 0) {
                  swiper.slideTo(activeDot);
                }
              }}
              onSlideChange={(e) => {
                setActiveDot(e.activeIndex);
              }}
              ref={swiperRef}
            >
              {userWallets?.length > 0
                ? userWallets.map((item, index) => (
                    <SwiperSlide key={index} style={{ borderRadius: "14px" }}>
                      <WalletCard
                        wallet={item}
                        limits={data}
                        onSetDefault={
                          canSetDefault && index === activeDot
                            ? () => setShowConfirmationModal(true)
                            : undefined
                        }
                      />
                    </SwiperSlide>
                  ))
                : ""}
            </Swiper>
          )}
          <div className={r.switcher}>
            <button
              type="button"
              aria-label={t("Previous wallet")}
              onClick={() => swiperRef?.current?.swiper?.slidePrev()}
            >
              <ChevronLeft size={18} />
            </button>
            <div className={r.dots}>
              {userWallets.map((item, index) => (
                <button
                  key={item?._id ?? index}
                  type="button"
                  aria-label={`${item?.currency?.code} ${t("Wallet")}`}
                  className={activeDot === index ? r.dotActive : ""}
                  onClick={() => {
                    setActiveDot(index);
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
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className={r.tiles}>
          <Tile
            Icon={Plus}
            title={t("Add funds")}
            sub={t("Deposit to wallet")}
            tooltip={t(
              "This currency wallet is currently blocked/disabled and funds cannot be added.",
            )}
            showTooltip={blockedWallet}
            disabled={blockedWallet || !can("wallet.payment.topup")}
            onClick={() => {
              navigate(
                `/add-funds?type=${currentWallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${currentWallet?.wallet_id}`,
              );
            }}
          />

          <Tile
            Icon={ArrowLeftRight}
            title={service_name_formatter(t("convert funds "))}
            sub={t("Multi-currency")}
            tooltip={t(
              "This currency wallet is currently blocked/disabled and funds cannot be converted.",
            )}
            showTooltip={blockedWallet}
            disabled={blockedWallet || !can("wallet.payment.conversion")}
            onClick={() => setShowConversionModal(!showConversionModal)}
            id="convert_funds"
          />

          {isCryptoWallet ? (
            can("wallet.payment.withdraw") &&
            canSendCrypto && (
              <Tile
                Icon={ArrowRight}
                title={t("Send Crypto")}
                sub={t("To an external address")}
                tooltip={t(
                  "This currency wallet is currently blocked/disabled and you cannot send crypto.",
                )}
                showTooltip={blockedWallet}
                disabled={blockedWallet}
                onClick={() => openSendCryptoModal(currentWallet)}
                id="send_crypto"
              />
            )
          ) : (
            <Tile
              Icon={ArrowRight}
              title={service_name_formatter(t("withdraw balance"))}
              sub={t("To the specified account")}
              tooltip={t(
                "This currency wallet is currently blocked/disabled and you cannot withdraw balance.",
              )}
              showTooltip={blockedWallet}
              disabled={blockedWallet || !can("wallet.payment.withdraw")}
              onClick={() => setShowWithdrawalModal(!showWithdrawalModal)}
              id="withdraw_balance"
            />
          )}

          <Tile
            Icon={ScrollText}
            title={t("Statement")}
            sub={t("Download PDF")}
            tooltip={t(
              "This currency wallet is currently blocked/disabled and you cannot download the statement.",
            )}
            showTooltip={blockedWallet}
            disabled={blockedWallet || !can("transactions.wallet.export")}
            onClick={() => setShowDownloadStatementModal(!showDownloadStatementModal)}
            id={"download_statement"}
          />

          {can("wallet.status.update") && (
            <Tile
              Icon={Power}
              title={t("Wallet Status")}
              sub={currentActive ? t("Active") : t("Disabled")}
              tooltip={t(
                "This currency wallet is currently set as your default and cannot be disabled. To proceed, please set a different currency wallet as your default first.",
              )}
              showTooltip={currentDefault}
              disabled={currentDefault}
              onClick={handleChangeStatus}
              id={"status_of_wallet"}
              role="switch"
              aria-checked={currentActive}
            >
              <Switch on={currentActive} />
            </Tile>
          )}

          {can("wallet.status.update") && (
            <Tile
              Icon={Snowflake}
              danger
              title={adminBlocked ? t("Blocked By Admin") : t("Freeze wallet")}
              sub={blocked ? t("Unblock The Wallet") : t("Freeze activity")}
              tooltip={t(
                "This currency wallet is currently set as your default and cannot be blocked. To proceed, please set a different currency wallet as your default first.",
              )}
              showTooltip={currentDefault}
              disabled={currentDefault || blocking}
              onClick={handleBlockWallet}
              id={"block_the_wallet"}
              role="switch"
              aria-checked={!!blocked}
            >
              <Switch on={blocked} />
            </Tile>
          )}
        </div>
      </div>

      <DefaultWalletModal
        setShowConfirmationModal={setShowConfirmationModal}
        showConfirmationModal={showConfirmationModal}
        wallet={currentWallet}
        setActiveDot={setActiveDot}
      />
      <AddCurrencyModal
        isOpen={showAddCurrencyModal}
        toggle={() => setShowAddCurrencyModal(!showAddCurrencyModal)}
        setSavedWalelt={setSavedWalelt}
      />
      {userWithdrawals?.length > 0 ? (
        <Withdraw wallet={currentWallet} isOpen={showWithdrawalModal} toggle={handleClose} />
      ) : (
        <>
          {showWithdrawalModal && (
            <AddWithdrawalsModal
              isOpen={showWithdrawalModal}
              toggle={() => {
                setShowWithdrawalModal(!showWithdrawalModal);
              }}
            />
          )}
        </>
      )}
      {showSendCryptoModal && sendCryptoWallet && (
        <SendCryptoModal
          isOpen={showSendCryptoModal}
          toggle={() => setShowSendCryptoModal(false)}
          wallet={sendCryptoWallet}
        />
      )}
      <DownloadStatement
        showModal={showDownloadStatementModal}
        setShowModal={setStatementModal}
        wallet={currentWallet}
      />
      <Modal isOpen={showConversionModal}>
        <ModalHeader toggle={() => setShowConversionModal(!showConversionModal)}>
          {t("convert funds ")}
        </ModalHeader>
        <ModalBody>
          <CurConversion extCurrency={currentWallet?.currency?.code} extWallet={currentWallet} />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Top;
