import { ArrowRight, Clock, Globe, Shield } from 'react-feather'
import styles from "../styles/IBAN.module.css"
import VirtualIbanModal from '../VirtualIbanModal'
import { useState } from 'react'

const IBAN = ({ onCreated }) => {
    const [showModal, setShowModal] = useState(false)

    const handleOpenModal = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>

                <div className={styles.leftSection}>
                    <p className={styles.subHeading}>My Virtual Account</p>
                    <h1 className={styles.heading}>
                        Get a dedicated IBAN <br /> in your name.
                    </h1>
                    <p className={styles.description}>
                        Manage your global payments easily with a unique virtual account.
                        Receive, hold, and convert multiple currencies in one place.
                    </p>

                    <div className={styles.buttonGroup}>
                        <div>
                            <h4>~2 min</h4>
                            <p>Average onboarding</p>
                        </div>
                        <div>
                            <h4>SEPA + SWIFT</h4>
                            <p>Receive worldwide</p>
                        </div>
                    </div>
                    <button onClick={handleOpenModal} className={styles.buttonGroup1} >
                        Open virtual bank account <ArrowRight />
                    </button>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.fade1} >
                        <div className={styles.fade2}>
                            <div className={styles.virtualCard}>
                                <div className={styles.cardHeader}>
                                    <span>Premium Account</span>
                                    <span className={styles.cardLogo}>InstaPay</span>
                                </div>
                                <div className={styles.cardBalance}>
                                    <p className={styles.balanceLabel}>Total Balance</p>
                                    <h2 className={styles.balanceAmount}>€53,180.00</h2>
                                </div>
                                <div className={styles.cardFooter}>
                                    <p className={styles.cardNumber}>•••• •••• •••• 8842</p>
                                    <p className={styles.cardExpiry}>05/30</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className={styles.featuresGrid}>

                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
                        <Shield size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>Funds safeguarded</h3>
                    <p className={styles.cardDescription}>
                        Held with a regulated tier-1 partner bank. Not lent or invested.
                    </p>
                </div>

                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
                        <Clock size={20} />
                    </div>
                    <h3 className={styles.cardTitle}>Instant verification</h3>
                    <p className={styles.cardDescription}>
                        Most accounts are verified automatically within a few minutes.
                    </p>
                </div>

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

            <VirtualIbanModal
                isOpen={showModal}
                toggle={handleCloseModal}
                onCreated={onCreated}
            />
        </div>
    )
}

export default IBAN
