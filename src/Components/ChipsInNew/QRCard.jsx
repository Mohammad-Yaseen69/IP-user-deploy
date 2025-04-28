import { Card, CardBody } from "reactstrap";
// import QRCode from "qrcode.react"
import share from "../PaymentsNewer/files/PaymentsNewFiles/share.png"
// import { Download, Share } from "react-feather";
import download from "./download_b.svg"
import styles from "./styles/QRCard.module.scss"
import qrImg from "./img.jpeg"
import { useState } from "react";
import SocialModal from "../ShareBtn/SocialModal";

const QRCard = ({ item }) => {
    const [isShareModal, setIsShareModal] = useState(false)
    const toggleShareModal = () => setIsShareModal(!isShareModal);
    return (
        <Card className={styles.container}>
            <CardBody className={styles.body}>
                <div className={styles.left}>

                    <div className={styles.qr__container}>
                        <img src={item?.qrCode?.url} alt={item?.currency?.code} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div className={styles.details}>
                        <span>{item?.currency?.code} </span>
                        <h5>{item?.qrCode?.title}</h5>
                        <p>{item?.qrCode?.description}</p>
                    </div>
                </div>
                <div className={styles.actions}>
                    <div className={`${styles.action} ${styles.share}`} onClick={toggleShareModal}>
                        <img src={share} alt="s" style={{ height: "13px", width: "14px", objectFit: "contain" }} />
                    </div>
                    <a href={item?.qrCode?.url} target="_blank" download={true}>
                        <div className={`${styles.action} ${styles.download}`}>
                            <img src={download} alt="s" style={{ height: "14px", width: "14px", objectFit: "contain" }} />
                        </div>
                    </a>
                </div>

                <SocialModal isOpen={isShareModal} link={item?.wallet_id} toggle={toggleShareModal} />
            </CardBody>
        </Card>
    )
}

export default QRCard;