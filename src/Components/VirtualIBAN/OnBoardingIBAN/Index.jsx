import { useContext } from 'react'
import { ArrowRight, Clock, EyeOff, Shield } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { UserContext } from '../../../Context/UserContext'
import { usePermission } from '../../../hooks/GeneralUse/usePermission'
import imageCard from "../files/images/Frame_2147236087.png"
import styles from "./style/OnboardingIban.module.css"
import TopRight from '../../topRight'
import useWindowWidth from '../../../utils/useWindowWidth'

const OnboardingIBAN = ({ onCreated }) => {
    const { t } = useTranslation()
    const can = usePermission()
    const width = useWindowWidth();

    const navigate = useNavigate()
    const canCreateIban = can("virtual-iban.account.create")
    const { userDetails, userWallets } = useContext(UserContext)



    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>
                        {t("Business IBAN")}
                    </h1>
                    <p>{t("Activate a dedicated business account to receive and hold company funds.")}</p>
                </div>

                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>
            <div className={styles.mainContent}>

                <div className={styles.leftSection}>
                    <p className={styles.subHeading}>{t("NEW · BUSINESS IBAN")}</p>
                    <h1 className={styles.heading}>
                        {t("Get a dedicated business IBAN")} <br /> {t("for your company.")}

                    </h1>
                    <p className={styles.description}>
                        {t("Submit your request to activate Business IBAN services. Our onboarding  team will review your business profile, confirm eligibility, and send  you your personalized activation pack with the applicable terms and next steps.")}
                    </p>

                    <div className={styles.buttoncont}>
                        {canCreateIban && (
                            <button className={styles.buttonGroup1} >
                                {t("Request IBAN Activation")} <ArrowRight />
                            </button>
                        )}
                        <div className={styles.buttonGroup}>

                            <h5>{t("SEPA + SWIFT")}</h5>
                            <p>{t("Send and receive worldwide")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <img src={imageCard} alt="" />
                </div>

            </div>
      


        </div>
    )
}

export default OnboardingIBAN