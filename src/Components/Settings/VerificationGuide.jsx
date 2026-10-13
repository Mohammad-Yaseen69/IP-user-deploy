import styles from "./styles/VerificationGuide.module.css";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import PWizard from "../PaymentsNewer/PWizard";
import { Swiper, SwiperSlide } from "swiper/react";
import s1g1 from "./v_g_files/step1_g1.png";
import s1g2 from "./v_g_files/step1_g2.png";
import s2g1 from "./v_g_files/step2_g1.png";
import s2g2 from "./v_g_files/step2_g2.png";
import s3 from "./v_g_files/step3.png";
import s4 from "./v_g_files/step4.png";
import s5 from "./v_g_files/step5.png";
import s6g1 from "./v_g_files/step6_g1.png";
import s6g2 from "./v_g_files/step6_g2.png";
import { AlertTriangle, ChevronRight } from "react-feather";
import { Autoplay } from "swiper";
import { Link, useLocation, useNavigate } from "react-router-dom";

const vgData = [
  {
    head: "Select Your Preferred Language",
    desc: "Please select the language you would \nlike to use for the eKYC process.",
    images: [s1g1, s1g2],
  },
  {
    head: "Select Your Nationality",
    desc: "Choose your nationality to see the \nsupported ID documents for  your country.",
    images: [s2g1, s2g2],
  },
  {
    head: "Grant permission to use the camera.",
    desc: `Tap or click \"Allow\" when prompted to \ngrant permission for camera access to \ncapture the document.`,
    images: [s3],
  },
  {
    head: "Upload Your Documents from \nGallery/Photos",
    desc: "If you encounter issues with your camera \nor if your system doesn't have one, you can\n manually upload photos of the document \nfrom your local storage.",
    images: [s4],
  },
  {
    head: "Upload Your ID.",
    desc: "Make sure your ID is clear and not blurry to \nensure quick verification.",
    images: [s5],
  },
  {
    head: "Valid Proof of Address",
    list: "1. Ensure that your proof of address is \ncurrent and that the statement date is \nwithin the last three months from the \nstart date of your eKYC verification.\n\n2. Make sure your proof of address is clear \nand not blurry to ensure quick verification.",
    images: [s6g1, s6g2],
  },
];

export const GuideItem = ({ item, step, setStep, setShowGuide }) => {
  const { t } = useTranslation();
  return (
    <CardBody className={styles.container}>
      <div className={styles.left}>
        <div className={styles.top}>
          <h1>{t("E-KYC")}</h1>
          <h2>{t(item?.head)}</h2>
          {item?.desc && <p>{t(item?.desc)}</p>}
          {item?.list && (
            <ol>
              <li>{t(item?.list)?.split("\n\n")?.[0]}</li>
              <li>{t(item?.list)?.split("\n\n")?.[1]}</li>
            </ol>
          )}
        </div>
        <div className={styles.bottom}>
          <PWizard subStep={step} totalCount={6} />
          <Button
            className={styles.button}
            onClick={() => {
              setStep(step + 1);
            }}
          >
            {t("Next")}
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
      {window.innerWidth < 1000 ? (
        <div>
          <Swiper
            loop={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className={styles.right}
          >
            {item?.images?.map((it) => (
              <SwiperSlide className={styles.right_item}>
                <img src={it} key={item?.head} alt={item?.head} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <Swiper
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className={styles.right}
        >
          {item?.images?.map((it) => (
            <SwiperSlide className={styles.right_item}>
              <img src={it} key={item?.head} alt={item?.head} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </CardBody>
  );
};

const VerificationGuide = ({ setShowGuide }) => {
  const [step, setStep] = useState(1);
  const { t } = useTranslation();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ft = queryParams.get("ft");
  const navigate = useNavigate();

  const content = `Important Notice\n\nPlease carefully review all the steps in this guideline before proceeding with your eKYC verification.\n\nAvoid Common Mistakes:\n\n* Ensure all your documents are clear, legible, and up-to-date.\n* Double-check that the information you provide matches the details on your official documents.\n* Follow the instructions precisely to avoid delays or rejections.\n\nNote: \nIf your eKYC verification fails and you need to resubmit, you will be charged again for the resubmission process.\n\nBy following these guidelines, you can help ensure a smooth and successful eKYC verification.\n\nFor any questions or assistance, please contact our support team at support@insta-pay.ch `;

  return (
    <Card>
      {step === 1 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[0]} setStep={setStep} />
      )}
      {step === 2 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[1]} setStep={setStep} />
      )}
      {step === 3 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[2]} setStep={setStep} />
      )}
      {step === 4 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[3]} setStep={setStep} />
      )}
      {step === 5 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[4]} setStep={setStep} />
      )}
      {step === 6 && (
        <GuideItem setShowGuide={setShowGuide} step={step} item={vgData[5]} setStep={setStep} />
      )}

      {step === 7 && (
        <CardBody className={styles.last}>
          <h1>{t("E-KYC")}</h1>
          <h2>
            <AlertTriangle />
            <span>{t(content)?.split("\n\n")?.[0]}</span>
          </h2>

          <p>{t(content)?.split("\n\n")?.[1]}</p>

          <div className={styles.avoid}>
            <h2>{t(content)?.split("\n\n")?.[2]}</h2>
            <ul>
              <li>{t(content)?.split("\n\n")?.[3]?.split("\n")?.[0]?.replace("*", "")}</li>
              <li>{t(content)?.split("\n\n")?.[3]?.split("\n")?.[1]?.replace("*", "")}</li>
              <li>{t(content)?.split("\n\n")?.[3]?.split("\n")?.[2]?.replace("*", "")}</li>
            </ul>
          </div>

          <div className={styles.note}>
            <p>{t(content)?.split("\n\n")?.[4]}</p>
          </div>

          <p>{t(content)?.split("\n\n")?.[5]}</p>
          <p>
            {t(content)?.split("\n\n")?.[6].replace(" support@insta-pay.ch.", "")}{" "}
            <Link to={"mailto:support@insta-pay.ch"}>{t("support@insta-pay.ch")}</Link>
          </p>

          <div className={styles.buttons}>
            <button
              className={styles.t_button}
              onClick={() => {
                setShowGuide(false);
                if (ft) {
                  navigate("/settings?tab=withdrawal&ft=true");
                }
                sessionStorage.setItem("vg_play", true);
              }}
            >
              {t("skip")}
            </button>
            <Button
              className={styles.f_button}
              onClick={() => {
                setShowGuide(false);
                sessionStorage.setItem("vg_play", true);
              }}
            >
              {t("Start Verification")}
              <ChevronRight />
            </Button>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default VerificationGuide;
