import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Shield, Clock, Tool } from 'react-feather'
import logo from '../../assets/images/logo/logo.svg'
import styles from './MaintenancePage.module.css'

const MaintenancePage = () => {
    const { t } = useTranslation()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            window.location.reload()
        }, 600)
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgGlowTop} />
            <div className={styles.bgGlowBottom} />

            <div className={styles.contentWrapper}>
                <div className={styles.logoWrapper}>
                    <img src={logo} alt="InstaPay" className={styles.logo} />
                </div>

                <div className={styles.card}>
                    <div className={styles.iconContainer}>
                        <div className={styles.iconPulseRing} />
                        <div className={styles.iconPulseRingSecondary} />
                        <div className={styles.iconCircle}>
                            <Tool size={32} />
                        </div>
                    </div>

                    <div className={styles.badge}>
                        <span className={styles.liveDot} />
                        <span>{t("Scheduled Maintenance")}</span>
                    </div>

                    <h1 className={styles.title}>
                        {t("We're Currently Under Maintenance")}
                    </h1>

                    <p className={styles.description}>
                        {t("We are currently performing routine upgrades to improve your experience. We will be right back soon!")}
                    </p>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoBox}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} color="#64748B" />
                                <span className={styles.infoLabel}>{t("Estimated Time")}</span>
                            </div>
                            <span className={styles.infoValue}>{t("1 Hour")}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield size={14} color="#16A34A" />
                                <span className={styles.infoLabel}>{t("Security & Funds")}</span>
                            </div>
                            <span className={styles.infoValue} style={{ color: '#16A34A' }}>{t("100% Safe & Secure")}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className={`${styles.refreshButton} ${isRefreshing ? styles.refreshButtonSpinning : ""}`}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={18} />
                            <span>{isRefreshing ? t("Checking status...") : t("Check Again")}</span>
                        </button>
                    </div>

                    <div className={styles.footerNote}>
                        <span>{t("Thank you for your patience.")}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MaintenancePage
