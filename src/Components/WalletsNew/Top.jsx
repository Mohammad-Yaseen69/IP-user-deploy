import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./styles/Top.module.css";
import { EffectCards } from "swiper";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserContext } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import Card from "./Card";
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
import { Tooltip } from "@mui/material";
import SendCryptoModal from "./SendCryptoModal";
import { ICONS } from "./files/icons";

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
  // Crypto wallets live on the Crypto & Stablecoins page, not here.
  const userWallets = useMemo(
    () => (allWallets || []).filter((w) => w?.provider !== "bvnk"),
    [allWallets],
  ).filter((wallet) => wallet?.wallet_type !== "crypto");
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

  useEffect(() => {
    if (wallet_address && userWallets?.length > 0) {
      const wallet = userWallets?.find((item) => item?.wallet_id === wallet_address);
      const index = userWallets?.findIndex((item) => item?.wallet_id === wallet_address);
      if (wallet?.wallet_id && index !== -1) {
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
  const [savedWallet, setSavedWallet] = useState({});

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

  const handleClose = () => {
    setShowWithdrawalModal(false);
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
  return (
    <div className={styles.container}>
      {savedWallet?._id && userDetails?.username ? (
        <QrGenerate wallets={[savedWallet]} key={"LOLO"} />
      ) : (
        ""
      )}
      <div className={styles.left} style={{ alignItems: "flex-start" }}>
        <div className={styles.balanceHeader}>
          <span className={styles.balanceIcon}>
            {currentWallet?.currency?.symbol || currentWallet?.currency?.code}
          </span>
          <div className={styles.balanceText}>
            <h2>
              {currentWallet?.currency?.code} {t("Wallet")}
            </h2>
            <p>{t("Last 30 days")}</p>
          </div>
        </div>
        <div className={styles.cards}>
          {can("wallet.list.view") && (
            <div className={styles.swiper_wrap}>
              <Swiper
                effect={"cards"}
                grabCursor={true}
                modules={[EffectCards]}
                cardsEffect={{
                  rotate: false,
                  slideShadows: false,
                }}
                style={{
                  minWidth: userWallets?.length === 1 ? "22vw" : "250px",
                  width: userWallets?.length === 1 ? "100%" : "auto",
                  cursor: "none",
                }}
                className={`mySwiper ${styles.swiper}`}
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
                      <SwiperSlide
                        key={index}
                        style={{
                          cursor: "none",
                          borderRadius: "10px",
                        }}
                      >
                        <Card
                          data={data}
                          current={activeDot}
                          index={index}
                          key={index}
                          wallet={item}
                          canSetDefault={can("wallet.status.update")}
                          onSetDefault={() => setShowConfirmationModal(true)}
                        />
                      </SwiperSlide>
                    ))
                  : ""}
              </Swiper>
            </div>
          )}
          <div className={styles.carouselNav}>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="previous wallet"
              onClick={() => swiperRef?.current?.swiper?.slidePrev()}
            >
              <ChevronLeft size={18} />
            </button>
            <div className={styles.dots}>
              {userWallets.map((_, index) => (
                <span
                  key={index * Date.now()}
                  className={styles.dot}
                  style={{
                    width: activeDot === index ? "30px" : "7px",
                    background: activeDot === index ? "#5926f0" : "#666666",
                  }}
                  onClick={() => {
                    setActiveDot(index);
                    swiperRef?.current?.swiper?.slideTo(index);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.navBtn}
              aria-label="next wallet"
              onClick={() => swiperRef?.current?.swiper?.slideNext()}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.rightCol}>
        {can("wallet.currencies.add") && (
          <div className={styles.add_cur}>
            <div onClick={() => setShowAddCurrencyModal(!showAddCurrencyModal)}>
              <svg className={styles.plusIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>{t("Add new Currency")}</span>
            </div>
          </div>
        )}
        <div className={styles.right}>
          <div className={styles.actions}>
            {can("wallet.payment.topup") ? (
              <button
                type="button"
                disabled={blockedWallet}
                className={styles.action}
                onClick={() => {
                  navigate(
                    `/add-funds?type=${currentWallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${currentWallet?.wallet_id}`,
                  );
                }}
              >
                <span className={styles.actionIcon}>{ICONS.plus}</span>
                <span className={styles.actionText}>
                  <strong>{t("Add Funds")}</strong>
                  <small>{t("Deposit to wallet")}</small>
                </span>
              </button>
            ) : (
              <Tooltip
                title={t(
                  "This currency wallet is currently blocked/disabled and funds cannot be added.",
                )}
                arrow
                disableHoverListener={!blockedWallet}
              >
                <button
                  type="button"
                  disabled={true}
                  className={styles.action}
                  onClick={() => {
                    navigate(
                      `/add-funds?type=${currentWallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${currentWallet?.wallet_id}`,
                    );
                  }}
                >
                  <span className={styles.actionIcon}>{ICONS.convert}</span>
                  <span className={styles.actionText}>
                    <strong>{t("Add Funds")}</strong>
                    <small>{t("Deposit to wallet")}</small>
                  </span>
                </button>
              </Tooltip>
            )}

            {can("wallet.payment.conversion") ? (
              <button
                type="button"
                disabled={blockedWallet}
                className={styles.action}
                onClick={() => setShowConversionModal(!showConversionModal)}
                id="convert_funds"
              >
                <span className={styles.actionIcon}>{ICONS.convert}</span>
                <span className={styles.actionText}>
                  <strong>{service_name_formatter(t("convert funds "))}</strong>
                  <small>{t("Multi-currency")}</small>
                </span>
              </button>
            ) : (
              <Tooltip
                title={t(
                  "This currency wallet is currently blocked/disabled and funds cannot be converted.",
                )}
                arrow
                disableHoverListener={!blockedWallet}
              >
                <button
                  type="button"
                  disabled={true}
                  className={styles.action}
                  onClick={() => setShowConversionModal(!showConversionModal)}
                  id="convert_funds"
                >
                  <span className={styles.actionIcon}>{ICONS.convert}</span>
                  <span className={styles.actionText}>
                    <strong>{service_name_formatter(t("convert funds "))}</strong>
                    <small>{t("Multi-currency")}</small>
                  </span>
                </button>
              </Tooltip>
            )}

            {/* Withdraw / Send Crypto */}
            {isCryptoWallet ? (
              can("wallet.payment.withdraw") && (
                <Tooltip
                  title={t(
                    "This currency wallet is currently blocked/disabled and you cannot send crypto.",
                  )}
                  arrow
                  disableHoverListener={!blockedWallet}
                >
                  <button
                    type="button"
                    disabled={blockedWallet}
                    className={styles.action}
                    onClick={() => openSendCryptoModal(currentWallet)}
                    id="send_crypto"
                  >
                    <span className={styles.actionIcon}>{ICONS.withdraw}</span>
                    <span className={styles.actionText}>
                      <strong>{t("Send Crypto")}</strong>
                      <small>{t("Send to an external address")}</small>
                    </span>
                  </button>
                </Tooltip>
              )
            ) : can("wallet.payment.withdraw") ? (
              <button
                type="button"
                disabled={blockedWallet}
                className={styles.action}
                onClick={() => setShowWithdrawalModal(!showWithdrawalModal)}
                id="withdraw_balance"
              >
                <span className={styles.actionIcon}>{ICONS.withdraw}</span>
                <span className={styles.actionText}>
                  <strong>{service_name_formatter(t("withdraw balance"))}</strong>
                  <small>{t("To the specified account")}</small>
                </span>
              </button>
            ) : (
              <Tooltip
                title={t(
                  "This currency wallet is currently blocked/disabled and you cannot withdraw balance.",
                )}
                arrow
              >
                <button
                  type="button"
                  disabled={true}
                  className={styles.action}
                  onClick={() => setShowWithdrawalModal(!showWithdrawalModal)}
                  id="withdraw_balance"
                >
                  <span className={styles.actionIcon}>{ICONS.withdraw}</span>
                  <span className={styles.actionText}>
                    <strong>{service_name_formatter(t("withdraw balance"))}</strong>
                    <small>{t("To the specified account")}</small>
                  </span>
                </button>
              </Tooltip>
            )}

            {/* Download Statement */}
            {can("transactions.wallet.export") ? (
              <button
                type="button"
                disabled={blockedWallet}
                className={styles.action}
                onClick={() => setShowDownloadStatementModal(!showDownloadStatementModal)}
                id={"download_statement"}
              >
                <span className={styles.actionIcon}>{ICONS.statement}</span>
                <span className={styles.actionText}>
                  <strong>{t("Download Statement")}</strong>
                  <small>{t("Download PDF")}</small>
                </span>
              </button>
            ) : (
              <Tooltip
                title={t(
                  "This currency wallet is currently blocked/disabled and you cannot download the statement.",
                )}
                arrow
                disableHoverListener={!blockedWallet}
              >
                <button
                  type="button"
                  disabled={true}
                  className={styles.action}
                  onClick={() => setShowDownloadStatementModal(!showDownloadStatementModal)}
                  id={"download_statement"}
                >
                  <span className={styles.actionIcon}>{ICONS.statement}</span>
                  <span className={styles.actionText}>
                    <strong>{t("Download Statement")}</strong>
                    <small>{t("Download PDF")}</small>
                  </span>
                </button>
              </Tooltip>
            )}

            {/* Auto Transfer Changes Required */}
            {can("wallet.status.update") && (
              <div className={`${styles.action} ${styles.disabledAction}`} aria-disabled="true">
                <span className={styles.actionIcon}>{ICONS.autoTransfer}</span>
                <span className={styles.actionText}>
                  <strong>{t("Auto Transfer")}</strong>
                  <small>{t("Automatically transfer to...")}</small>
                </span>
                <span className={styles.comingSoon}>{t("Coming soon")}</span>
              </div>
            )}

            {/* Wallet Status (toggle) */}
            {can("wallet.status.update") && (
              <Tooltip
                title={t(
                  "This currency wallet is currently set as your default and cannot be disabled. To proceed, please set a different currency wallet as your default first.",
                )}
                arrow
                disableHoverListener={!currentDefault}
              >
                <button
                  type="button"
                  className={`${styles.action} ${styles.status}`}
                  onClick={currentDefault ? console.log("Lol") : handleChangeStatus}
                  disabled={currentDefault}
                  id={"status_of_wallet"}
                >
                  <span className={styles.actionIcon}>{ICONS.freeze}</span>
                  <span className={styles.actionText}>
                    <strong>{t("Freeze Wallet")}</strong>
                    <small>{t("Freeze activity")}</small>
                  </span>

                  <div className={`${styles.switch} ${currentDefault ? styles.disabled : ""}`}>
                    <div className={`${styles.thumb} ${currentActive ? styles.active : ""}`}></div>
                  </div>
                </button>
              </Tooltip>
            )}
          </div>
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
        setSavedWallet={setSavedWallet}
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
        setShowModal={setShowDownloadStatementModal}
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
