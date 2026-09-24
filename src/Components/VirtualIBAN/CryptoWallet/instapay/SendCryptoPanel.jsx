import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus } from "react-feather"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import styles from "../cryptoPage.module.scss"
import RailSelect from "./RailSelect"
import { formatWalletAmount, getWalletAvailable } from "./wallets"
import { getAssetSymbol, getWalletAccentColor } from "../utils/format"
import { SEND_STEPS, getBeneficiaryId, getBeneficiaryName, useCryptoSendFlow } from "../../../../hooks/Payments/useCryptoSendFlow"
import {
    formatAmountValue,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
} from "../../utils/amount"
import { getAmountNumber, MIN_PAYOUT_AMOUNT } from "../../../../stateMachines/cryptoPayout"
import {
    getBeneficiaryCryptoChannels,
    getChannelAddress,
    getChannelAsset,
    getChannelProtocol,
    getProtocolLabel,
    maskAddress,
} from "../../../WalletsNew/SendCryptoModal/cryptoProtocols"
import ReviewStep from "../../../WalletsNew/SendCryptoModal/ReviewStep"
import DoneStep from "../../../WalletsNew/SendCryptoModal/DoneStep"
import AddBeneficiaryFlowV2 from "../../Beneficiaries/AddBeneficiaryFlowV2"
import OtpVerification from "../../../../Common/Component/OtpVerification"

const QUICK_PERCENTAGES = [25, 50, 75, 100]

const channelKey = (channel, index) => channel?._id || `${getChannelAddress(channel)}-${index}`

/**
 * The crypto payout drawn inside the rail: everything is asked on one screen, the
 * Send button fetches the quote, and the review, OTP and receipt take the same slot.
 * The rules all live in useCryptoSendFlow, shared with SendCryptoModal.
 */
const SendCryptoPanel = ({ wallets = [], wallet, onSelectWallet }) => {
    const { t } = useTranslation()
    const flow = useCryptoSendFlow(wallet)
    const [sendTo, setSendTo] = useState("saved")
    const [isAddBeneficiaryOpen, setIsAddBeneficiaryOpen] = useState(false)

    const {
        step,
        setStep,
        cryptoCurrency,
        availableBalance,
        amount,
        setAmount,
        amountError,
        cryptoBeneficiaries,
        selectedBeneficiary,
        selectBeneficiary,
        cryptoChannels,
        selectChannel,
        address,
        protocol,
        setProtocol,
        protocolOptions,
        isProtocolLocked,
        addressStatus,
        beneficiaryError,
        canEditBeneficiary,
        editBeneficiary,
        onBeneficiarySaved,
    } = flow

    const walletOptions = wallets.map((item) => {
        const code = item?.currency?.code
        return {
            value: item?._id,
            label: `${code} ${t("Wallet")}`,
            render: () => (
                <>
                    <span className={styles.railAvatar} style={{ background: getWalletAccentColor(code), color: "#fff" }}>
                        {getAssetSymbol(code)}
                    </span>
                    <span className={styles.railSelectMain}>{code} {t("Wallet")}</span>
                    <span className={styles.railSelectValue}>{formatWalletAmount(getWalletAvailable(item))} {code}</span>
                </>
            ),
        }
    })

    const beneficiaryOptions = cryptoBeneficiaries.map((beneficiary) => {
        const channels = getBeneficiaryCryptoChannels(beneficiary)
        return {
            value: getBeneficiaryId(beneficiary),
            label: getBeneficiaryName(beneficiary),
            beneficiary,
            render: () => (
                <>
                    <span className={styles.railAvatar}>{getBeneficiaryName(beneficiary).charAt(0).toUpperCase()}</span>
                    <span className={styles.railSelectMain}>{getBeneficiaryName(beneficiary)}</span>
                    <span className={styles.railSelectValue}>
                        {channels.length > 1 ? `${channels.length} ${t("wallets")}` : maskAddress(getChannelAddress(channels[0]))}
                    </span>
                </>
            ),
        }
    })

    const channelOptions = cryptoChannels.map((channel, index) => {
        const asset = getChannelAsset(channel) || cryptoCurrency
        const network = getChannelProtocol(channel)
        const label = `${asset}${network ? ` • ${getProtocolLabel(network)}` : ""} — ${maskAddress(getChannelAddress(channel))}`
        return { value: channelKey(channel, index), label, channel }
    })

    const selectedChannelValue = cryptoChannels.reduce(
        (found, channel, index) => found || (getChannelAddress(channel) === address ? channelKey(channel, index) : ""),
        ""
    )

    const quickAmounts = QUICK_PERCENTAGES
        .map((percent) => ({ percent, value: Number(((getAmountNumber(availableBalance) * percent) / 100).toFixed(2)) }))
        .filter(({ value }) => value > 0)

    const editLink = canEditBeneficiary && (
        <>
            {" "}
            <button type="button" className={styles.railTextLink} onClick={editBeneficiary}>
                {t("Edit beneficiary")}
            </button>
        </>
    )

    const otpModal = (
        <Modal isOpen={step === SEND_STEPS.OTP} toggle={flow.back} centered style={{ maxWidth: "520px" }}>
            <ModalHeader toggle={flow.back}>{t("Confirm your transfer")}</ModalHeader>
            <ModalBody>
                <OtpVerification
                    fullHeight
                    variant="card"
                    methods={flow.otpMethods}
                    setter={setStep}
                    setterValue={SEND_STEPS.DONE}
                    hideOtp={() => { }}
                    callback={flow.confirmPayout}
                    processing={flow.isSending}
                    resendHandler={flow.requestOtp}
                    authType={flow.authType}
                    setAuthType={flow.setAuthType}
                    showBackButton
                    onBack={flow.back}
                />
            </ModalBody>
        </Modal>
    )

    if (step === SEND_STEPS.REVIEW || step === SEND_STEPS.OTP) {
        return (
            <div className={styles.railStep}>
                <ReviewStep
                    feeDetails={flow.feeDetails}
                    address={address}
                    protocol={protocol}
                    cryptoCurrency={cryptoCurrency}
                    beneficiaryName={getBeneficiaryName(selectedBeneficiary)}
                    confirmedNetwork={flow.confirmedNetwork}
                    setConfirmedNetwork={flow.setConfirmedNetwork}
                    quoteExpiresAt={flow.quoteExpiresAt}
                    isQuoteExpired={flow.isQuoteExpired}
                    onRefreshQuote={flow.refreshQuote}
                    isRefreshing={flow.isFetchingQuote}
                />
                <div className={styles.railBtnRow}>
                    <button type="button" className={styles.railBtnGhost} onClick={flow.back} disabled={flow.isSendingOtp}>
                        {t("Back")}
                    </button>
                    <button
                        type="button"
                        className={styles.railSubmit}
                        onClick={() => flow.requestOtp()}
                        disabled={!flow.canConfirm || step === SEND_STEPS.OTP}
                    >
                        {flow.isSendingOtp ? t("Sending code...") : t("Confirm & Send")}
                    </button>
                </div>
                {otpModal}
            </div>
        )
    }

    if (step === SEND_STEPS.DONE) {
        return (
            <div className={styles.railStep}>
                <DoneStep
                    payoutResult={flow.payoutResult}
                    cryptoCurrency={cryptoCurrency}
                    protocol={protocol}
                    address={address}
                    beneficiaryName={getBeneficiaryName(selectedBeneficiary)}
                    onSendAgain={flow.reset}
                    onClose={flow.reset}
                />
            </div>
        )
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
                        style={{ width: `${Math.max(String(amount || "0.00").length, 1) + 0.5}ch` }}
                        placeholder="0.00"
                        maxLength={12}
                        disabled={!wallet}
                    />
                    {/* <span className={styles.railAmountCurrency}>{cryptoCurrency}</span> */}
                </div>
                {amountError
                    ? <div className={styles.railAmountError}>{t(amountError)}</div>
                    : (
                        <div className={styles.railAmountHint}>
                            {t("Available")}: <strong>{formatWalletAmount(availableBalance)} {cryptoCurrency}</strong>
                            {" · "}{t("Min")} {MIN_PAYOUT_AMOUNT} {cryptoCurrency}
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
                    <span className={styles.railLabel}>{t("Pay from wallet")}</span>
                    <RailSelect
                        value={wallet?._id}
                        options={walletOptions}
                        onChange={(option) => onSelectWallet?.(option.value)}
                        placeholder={t("Choose a wallet")}
                        emptyText={t("No crypto wallet yet")}
                    />
                </div>

                <div>
                    <span className={styles.railLabel}>{t("Send to")}</span>
                    <div className={styles.railOptions}>
                        <div
                            className={`${styles.railOption} ${styles.railOptionClickable} ${sendTo === "saved" ? styles.railOptionActive : ""}`}
                            onClick={() => setSendTo("saved")}
                        >
                            <span className={`${styles.railRadio} ${sendTo === "saved" ? styles.railRadioOn : ""}`} />
                            <span>
                                <span className={styles.railOptionTitle}>{t("Saved beneficiary")}</span>
                                <p className={styles.railOptionSub}>{t("Pick a contact & their crypto channel")}</p>
                            </span>
                        </div>
                        <div className={`${styles.railOption} ${styles.railOptionDisabled}`} aria-disabled="true">
                            <span className={styles.railRadio} />
                            <span>
                                <span className={styles.railOptionTitle}>{t("New wallet address")}</span>
                                <p className={styles.railOptionSub}>{t("Paste an external address")}</p>
                            </span>
                            <span className={styles.railSoon}>{t("Coming Soon")}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <span className={styles.railLabel}>{t("Beneficiary")}</span>
                    <RailSelect
                        small
                        value={getBeneficiaryId(selectedBeneficiary)}
                        options={beneficiaryOptions}
                        onChange={(option) => selectBeneficiary(option.beneficiary)}
                        placeholder={t("Choose a beneficiary")}
                        emptyText={t("No beneficiaries with a saved {{currency}} wallet address.", { currency: cryptoCurrency })}
                        disabled={!wallet}
                    />
                    {beneficiaryError && (
                        <p className={styles.railFieldError}>
                            {beneficiaryError}
                            {editLink}
                        </p>
                    )}
                </div>

                {selectedBeneficiary && (
                    <div>
                        <span className={styles.railLabel}>{t("Crypto channel")}</span>
                        <RailSelect
                            small
                            value={selectedChannelValue}
                            options={channelOptions}
                            onChange={(option) => selectChannel(option.channel)}
                            placeholder={t("Choose a channel")}
                            emptyText={t("This beneficiary has no crypto channel.")}
                            disabled={channelOptions.length <= 1}
                        />

                        {address && (
                            <div className={styles.railChannelInfo}>
                                <span className={styles.railMono}>{address}</span>
                                <span className={styles.railChannelMeta}>
                                    {addressStatus === "checking" && t("Checking address...")}
                                    {addressStatus === "valid" && (
                                        <span className={styles.railOk}>{t("Valid for")} {getProtocolLabel(protocol)}</span>
                                    )}
                                    {addressStatus === "invalid" && (
                                        <span className={styles.railBad}>
                                            {isProtocolLocked
                                                ? t("This address is not valid on the network saved for this beneficiary.")
                                                : t("This address is not valid for the selected network.")}
                                            {editLink}
                                        </span>
                                    )}
                                    {!addressStatus && t("Taken from the saved beneficiary wallet.")}
                                </span>

                                {isProtocolLocked && protocol ? (
                                    <span className={styles.railNetwork}>
                                        {t("Network")}: <strong>{getProtocolLabel(protocol)}</strong>
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
                                        {t("We could not work out which network this address belongs to. Edit the beneficiary and save the wallet with its network.")}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className={`${styles.railLink} ${styles.railLinkActive}`}
                    onClick={() => setIsAddBeneficiaryOpen(true)}
                    disabled={!wallet}
                >
                    <Plus size={15} />
                    {t("Add new beneficiary")}
                </button>

                <button
                    type="button"
                    className={styles.railSubmit}
                    disabled={!flow.canGetQuote}
                    onClick={flow.getQuote}
                >
                    {flow.isFetchingQuote ? t("Fetching rates...") : <>{t("Send")} {"›››"}</>}
                </button>
            </div>

            <AddBeneficiaryFlowV2
                open={isAddBeneficiaryOpen}
                handleClose={() => setIsAddBeneficiaryOpen(false)}
                onSaveSuccess={async (saved) => {
                    setIsAddBeneficiaryOpen(false)
                    await onBeneficiarySaved(saved)
                }}
                fixedMethod="crypto_wallet"
            />
        </>
    )
}

export default SendCryptoPanel
