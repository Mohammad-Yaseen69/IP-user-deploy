import React, { useState } from 'react'
import styles from "./styles/PortfolioItem.module.css"
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import file_img from "../Portfolio/files/file.png"

const PortfolioItem = ({ item }) => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div className={styles.item} onClick={() => setShowModal(!showModal)}>
            {
                item?.file_type === "image"
                &&
                <img src={item?.document_details?.url} className={styles.item_img} />
            }
            {
                item?.file_type === "video"
                &&
                <video src={item?.document_details?.url} className={styles.item_img} />
            }
            {
                item?.file_type !== "video" && item?.file_type !== "image"
                    ?
                    <img src={file_img} alt="img" style={{ background: "black" }} />
                    :
                    ""
            }
            <div className={styles.details}>
                <h4>{item?.title}</h4>
                <p>{item?.description?.length > 40 ? item?.description?.slice(0, 40) + "..." : item?.description}</p>
            </div>
            <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)} style={{ minWidth: "700px" }}>
                <ModalHeader toggle={() => setShowModal(!showModal)}>
                    Item Details
                </ModalHeader>
                <ModalBody>
                    <div className={styles.modal_content}>
                        {
                            item?.file_type === "image"
                            &&
                            <img src={item?.document_details?.url} className={styles.item_img} />
                        }
                        {
                            item?.file_type === "video"
                            &&
                            <video src={item?.document_details?.url} className={styles.item_img} controls="true" />
                        }
                        {
                            item?.file_type !== "video" && item?.file_type !== "image"
                                ?
                                <img src={file_img} alt="img" style={{ background: "black" }} />
                                :
                                ""
                        }
                        <div>
                            <h4>{item?.title}</h4>
                            <p>{item?.description}</p>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default PortfolioItem