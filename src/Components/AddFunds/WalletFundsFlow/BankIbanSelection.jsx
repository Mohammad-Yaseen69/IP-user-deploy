import { Check } from "react-feather";
import logo_w from "../../../assets/images/logo/logo_white.png";
import { Skeleton } from "@mui/material";

const BankIbanSelection = ({
  savedBanks,
  selectedBankId,
  setSelectedBankId,
  recipientData,
  handleRecipientChange,
  type,
  t,
  styles,
  cardStyles,
  banksLoading,
}) => {
  return (
    <div className={styles.bankDets}>
      {banksLoading ? (
        <Skeleton height={200} width={"70%"} />
      ) : (
        savedBanks.length > 0 && (
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
                      <span style={{ fontSize: ".7rem" }}>{bank.recipientIbanMasked}</span>
                      <span style={{ fontSize: ".65rem", opacity: 0.85 }}>
                        {bank.transactionCount} {t("transactions")}
                      </span>
                    </div>
                    {selectedBankId === bank._id && <Check style={{ color: "white" }} size={20} />}
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      )}

      <div style={{ padding: "0", border: "none" }}>
        <h5 style={{ fontWeight: 700 }}>
          {savedBanks.length > 0 ? t("Add bank details") : t("Enter your bank IBAN")}
        </h5>
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
                color: "#8A8A8A",
              }}
            >
              {t("Type in the IBAN of the bank account you'll be transferring from:")}
            </label>

            <input
              type="text"
              value={recipientData.iban}
              maxLength={34}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, "");
                handleRecipientChange("iban", value);
                setSelectedBankId(null);
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

            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                marginTop: "4px",
                color: recipientData.iban.length === 34 ? "red" : "#8A8A8A",
              }}
            >
              {recipientData.iban.length} / 34 {t("characters")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankIbanSelection;
