import { useContext, useEffect } from "react";
import { Check } from "react-feather";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import { useVirtualIbans } from "../../../hooks/useVirtualIban";
import { formatWalletAmount } from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import { isIbanShort } from "../../../hooks/useMastercardIbanTopup";
import styles from "../styles/onboard.module.scss";

const BLOCKED_STATUSES = ["INACTIVE", "BLOCKED", "SUSPENDED"];
const isPayable = (iban) =>
  !BLOCKED_STATUSES.includes(String(iban?.status || "").toUpperCase()) &&
  !iban.adminBlocked &&
  !iban.freezeIban &&
  !iban.blockOutbound &&
  !iban.userBlocked;

const IbanSelect = ({ iban, setIban, feeDetails, quoteLoading, quoteError }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const { data: ibans = [], isLoading } = useVirtualIbans(userDetails?._id);
  const payable = ibans.filter(isPayable);

  useEffect(() => {
    if (!iban?._id && payable.length) setIban(payable[0]);
  }, [payable.length]);

  if (isLoading) return <p style={{ marginTop: "1rem" }}>{t("Loading...")}</p>;
  if (!payable.length) {
    return (
      <p style={{ marginTop: "1rem" }}>{t("You need an active virtual IBAN to pay this way.")}</p>
    );
  }

  return (
    <div className={styles.step1} style={{ marginTop: "1rem" }}>
      <div>
        {payable.map((item) => {
          const selected = iban?._id === item._id;
          const short = selected && isIbanShort(item, feeDetails);
          return (
            <div
              key={item._id}
              onClick={() => setIban(item)}
              className={`${styles.paymentOptions} ${selected && !short && styles.selected}`}
              style={short ? { opacity: 0.6 } : undefined}
            >
              <div style={{ width: "100%" }}>
                <h5>
                  {item.currency} {t("IBAN")} ·· {String(item.iban || "").slice(-4)}
                  <br />
                  <small>
                    {formatWalletAmount(item.balance)} {item.currency} {t("available")}
                  </small>
                  {short && (
                    <>
                      <br />
                      <small style={{ color: "#d32f2f", fontWeight: 600 }}>
                        {t("Insufficient balance")}
                      </small>
                    </>
                  )}
                </h5>
                {selected && !short && (
                  <Check color="white" size={20} style={{ marginLeft: "auto" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {quoteLoading && <p>{t("Calculating fee...")}</p>}
      {quoteError && <p style={{ color: "#d32f2f", fontWeight: 600 }}>{quoteError}</p>}
    </div>
  );
};

export default IbanSelect;
