import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from 'swiper'
import i_1 from "./files/pa_1.png"
import i_2 from "./files/pa_2.png"
import i_3 from "./files/pa_3.png"
import i_4 from "./files/pa_4.png"
import { useTranslation } from 'react-i18next'

const InstructionsModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} toggle={toggle} style={{ minWidth: window.innerWidth > 1500 ? "60vw" : "75vw", }}>
      <ModalHeader toggle={toggle}>{("My Payment Address")}</ModalHeader>
      <ModalBody style={{ containerType: "inline-size", display: "flex", gap: "1rem", padding: "24px 24px 24px 24px" }}>
        <div style={{ maxHeight: "620px", overflowY: "auto" }}>
          <p style={{ marginBottom: "1.5rem", color: "#5926f0", fontWeight: 700, fontSize: "min(3.5cqi, 26px)" }}>{t("Maximize Your Social Media Earnings with Your InstaPay Payment Address")}</p>
          <p style={{ marginBottom: "1.25rem", fontWeight: "700", color: "black", fontSize: "min(2.5cqi, 20px)" }}>{t("Make It Effortless for Your Audience to Support You:")}</p>
          <ul style={{ marginBottom: "1.5rem" }}>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Easily integrate your InstaPay Payment Address into your social media posts.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Easily copy and paste your payment address link into each of your posts, stories, or prominently on your profile.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Ideal for influencers, artists, entrepreneurs, or anyone with a community eager to show their support.")}</li>
          </ul>

          <p style={{ marginBottom: "1.25rem", fontWeight: "700", color: "black", fontSize: "min(2.5cqi, 20px)" }} >{t("Instant Support, Endless Possibilities:")}</p>
          <ul style={{ marginBottom: "1.5rem" }} >
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Transform the way you monetize your social media content.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Allow your followers to send you funds instantly with just a click, directly from their favorite social networks.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Ideal for real-time support during live streams, as a tipping system for your creative content, or for funding your next big \nproject.")}</li>
          </ul>

          <p style={{ marginBottom: "1.25rem", fontWeight: "700", color: "black", fontSize: "min(2.5cqi, 20px)" }} >{t("Where to Place Your InstaPay Payment Address for Maximum Impact:")}</p>
          <ul style={{ marginBottom: "1.5rem" }} >
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Social Media Profiles: Pin it to your bio or about section for constant visibility.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Posts & Announcements: Incorporate it into your individual posts, particularly those highlighting your work or specific \ncalls for support.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Stories & Reels: Integrate it into your interactive stories or captivating reels to capture instant contributions.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Live Streams: Share it during your LIVE sessions, making it easy for viewers to contribute in real-time.")}</li>
          </ul>

          <p style={{ marginBottom: "1.25rem", fontWeight: "700", color: "black", fontSize: "min(2.5cqi, 20px)" }} >{t("Simple, Fast, and Secure:")}</p>
          <ul style={{ marginBottom: "1.5rem" }} >
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("No complex setup – get started in moments.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Enjoy the security and speed of InstaPay's trusted payment processing.")}</li>
            <li style={{ listStyleType: "disc", marginLeft: "1rem", fontSize: "min(1.7cqi, 11px)", color: "#585858", marginBottom: ".7cqi", fontWeight: 500 }}>{t("Receive payments from anyone, anywhere, without them needing an InstaPay account.")}</li>
          </ul>

          <p style={{ marginBottom: "1.25rem", fontWeight: "700", color: "black", fontSize: "min(2.5cqi, 20px)" }} >{t("Elevate Your Social Media Game with InstaPay Payment Address")}</p>
        </div>
        {
          window.innerWidth > 1000
          &&
          <Swiper loop={true} autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }} modules={[Autoplay]} style={{ width: "30%", minWidth: "350px", objectFit: "contain", height: "100%", overflow: "hidden", borderRadius: "20px", maxHeight: "620px" }}>
            <SwiperSlide>
              <img src={i_1} alt="." style={{ width: "100%", objectFit: "cover" }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={i_2} alt="." style={{ width: "100%", objectFit: "cover" }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={i_3} alt="." style={{ width: "100%", objectFit: "cover" }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={i_4} alt="." style={{ width: "100%", objectFit: "cover" }} />
            </SwiperSlide>
          </Swiper>
        }

      </ModalBody>
    </Modal>
  )
}

export default InstructionsModal