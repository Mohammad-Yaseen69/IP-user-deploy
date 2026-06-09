import { useTranslation } from "react-i18next"
import { TRANSFER_SPEEDS, LINKED_BANKS } from "../../../stateMachines/withdrawBalance"
import styles from "./withdrawBalance.module.scss"

const LightningIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
            d="M8.66667 1.33334L3.33334 9.33334H8L7.33334 14.6667L12.6667 6.66668H8L8.66667 1.33334Z"
            stroke="#5926F0"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const SpeedometerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#5926F0" strokeWidth="1.2" />
        <path d="M8 4V8L10 10" stroke="#5926F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="1" fill="#5926F0" />
    </svg>
)

const SpeedIcons = {
    lightning: LightningIcon,
    speedometer: SpeedometerIcon,
}

const BankFlag = ({ country }) => (
    <div
        className={styles.bankFlag}
        style={{
            background:
                country === "EG"
                    ? "linear-gradient(180deg, #CE1126 33%, #FFF 33%, #FFF 66%, #000 66%)"
                    : "linear-gradient(180deg, #FF9933 33%, #FFF 33%, #FFF 66%, #138808 66%)",
        }}
    />
)

const DestinationStep = ({
    transferSpeed,
    setTransferSpeed,
    selectedBank,
    setSelectedBank,
    showBankOnly = false,
    showSpeedOnly = false,
}) => {
    const { t } = useTranslation()

    return (
        <div>
            {!showSpeedOnly && (
                <>
                    <div className={styles.sectionLabel}>{t("Linked bank accounts")}</div>
                    <div className={styles.bankList}>
                        {LINKED_BANKS.map((bank) => {
                            const isSelected = selectedBank === bank.id

                            return (
                                <button
                                    type="button"
                                    key={bank.id}
                                    className={`${styles.bankOption} ${isSelected ? styles.selected : ""}`}
                                    onClick={() => setSelectedBank(bank.id)}
                                >
                                    <div className={styles.bankLeft}>
                                        <div className={styles.radioBtn} />
                                        <div className={styles.bankInfo}>
                                            <h4>{bank.name}</h4>
                                            <p>....{bank.lastFour} - {bank.conversion}</p>
                                        </div>
                                    </div>
                                    <BankFlag country={bank.country} />
                                </button>
                            )
                        })}
                    </div>
                </>
            )}

            {!showBankOnly && (
                <>
                    <div className={styles.sectionLabel}>{t("Select speed")}</div>
                    <div className={styles.speedOptions}>
                        {TRANSFER_SPEEDS.map((speed) => {
                            const SpeedIcon = SpeedIcons[speed.icon]
                            const isSelected = transferSpeed === speed.id

                            return (
                                <button
                                    type="button"
                                    key={speed.id}
                                    className={`${styles.speedOption} ${isSelected ? styles.selected : ""}`}
                                    onClick={() => setTransferSpeed(speed.id)}
                                >
                                    <div className={styles.speedLeft}>
                                        <div className={styles.radioBtn} />
                                        <div className={styles.speedIconBox}>
                                            {SpeedIcon && <SpeedIcon />}
                                        </div>
                                        <div className={styles.speedInfo}>
                                            <h4>{t(speed.label)}</h4>
                                            <p>{t(speed.description)}</p>
                                        </div>
                                    </div>
                                    <div className={styles.speedFee}>EUR {speed.fee}</div>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default DestinationStep
