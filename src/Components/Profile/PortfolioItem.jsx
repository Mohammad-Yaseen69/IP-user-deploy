import React, { useState } from "react";
import styles from "./styles/PortfolioItem.module.css";
import file_img from "../Portfolio/files/file.png";
import PortfolioItemModal from "./PortfolioItemModal";
import { Play } from "react-feather";
import audioPl from "../Portfolio/files/audio.jpeg";
import pdfPl from "../Portfolio/files/pdf.jpeg";
import docPl from "../Portfolio/files/doc.jpeg";

const PortfolioItem = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.item} onClick={() => setShowModal(!showModal)}>
      {item?.file_type?.includes("image") ? (
        <img src={item?.document_details?.url} className={styles.item_img} />
      ) : item?.file_type?.includes("video") ? (
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              backgroundColor: "rgba(0,0,0,0.2)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play color="white" size={40} />
          </div>
          {item?.jw_media?.thumbnail_url?.endsWith("mp4") ? (
            <video
              src={item?.jw_media?.thumbnail_url}
              className={styles.item_img}
            ></video>
          ) : (
            <img
              src={item?.jw_media?.thumbnail_url}
              alt=""
              className={styles.item_img}
            />
          )}
        </div>
      ) : item?.file_type?.includes("audio") ? (
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              backgroundColor: "rgba(0,0,0,0.2)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play color="white" size={40} />
          </div>
          <img src={audioPl} alt="img" className={styles.item_img} />
        </div>
      ) : item?.file_type?.includes("pdf") ? (
        <img src={pdfPl} alt="img" className={styles.item_img} />
      ) : item?.file_type?.includes("doc") ? (
        <img src={docPl} alt="img" className={styles.item_img} />
      ) : (
        <img src={file_img} alt="img" className={styles.item_img} />
      )}
      <div className={styles.details}>
        <h4>{item?.title}</h4>
        <p>
          {item?.description?.length > 40
            ? item?.description?.slice(0, 80) + "..."
            : item?.description}
        </p>
      </div>
      <PortfolioItemModal
        item={item}
        setShowModal={setShowModal}
        showModal={showModal}
      />
    </div>
  );
};

export default PortfolioItem;
