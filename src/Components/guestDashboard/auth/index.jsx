import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InstapayLogo from "../../../assets/images/logo/logo.webp";
import InstapayLogo2 from "../../../assets/images/logo/logo2.webp";
import useCountryLocation from "../../../hooks/GeneralUse/useCountryLocation";
import LanguagePicker from "../../LanguagePicker";
import rightImage from "../files/image.png";
import { FlagSvg } from "../files/svg";
import styles from "../styles/authStyle.module.css";
import AuthStepOne from "../../Auth/agentAuth/AuthStepOne";
import AuthStepTwo from "./AuthStepTwo";
const Index = () => {
  const { t } = useTranslation();
  const isEmail = true;
  const [email, setEmail] = useState("");
  const { country } = useCountryLocation();
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setStep(2);
  };
  return (
    <div className={styles.container}>
      <div className={styles.child1}>
        <img src={rightImage} width={"100%"} height={"100%"} loading="lazy" alt="" />
      </div>
      <div className={styles.child2}>
        {step === 1 ? (
          <AuthStepOne
            isEmail={isEmail}
            email={email}
            setEmail={setEmail}
            country={country}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            t={t}
            InstapayLogo={InstapayLogo}
          />
        ) : (
          <AuthStepTwo
            isEmail={isEmail}
            email={email}
            setEmail={setEmail}
            country={country}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            t={t}
            InstapayLogo={InstapayLogo2}
          />
        )}

        <div className={styles.footer}>
          <LanguagePicker />
          <span>
            {t("© 2024 Instapay.")}
            {t("All rights reserved.")}
          </span>
          <span>
            <FlagSvg /> {t("A Swiss  Company")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
