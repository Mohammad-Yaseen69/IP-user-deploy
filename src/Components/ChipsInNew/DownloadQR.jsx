import { Modal, ModalBody } from 'reactstrap'
import styles from "./styles/DownloadModal.module.css"
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import sticker from "./files/qr.svg"
import poster from "./files/poster.svg"
import download from "./download.svg"
import { Link } from 'react-router-dom'
import QrPoster from '../DownloadQrPage/QrPoster'

const DownloadQR = ({ isOpen, toggle, qrCode, wallet }) => {
    const { t } = useTranslation()
    const [active, setActive] = useState("sticker")
    return (
        <Modal isOpen={isOpen} toggle={toggle} className={styles.modal}>
            <ModalBody className={styles.container} style={{
                padding: 0
            }}>
                <div className={styles.left}>
                    <h2>{t("Download your QR Code")}</h2>
                    <p>{t("Share your QR Code or pay link to instantly get paid in your insta wallet.")}</p>

                    <div className={styles.buttons}>
                        <button onClick={() => setActive("sticker")} className={active === "sticker" ? styles.active : ""}>
                            <img src={sticker} alt="" />
                            <span>{t("Your QR Code")}</span>
                        </button>
                        <button onClick={() => setActive("poster")} className={active === "poster" ? styles.active : ""}>
                            <img src={poster} alt="" />
                            <span>{t("Your QR Code Poster")}</span>
                        </button>
                    </div>

                    <a href={active === "sticker" ? qrCode : `/download-qr-poster/${wallet?.wallet_id}`} download={active === "sticker"} target='_blank'
                    style={{ width: "100%", display: "flex", justifyContent: "center" }}
                    >
                        <button className={styles.button}>
                            <img src={download} alt="" />
                            <span>Download</span>
                        </button>
                    </a>
                </div>
                {
                    window.innerWidth > 1000
                    &&
                    <div className={styles.right}>
                        {
                            active === "sticker"
                                ?
                                <div className={styles.sticker_con}>
                                    <img src={qrCode} alt="" />
                                </div>
                                :
                                <QrPoster
                                    wallet={wallet}
                                />
                        }
                    </div>
                }
            </ModalBody>
        </Modal>

    )
}

export default DownloadQR