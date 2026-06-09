import { ArrowRight, Clock, EyeOff, Globe, Shield } from 'react-feather'
import styles from "../styles/IBAN.module.css"
import VirtualIbanModal from '../VirtualIbanModal'
import { useState } from 'react'
import imageCard from "../files/images/Frame_2147236087.png"
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
                    </p>

                    <div className={styles.buttonGroup}>

                        <h5>SEPA + SWIFT</h5>
                        <p>Receive worldwide</p>
                    </div>
                    <button onClick={handleOpenModal} className={styles.buttonGroup1} >
                        Open virtual bank account <ArrowRight />
                    </button>
                </div>

                <div className={styles.rightSection}>
                    <img src={imageCard} alt="" />
                </div>

            </div>
            <div className={styles.featuresGrid}>

                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
                        <Shield size={20} fill='#5926F033' />
                    </div>
                    <h3 className={styles.cardTitle}>Funds safeguarded</h3>
                    <p className={styles.cardDescription}>
                        Held with a regulated tier-1 partner bank. Not lent or invested.                    </p>
                </div>

                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
                        <Clock size={20} fill='#5926F033' />
                    </div>
                    <h3 className={styles.cardTitle}>Verified in minutes</h3>
                    <p className={styles.cardDescription}>
                        Most accounts are issued the same day. Confirm proof of address                    </p>
                </div>

                <div className={styles.featureCard}>
                    <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
                        <EyeOff size={20} fill='#5926F033' />
                    </div>
                    <h3 className={styles.cardTitle}>No hidden fees</h3>
                    <p className={styles.cardDescription}>
                        Free to receive in EUR. SWIFT and FX are priced upfront.                    </p>
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
