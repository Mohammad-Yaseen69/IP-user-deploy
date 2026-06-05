import React from 'react'
import styles from "./styles/IBAN.module.css"
// React Feather Icons import karein
import { Shield, Clock, Globe } from 'react-feather'

const IBAN = () => {
    return (
        <div className={styles.container}>
            {/* Top Hero Section */}
            <div className={styles.heroSection}>
                <h1 className={styles.heading}>
                    Get a dedicated IBAN <br /> in your name.
                </h1>
                <p className={styles.description}>
                    Receive salary, refunds and SEPA transfers directly to a personal IBAN. 
                    Funds settle to your InstaPay wallet within seconds and are safeguarded by our partner bank.
                </p>

                {/* Info Stats (Onboarding / Delivery) */}
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>~2 min</span>
                        <span className={styles.statLabel}>Average onboarding</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>SEPA + SWIFT</span>
                        <span className={styles.statLabel}>Receive worldwide</span>
                    </div>
                </div>

                {/* Primary Action Button */}
                <button className={styles.actionBtn}>
                    Open virtual bank account <span>→</span>
                </button>
            </div>

            {/* Bottom Features Grid (Funds Safeguarded etc.) */}
            <div className={styles.featuresGrid}>
                
                {/* Card 1: Funds Safeguarded */}
                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
                        <Shield size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>Funds safeguarded</h3>
                    <p className={styles.cardDescription}>
                        Held with a regulated tier-1 partner bank. Not lent or invested.
                    </p>
                </div>

                {/* Card 2: Verification Time */}
                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
                        <Clock size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>Instant verification</h3>
                    <p className={styles.cardDescription}>
                        Most accounts are verified automatically within a few minutes.
                    </p>
                </div>

                {/* Card 3: Global Coverage */}
                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
                        <Globe size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>Global coverage</h3>
                    <p className={styles.cardDescription}>
                        Access your money globally with multi-currency support and seamless tracking.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default IBAN