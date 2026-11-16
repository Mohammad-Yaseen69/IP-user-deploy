import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import img from "./chips_in_left.png";
import img_2 from "./qr_2.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import { useTranslation } from "react-i18next";

const InstructionsModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      style={{ minWidth: window.innerWidth > 1500 ? "60vw" : "75vw" }}
    >
      <ModalHeader toggle={toggle}>{t("My QR Code Sticker")}</ModalHeader>
      <ModalBody
        style={{
          containerType: "inline-size",
          display: "flex",
          gap: "1rem",
          padding: "24px 24px 24px 24px",
        }}
      >
        <div>
          <p
            style={{
              marginBottom: "1.5rem",
              color: "#5926f0",
              fontWeight: 700,
              fontSize: "min(3.5cqi, 26px)",
            }}
          >
            {t("Unlock Seamless Transactions with InstaPay QR Code Sticker")}
          </p>
          <p
            style={{
              marginBottom: ".75rem",
              fontWeight: "700",
              color: "black",
              fontSize: "min(2.5cqi, 20px)",
            }}
          >
            {t("Effortless and Swift:")}
          </p>
          <ul style={{ marginBottom: "1.25rem" }}>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Instantly download your unique InstaPay QR code sticker.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t(
                "Experience hassle-free, cashless payments without needing complex infrastructure like \npayment terminals.",
              )}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t(
                "Swiftly collect payments – no more tedious entry of credit card or phone numbers.",
              )}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Each payment includes customer information for your convenience.")}
            </li>
          </ul>

          <p
            style={{
              marginBottom: ".75rem",
              fontWeight: "700",
              color: "black",
              fontSize: "min(2.5cqi, 20px)",
            }}
          >
            {t("Economically Smart:")}
          </p>
          <ul style={{ marginBottom: "1.25rem" }}>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Zero activation fees – start immediately without upfront costs.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Forget about fixed monthly charges; pay as you transact.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Ditch the hardware; no terminal costs mean more savings for you.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Enjoy low transaction fees at just 0.75% per QR code payment.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("We don't impose minimum commissions; you save more with each transaction.")}
            </li>
            <li
              style={{
                listStyleType: "disc",
                marginLeft: "1rem",
                fontSize: "min(1.7cqi, 15px)",
                color: "#585858",
                marginBottom: ".7cqi",
                fontWeight: 500,
              }}
            >
              {t("Experience the joy of instant payments, enhancing your cash flow.")}
            </li>
          </ul>

          <p
            style={{
              marginBottom: ".75rem",
              fontWeight: "700",
              color: "black",
              fontSize: "min(2.5cqi, 20px)",
            }}
          >
            {t("Make Every Transaction Count with InstaPay")}
          </p>
        </div>
        {window.innerWidth > 1000 && (
          <Swiper
            loop={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            style={{
              width: "40%",
              minWidth: "400px",
              objectFit: "contain",
              height: "100%",
              overflow: "hidden",
              aspectRatio: "870/1140",
              borderRadius: "20px",
            }}
          >
            <SwiperSlide>
              <img
                src={img}
                alt="."
                loading="lazy"
                style={{ width: "100%", objectFit: "contain" }}
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={img_2}
                alt="."
                loading="lazy"
                style={{ width: "100%", objectFit: "contain" }}
              />
            </SwiperSlide>
          </Swiper>
        )}
      </ModalBody>
    </Modal>
  );
};

export default InstructionsModal;
