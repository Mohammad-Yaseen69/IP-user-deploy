import { Copy, ArrowUpRight, Eye } from "react-feather"
import styles from "../styles/Balanceheader.module.css"
import { Tooltip } from "@mui/material"
import UK_Image from "../files/images/UK.svg"
import Malta_Image from "../files/images/Malta.svg"
import { getVirtualIbanCountry, normalizeVirtualIban } from "../utils/virtualIban"
import { useTranslation } from "react-i18next"
import { usePermission } from "../../../hooks/GeneralUse/usePermission"
import { useSyncVirtualIbanBalance } from "../../../hooks/useVirtualIban"


const formatAmount = (amount, currency) => {
  const value = Number(amount || 0)
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
  })
}

const BalanceHeader = ({ iban, isLoading, setActiveTab, onShowDetails }) => {
  const mappedIban = normalizeVirtualIban(iban) || {}
  const ibanId = mappedIban?._id || mappedIban?.id
  const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId)
  const currentBalance = syncedBalance?.balance ?? mappedIban?.balance ?? 0
  const status = syncedBalance?.status || mappedIban?.status || "ACTIVE"
  const isBlocked = String(status).toUpperCase() === "BLOCKED" || String(status).toUpperCase() === "INACTIVE"
  const bic = mappedIban?.bank?.bic || mappedIban?.swift_code || "-"
  const currency = syncedBalance?.currency || mappedIban?.currency || "EUR"
  const country = getVirtualIbanCountry(mappedIban)
  const flag = country === "GB" ? UK_Image : Malta_Image
  const { t } = useTranslation()
  const can = usePermission()
  const canViewDetails = can("virtual-iban.details.view")
  const canViewBalance = can("virtual-iban.details.balance")
  const canCopyDetails = can("virtual-iban.details.copy")
  const handleShowDetails = () => {
    if (isBlocked || !canViewDetails) return

    onShowDetails?.()
    setActiveTab?.("ibanassets")
  }

  const handleCopy = (text) => {
    if (text && text !== "-") navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return <div className={styles.card}>{t("Loading account...")}</div>
  }

  return (
    <div className={styles.card}>
      <div className={styles.topBar}>
        <div className={styles.leftInfo}>
          <span className={styles.accountTag}><img src={flag} alt="" /> {t("IBAN")}</span>
          <span className={styles.activeBadge}>{t(status)}</span>
        </div>

        <div className={styles.rightActions}>
          {canViewDetails && (
            <Tooltip
              title={isBlocked ? t("This virtual IBAN is paused. Reactivate it to view deposit details.") : ""}
              arrow
              placement="top"
            >
              <span>
                <button
                  onClick={handleShowDetails}
                  disabled={isBlocked}
                  className={`${styles.iconBtn} ${isBlocked ? styles.disabledBtn : ""}`}
                >
                  <span>{t("Virtual bank details")}</span>
                  <ArrowUpRight size={16} />
                </button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      <div className={styles.balanceSection}>
        <div>
          <h1 className={styles.balance}>{canViewBalance ? formatAmount(currentBalance, currency) : "****"}</h1>
          {/* <Eye color="#5926F0" size={15} /> */}
        </div>
        {/* <span className={styles.growth}><ArrowUpRight size={15} /> 0.00%</span> */}
      </div>

      <div className={styles.infoBox}>
        <div className={styles.item}>
          <span className={styles.label}>{t("IBAN")}</span>
          <div>
            <span className={styles.value}>{canViewDetails ? (mappedIban?.iban || "-") : "****"}</span>
            {canCopyDetails && (
              <Copy
                size={16}
                className={styles.copyIcon}
                onClick={() => handleCopy(mappedIban?.iban)}
              />
            )}
          </div>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>{t("BIC")}</span>
          <div>
            <span className={styles.value}>{canViewDetails ? bic : "****"}</span>
            {canCopyDetails && (
              <Copy
                size={16}
                className={styles.copyIcon}
                onClick={() => handleCopy(bic)}
              />
            )}
          </div>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>{t("Currency")}</span>
          <div>
            <div className={styles.currencyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
                <path d="M0 5.3375V4.2H7.0875L6.7375 5.3375H0ZM0 7.98V6.8425H6.3875L6.0375 7.98H0ZM6.125 0C6.83667 0 7.46083 0.105 7.9975 0.315C8.53417 0.513333 8.98917 0.816666 9.3625 1.225C9.7475 1.62167 10.045 2.11167 10.255 2.695L8.995 3.29C8.79667 2.625 8.46417 2.1175 7.9975 1.7675C7.5425 1.40583 6.95917 1.225 6.2475 1.225C5.5475 1.225 4.935 1.4175 4.41 1.8025C3.885 2.17583 3.47083 2.71833 3.1675 3.43C2.87583 4.13 2.73 4.97 2.73 5.95C2.73 7.39667 3.0275 8.54583 3.6225 9.3975C4.2175 10.2492 5.0925 10.675 6.2475 10.675C6.9825 10.675 7.60083 10.4767 8.1025 10.08C8.61583 9.67167 8.9775 9.07667 9.1875 8.295L10.465 8.7675C10.255 9.42083 9.94583 9.98667 9.5375 10.465C9.14083 10.9317 8.65667 11.2875 8.085 11.5325C7.525 11.7775 6.895 11.9 6.195 11.9C5.15667 11.9 4.27583 11.6608 3.5525 11.1825C2.82917 10.6925 2.275 10.0042 1.89 9.1175C1.51667 8.23083 1.33 7.175 1.33 5.95C1.33 4.725 1.53417 3.66917 1.9425 2.7825C2.35083 1.89583 2.91083 1.21333 3.6225 0.735C4.34583 0.245 5.18 0 6.125 0Z" fill="white" />
              </svg>
            </div>
            <span className={styles.value}>{currency}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BalanceHeader
