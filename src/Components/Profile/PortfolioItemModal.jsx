import React, { useCallback, useState, useRef } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/PortfolioItem.module.css"
import file_img from "../Portfolio/files/file.png"
import ReactJWPlayer from "react-jw-player"
import pdfPl from "../Portfolio/files/pdf.jpeg"
import docPl from "../Portfolio/files/doc.jpeg"
import { useTranslation } from 'react-i18next'

const PortfolioItemModal = ({ showModal, setShowModal, item }) => {
    const { t } = useTranslation()
    const [isFullscreen, setIsFullscreen] = useState(false)
    // When user tries to close modal (X or outside click), block it if in fullscreen
    const safeToggle = useCallback(() => {
        if (!isFullscreen) setShowModal(!showModal)
    }, [setShowModal, showModal, isFullscreen])
    // ReactJWPlayer's onFullscreen event
    const handleJWFullscreen = (e) => {
        // e.fullscreen === true/false
        setIsFullscreen(e.fullscreen)
    }
    return (
        <Modal isOpen={showModal} toggle={safeToggle} contentClassName={styles.content_modal} className={styles.content_modal} backdrop={isFullscreen ? 'static' : true} keyboard={!isFullscreen}>
            <ModalHeader toggle={safeToggle}>
                {item?.title}
            </ModalHeader>
            <ModalBody>
                <div className={styles.modal_content}>
                    {
                        item?.file_type?.includes("image")
                            ?
                            <img src={item?.document_details?.url} />
                            :
                            item?.file_type?.includes("video")
                                ?
                                <div
                                    className={`jw-video-container`}
                                    data-mediaid={item?.jw_media?.mediaId}
                                    style={{ aspectRatio: "16/9" }}
                                >
                                    <ReactJWPlayer
                                        playerId={import.meta.env.VITE_JW_PLAYER_ID}
                                        playerScript={import.meta.env.VITE_JW_PLAYER_URL}
                                        controls={true}
                                        playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                                        onFullscreen={handleJWFullscreen}
                                    />
                                </div>
                                :
                                item?.file_type?.includes("audio")
                                    ?
                                    <div
                                        className={`jw-video-container`}
                                        data-mediaid={item?.jw_media?.mediaId}
                                        style={{ aspectRatio: "16/9" }}
                                    >
                                        <ReactJWPlayer
                                            playerId={import.meta.env.VITE_JW_PLAYER_ID}
                                            playerScript={import.meta.env.VITE_JW_PLAYER_URL}
                                            controls={true}
                                            playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                                            onFullscreen={handleJWFullscreen}

                                        />
                                    </div>
                                    :
                                    item?.file_type?.includes("pdf")
                                        ?
                                        <img src={pdfPl} alt="img" style={{ background: "black", objectFit: "contain", height: "350px", borderRadius: "12px" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                        :
                                        item?.file_type?.includes("doc")
                                            ?
                                            <img src={docPl} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                            :
                                            <img src={file_img} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                    }
                    <div>
                        <p>{item?.description}</p>
                        {
                            item?.document_details?.url && (
                                <a
                                    href={item?.document_details?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    style={{
                                        display: "inline-block",
                                        marginTop: "8px",
                                        fontSize: "0.9rem",
                                        padding: "6px 10px",
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "6px",
                                        background: "#fff",
                                        color: "#5926F0",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    {t("Download")}
                                </a>
                            )
                        }
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PortfolioItemModal