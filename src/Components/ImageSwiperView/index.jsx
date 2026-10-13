import React, { useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { Download } from "react-feather";
import { useTranslation } from "react-i18next";

const imgTypes = ["jpeg", "jpg", "png", "webp", "svg", "gif"];
const vidTypes = ["mp4", "avi", "3gp"];

const ImageSwiperView = ({ isOpen, toggle, images = [] }) => {
  const { t } = useTranslation();
  const swiperRef = useRef(null);
  const [current, setCurrent] = useState(0);
  return (
    <Modal isOpen={isOpen}>
      <ModalHeader toggle={toggle}>{t("Attachments")}</ModalHeader>
      <ModalBody style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
          {images.length > 1 &&
            images.map((item, ind) => (
              <img
                onClick={() => {
                  setCurrent(ind);
                  swiperRef?.current?.swiper?.slideTo(ind);
                }}
                key={ind}
                src={
                  imgTypes.some((it) => item?.key?.endsWith(it))
                    ? item?.url
                    : "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg"
                }
                alt={"image"}
                style={{
                  height: "100px",
                  width: "100px",
                  objectFit: "cover",
                  borderRadius: ".7rem",
                  cursor: "pointer",
                  border: current === ind ? "2px solid black" : "none",
                }}
              />
            ))}
        </div>
        <Swiper
          navigation={true}
          modules={[Navigation]}
          className="mySwiper"
          slidesPerView={1}
          ref={swiperRef}
          style={{
            minWidth: "280px",
            maxWidth: "100%",
          }}
          onSlideChange={(e) => setCurrent(e.activeIndex)}
        >
          {images.map((item) => (
            <SwiperSlide key={item?.key}>
              {imgTypes.some((it) => item?.key?.endsWith(it)) ? (
                <img
                  src={item?.url}
                  alt={"image"}
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    height: "90vh",
                    maxHeight: "600px",
                    objectFit: "contain",
                  }}
                />
              ) : vidTypes.some((it) => item?.key?.endsWith(it)) ? (
                <video
                  src={item?.url}
                  alt={"image"}
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    height: "90vh",
                    maxHeight: "600px",
                    objectFit: "contain",
                  }}
                  controls={true}
                />
              ) : (
                <img
                  src={
                    "https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/file.jpg"
                  }
                  alt={"image"}
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    height: "90vh",
                    maxHeight: "600px",
                    objectFit: "contain",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: ".5rem",
                  background: "#5926f0",
                  cursor: "pointer",
                  zIndex: 100,
                  padding: ".8rem 1rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "700",
                  gap: "1rem",
                }}
                onClick={() => window.open(item?.url, "_blank")}
              >
                <Download color="white" />
                {t("Download")}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </ModalBody>
    </Modal>
  );
};

export default ImageSwiperView;
