import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/PortfolioItem.module.css"
import file_img from "../Portfolio/files/file.png"
import ReactJWPlayer from "react-jw-player"
import pdfPl from "../Portfolio/files/pdf.jpeg"
import docPl from "../Portfolio/files/doc.jpeg"

const PortfolioItemModal = ({ showModal, setShowModal, item }) => {
    return (
        <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)} contentClassName={styles.content_modal} className={styles.content_modal}>
            <ModalHeader toggle={() => setShowModal(!showModal)}>
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
                                        playerId={process.env.REACT_APP_JW_PLAYER_ID}
                                        playerScript={process.env.REACT_APP_JW_PLAYER_URL}
                                        controls={true}
                                        playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
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
                                            playerId={process.env.REACT_APP_JW_PLAYER_ID}
                                            playerScript={process.env.REACT_APP_JW_PLAYER_URL}
                                            controls={true}
                                            playlist={`https://cdn.jwplayer.com/v2/media/${item?.jw_media?.mediaId}`}
                                        />
                                    </div>
                                    :
                                    item?.file_type?.includes("pdf")
                                        ?
                                        <img src={pdfPl} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                        :
                                        item?.file_type?.includes("doc")
                                            ?
                                            <img src={docPl} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                                            :
                                            <img src={file_img} alt="img" style={{ background: "black", objectFit: "contain" }} onClick={() => window.open(item?.document_details?.url, "_blank")} />
                    }
                    <div>
                        <p>{item?.description}</p>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PortfolioItemModal