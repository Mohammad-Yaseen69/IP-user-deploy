import { Check } from 'react-feather';
import logo_w from "../../../assets/images/logo/logo_white.png";

const BankIbanSelection = ({
  savedBanks,
  selectedBankId,
  setSelectedBankId,
  recipientData,
  handleRecipientChange,
  type,
  t,
  styles,
  cardStyles
}) => {
  return (
    <div className={styles.bankDets}>
      {savedBanks.length > 0 && (
        <>
          <h5 style={{ fontWeight: 700 }}>{t("Select Your Saved Bank")}</h5>
          <div className={cardStyles.cards} style={{ marginBottom: "1rem" }}>
            {savedBanks.map((bank) => (
              <div
                key={bank._id}
                className={cardStyles.card}
                onClick={() => {
                  setSelectedBankId(bank._id);
                  handleRecipientChange("iban", ""); // Clear IBAN if a saved bank is selected
                }}
              >
                <div className={cardStyles.c_top}>
                  <img src={logo_w} alt="" />
                </div>
                <div className={cardStyles.c_bot}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      maxWidth: "80%",
                    }}
                  >
                    <span style={{ fontSize: ".75rem", opacity: 0.85 }}>
                      {bank.bankName || "Bank Account"}
                    </span>
                    <span style={{ fontSize: ".7rem" }}>
                      {bank.recipientIbanMasked}
                    </span>
                    <span style={{ fontSize: ".65rem", opacity: 0.85 }}>
                      {bank.transactionCount} {t("transactions")}
                    </span>
                  </div>
                  {selectedBankId === bank._id && (
                    <Check style={{ color: "white" }} size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ padding: "0", border: "none" }}>
        <h5 style={{ fontWeight: 700 }}>{savedBanks.length > 0 ? t("Add bank details") : t("Enter recipient IBAN for Plaid Bank Transfer")}</h5>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "14px",
                color: "#8A8A8A"
              }}
            >
              {t("Type in the IBAN of the bank account you'll be transferring from:")}
            </label>
            <input
              type="text"
              value={recipientData.iban}
              onChange={(e) => {
                handleRecipientChange("iban", e.target.value);
                setSelectedBankId(null); // Clear selected bank if user starts typing a new IBAN
              }}
              placeholder="Example: GB33BUKB20201555555555"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontFamily: "Manrope",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {(type !== "payment_address" && type !== "verification_payment") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f8f9fa",
                borderRadius: "6px",
              }}
            >
              <input
                type="checkbox"
                id="saveForFuture"
                checked={recipientData.saveForFutureUse}
                onChange={(e) => handleRecipientChange("saveForFutureUse", e.target.checked)}
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
              <label
                htmlFor="saveForFuture"
                style={{ cursor: "pointer", marginBottom: 0, flex: 1, fontSize: "14px", color: "#8b8b8b" }}
              >
                {t("Save this bank for future use")}
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankIbanSelection;