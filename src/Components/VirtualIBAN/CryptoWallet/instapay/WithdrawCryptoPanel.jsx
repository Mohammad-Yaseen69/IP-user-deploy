import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styles from "../cryptoPage.module.scss";
import RailSelect from "./RailSelect";
import { formatWalletAmount, getWalletAvailable } from "./wallets";
import { getAssetSymbol, getWalletAccentColor } from "../utils/format";
import {
  WITHDRAW_STEPS,
  useCryptoWithdrawFlow,
} from "../../../../hooks/Payments/useCryptoWithdrawFlow";
import {
  formatAmountValue,
  handleAmountInputBlur,
  handleAmountInputChange,
  handleAmountInputKeyUp,
} from "../../utils/amount";
import {
  getAmountNumber,
  MIN_PAYOUT_AMOUNT,
} from "../../../../stateMachines/cryptoPayout";
import {
  getChannelAddress,
  getChannelAsset,
  getChannelProtocol,
  getProtocolLabel,
  maskAddress,
} from "../../../WalletsNew/SendCryptoModal/cryptoProtocols";
import ReviewStep from "../../../WalletsNew/SendCryptoModal/ReviewStep";
import DoneStep from "../../../WalletsNew/SendCryptoModal/DoneStep";
import OtpVerification from "../../../../Common/Component/OtpVerification";
import AddAccountFlow from "../../../Settings/WithdrawalsNew/AddAccountFlow";
import {
  buildCountryGroups,
  buildCryptoRows,
} from "../../../Settings/WithdrawalsNew/withdrawalAccounts";
import { MAX_CRYPTO_WALLETS } from "../../../Settings/WithdrawalsNew/withdrawalPayload";
import { UserContext } from "../../../../Context/UserContext";

const QUICK_PERCENTAGES = [25, 50, 75, 100];

const WithdrawCryptoPanel = ({ wallets = [], wallet, onSelectWallet }) => {
  const { t } = useTranslation();
  const { userWithdrawals, cryptoWithdrawals } = useContext(UserContext);
  const flow = useCryptoWithdrawFlow(wallet);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  const {
    step,
    setStep,
    cryptoCurrency,
    availableBalance,
    amount,
    setAmount,
    amountError,
    countries,
    countryIso,
    selectCountry,
    countryDestinations,
    hasAnyDestination,
    destinationKey,
    selectedDestination,
    selectDestination,
    address,
    protocol,
    setProtocol,
    protocolOptions,
    isProtocolLocked,
    addressStatus,
    destinationError,
  } = flow;

  const groups = useMemo(
    () => buildCountryGroups(userWithdrawals),
    [userWithdrawals],
  );
  const cryptoRows = useMemo(
    () => buildCryptoRows(cryptoWithdrawals),
    [cryptoWithdrawals],
  );
  const canAddWallet = cryptoRows.length < MAX_CRYPTO_WALLETS;

  const countryName =
    countries.find((country) => country.iso === countryIso)?.name || "";
  const destinationName = selectedDestination
    ? [
        `${t("My")} ${getChannelAsset(selectedDestination.entry) || cryptoCurrency} ${t("wallet")}`,
        countryName,
      ]
        .filter(Boolean)
        .join(" · ")
    : "-";

  const walletOptions = wallets.map((item) => {
    const code = item?.currency?.code;
    return {
      value: item?._id,
      label: `${code} ${t("Wallet")}`,
      render: () => (
        <>
          <span
            className={styles.railAvatar}
            style={{ background: getWalletAccentColor(code), color: "#fff" }}
          >
            {getAssetSymbol(code)}
          </span>
          <span className={styles.railSelectMain}>
            {code} {t("Wallet")}
          </span>
          <span className={styles.railSelectValue}>
            {formatWalletAmount(getWalletAvailable(item))} {code}
          </span>
        </>
      ),
    };
  });

  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: country.name,
  }));

  const destinationOptions = countryDestinations.map((destination) => {
    const entry = destination.entry;
    const asset = getChannelAsset(entry) || cryptoCurrency;
    const network = getChannelProtocol(entry);
    return {
      value: destination.key,
      label: `${asset}${network ? ` • ${getProtocolLabel(network)}` : ""} — ${maskAddress(getChannelAddress(entry))}`,
    };
  });

  const quickAmounts = QUICK_PERCENTAGES.map((percent) => ({
    percent,
    value: Number(
      ((getAmountNumber(availableBalance) * percent) / 100).toFixed(2),
    ),
  })).filter(({ value }) => value > 0);

  const otpModal = (
    <Modal
      isOpen={step === WITHDRAW_STEPS.OTP}
      toggle={flow.back}
      centered
      style={{ maxWidth: "520px" }}
    >
      <ModalHeader toggle={flow.back}>
        {t("Confirm your withdrawal")}
      </ModalHeader>
      <ModalBody>
        <OtpVerification
          fullHeight
          variant="card"
          methods={flow.otpMethods}
          setter={setStep}
          setterValue={WITHDRAW_STEPS.DONE}
          hideOtp={() => {}}
          callback={flow.confirmWithdrawal}
          processing={flow.isSending}
          resendHandler={flow.requestOtp}
          authType={flow.authType}
          setAuthType={flow.setAuthType}
          showBackButton
          onBack={flow.back}
        />
      </ModalBody>
    </Modal>
  );

  if (step === WITHDRAW_STEPS.REVIEW || step === WITHDRAW_STEPS.OTP) {
    return (
      <div className={styles.railStep}>
        <ReviewStep
          feeDetails={flow.feeDetails}
          address={address}
          protocol={protocol}
          cryptoCurrency={cryptoCurrency}
          beneficiaryName={destinationName}
          confirmedNetwork={flow.confirmedNetwork}
          setConfirmedNetwork={flow.setConfirmedNetwork}
          quoteExpiresAt={flow.quoteExpiresAt}
          isQuoteExpired={flow.isQuoteExpired}
          onRefreshQuote={flow.refreshQuote}
          isRefreshing={flow.isFetchingQuote}
        />
        <div className={styles.railBtnRow}>
          <button
            type="button"
            className={styles.railBtnGhost}
            onClick={flow.back}
            disabled={flow.isSendingOtp}
          >
            {t("Back")}
          </button>
          <button
            type="button"
            className={styles.railSubmit}
            onClick={() => flow.requestOtp()}
            disabled={!flow.canConfirm || step === WITHDRAW_STEPS.OTP}
          >
            {flow.isSendingOtp ? t("Sending code...") : t("Confirm & Withdraw")}
          </button>
        </div>
        {otpModal}
      </div>
    );
  }

  if (step === WITHDRAW_STEPS.DONE) {
    return (
      <div className={styles.railStep}>
        <DoneStep
          payoutResult={flow.payoutResult}
          cryptoCurrency={cryptoCurrency}
          protocol={protocol}
          address={address}
          beneficiaryName={destinationName}
          onSendAgain={flow.reset}
          onClose={flow.reset}
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.railAmount}>
        <div className={styles.railAmountLabel}>{t("Enter amount")}</div>
        <div className={styles.railAmountRow}>
          <input
            className={styles.railAmountInput}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => handleAmountInputChange(event, setAmount)}
            onKeyUp={(event) => handleAmountInputKeyUp(event, setAmount)}
            onBlur={(event) => handleAmountInputBlur(event, setAmount)}
            style={{
              width: `${Math.max(String(amount || "0.00").length, 1) + 0.5}ch`,
            }}
            placeholder="0.00"
            maxLength={12}
            disabled={!wallet}
          />
        </div>
        {amountError ? (
          <div className={styles.railAmountError}>{t(amountError)}</div>
        ) : (
          <div className={styles.railAmountHint}>
            {t("Available")}:{" "}
            <strong>
              {formatWalletAmount(availableBalance)} {cryptoCurrency}
            </strong>
            {" · "}
            {t("Min")} {MIN_PAYOUT_AMOUNT} {cryptoCurrency}
          </div>
        )}
        {quickAmounts.length > 0 && (
          <div className={styles.railQuick}>
            {quickAmounts.map(({ percent, value }) => (
              <button
                key={percent}
                type="button"
                className={`${styles.railQuickBtn} ${getAmountNumber(amount) === value ? styles.railQuickBtnActive : ""}`}
                onClick={() => setAmount(formatAmountValue(value))}
              >
                {percent}%
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.railBody}>
        <div>
          <span className={styles.railLabel}>{t("Withdraw from wallet")}</span>
          <RailSelect
            value={wallet?._id}
            options={walletOptions}
            onChange={(option) => onSelectWallet?.(option.value)}
            placeholder={t("Choose a wallet")}
            emptyText={t("No crypto wallet yet")}
          />
        </div>

        <div>
          <span className={styles.railLabel}>{t("Country")}</span>
          <RailSelect
            small
            value={countryIso}
            options={countryOptions}
            onChange={(option) => selectCountry(option.value)}
            placeholder={t("Choose a country")}
            emptyText={t("You have no withdrawal accounts yet.")}
            disabled={!wallet}
          />
        </div>

        {countryIso && (
          <div>
            <span className={styles.railLabel}>
              {t("Crypto withdrawal account")}
            </span>
            {destinationOptions.length > 0 ? (
              <RailSelect
                small
                value={destinationKey}
                options={destinationOptions}
                onChange={(option) => selectDestination(option.value)}
                placeholder={t("Choose a crypto wallet")}
                disabled={destinationOptions.length <= 1}
              />
            ) : (
              <p className={styles.railFieldError}>
                {t(
                  "You have no {{currency}} crypto withdrawal account in {{country}}.",
                  {
                    currency: cryptoCurrency,
                    country: countryName,
                  },
                )}
              </p>
            )}

            {address && (
              <div className={styles.railChannelInfo}>
                <span className={styles.railMono}>{address}</span>
                <span className={styles.railChannelMeta}>
                  {addressStatus === "checking" && t("Checking address...")}
                  {addressStatus === "valid" && (
                    <span className={styles.railOk}>
                      {t("Valid for")} {getProtocolLabel(protocol)}
                    </span>
                  )}
                  {addressStatus === "invalid" && (
                    <span className={styles.railBad}>
                      {t(
                        "This address is not valid on the network saved for this wallet.",
                      )}
                    </span>
                  )}
                  {!addressStatus &&
                    t("Taken from your saved withdrawal account.")}
                </span>

                {isProtocolLocked && protocol ? (
                  <span className={styles.railNetwork}>
                    {t("Network")}:{" "}
                    <strong>{getProtocolLabel(protocol)}</strong>
                  </span>
                ) : protocolOptions.length > 0 ? (
                  <span className={styles.railNetworkChips}>
                    {protocolOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`${styles.networkTab} ${protocol === option ? styles.networkTabActive : ""}`}
                        onClick={() => setProtocol(option)}
                      >
                        {getProtocolLabel(option)}
                      </button>
                    ))}
                  </span>
                ) : (
                  <span className={styles.railBad}>
                    {t(
                      "We could not work out which network this address belongs to.",
                    )}
                  </span>
                )}
              </div>
            )}

            {destinationError && (
              <p className={styles.railFieldError}>{destinationError}</p>
            )}
          </div>
        )}

        {canAddWallet && (
          <button
            type="button"
            className={`${styles.railLink} ${styles.railLinkActive}`}
            onClick={() => setIsAddWalletOpen(true)}
            disabled={!wallet}
          >
            <Plus size={15} />
            {hasAnyDestination
              ? t("Add crypto wallet")
              : t("Add a crypto withdrawal account")}
          </button>
        )}

        <button
          type="button"
          className={styles.railSubmit}
          disabled={!flow.canGetQuote}
          onClick={flow.getQuote}
        >
          {flow.isFetchingQuote ? (
            t("Fetching rates...")
          ) : (
            <>
              {t("Withdraw")} {"›››"}
            </>
          )}
        </button>
      </div>

      <AddAccountFlow
        open={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        mode="crypto"
        countries={[]}
        groups={groups}
        cryptoRows={cryptoRows}
      />
    </>
  );
};

export default WithdrawCryptoPanel;
