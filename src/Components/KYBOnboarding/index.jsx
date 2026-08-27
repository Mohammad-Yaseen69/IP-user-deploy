import { useTranslation } from "react-i18next";
import style from "./style/index.module.css";
import logo2 from "../../assets/images/logo/logo2.webp"
const Index = () => {
    const { t } = useTranslation()
    return (
        <div className={style.container}>
            <div className={style.card}>
                <div className={style.header}>
                    <div className={style.logo}>
                        <img src={logo2} alt="" />
                        <h3> <span>{t("BUSINESS")}</span></h3>
                    </div>

                    <span className={style.partner}>{t("CONFIDENTIAL")}</span>
                </div>

                <div className={style.infoRow}>
                    <div className={style.infoBox}>
                        <span>{t("PREPARED FOR")}</span>
                    </div>

                    <div className={style.infoBox}>
                        <span>{t('BUSINESS / WALK-IN')}</span>
                    </div>

                    <div className={style.infoBoxSmall}>
                        <span>{t("DATE ISSUED")}</span>
                    </div>
                </div>

                <div className={style.notice}>
                    <strong>● {t("Confidential client onboarding document.")}</strong>
                    <p>
                        {t("To be completed by the client and returned to InstaPay / Kemit Kingdom · K2 SA through the approved secure channel. Do not submit sensitive documents by email unless the secure channel is unavailable.")}
                    </p>
                </div>

                <div className={style.content}>
                    <h1>
                        {t("Business")}
                        <br />
                        {t("Client")}
                        <br />
                        {t("Onboarding")}
                    </h1>

                    <h4>{t("KYC / KYB - Business IBAN Activation")}</h4>

                    <p>
                        {t("Business IBAN / IBAN Activation, payment services and compliance review. Please complete each section and return this form to InstaPay through the approved secure channel.")}
                    </p>
                </div>

            </div>
            <div className={style.footer}>
                <span>{t("www.instapay.biz | Karrri Kingdom SA - Switzerland")}</span>
            </div>
        </div>
    );
};

export default Index;