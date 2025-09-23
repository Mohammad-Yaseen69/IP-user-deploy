import React, { useContext, useEffect, useState } from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import useWindowWidth from '../../../utils/useWindowWidth'
import styles from "./styles/prevmodal.module.scss"
import { Search } from 'react-feather'
import { UserContext } from '../../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { IoScan } from 'react-icons/io5'
import { BsQrCode } from 'react-icons/bs'
import { useTranslation } from 'react-i18next'

const PrevModal = ({ isOpen, toggle }) => {
    const [esims, setEsims] = useState([])
    const [filteredEsims, setFilteredEsims] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const width = useWindowWidth()
    const { authHeader, userDetails } = useContext(UserContext)
    const [qrModalContent, setQrModalContent] = useState({
        show: false,
        url: ""
    })
    const fetchEsims = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_IP_DEV_API}/api/user/esims/${userDetails._id}?skip=0&limit=1111111111110`,
                { headers: authHeader }
            )
            const data = decryptData(response.data.data)
            setEsims(data?.data?.esims)
            setFilteredEsims(data?.data?.esims)
        } catch (error) {
            console.log(decryptData(error?.response?.data?.data))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchEsims()
        }
    }, [isOpen])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)

        const filtered = esims.filter(esim =>
            esim.productName.toLowerCase().includes(term) ||
            esim.productDesc.toLowerCase().includes(term) ||
            esim.operator.toLowerCase().includes(term)
        )
        setFilteredEsims(filtered)
    }

    const { t } = useTranslation()


    return (
        <Modal style={{ minWidth: width > 1000 && "900px" }} isOpen={isOpen} toggle={toggle} className="prevModal" centered>
            <ModalHeader toggle={toggle}>
                {t("Previously purchases sSim")}
            </ModalHeader>

            <ModalBody>
                <div className={styles.modal}>                    <div className={styles.search}>
                    <Search size={16} className={styles.svg} />
                    <input
                        placeholder='Search for Esim'
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                    <div className={styles.wrapper}>
                        {isLoading ? (
                            <p>{t("Loading eSIMs")}...</p>
                        ) : filteredEsims?.length > 0 ? (
                            filteredEsims?.map((esim) => (
                                <div key={esim._id} className={styles.card}>
                                    <div style={{ justifyContent: "space-between", alignSelf: "stretch" }} className={styles.left}>
                                        <div>
                                            <h3>{esim.productName}</h3>
                                            <h6>{t("Description")}:</h6>
                                            <p>{esim.productDesc}</p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                            <button>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                    <path d="M5.62231 2.44922H9.18993M2.05469 4.23303H12.7576M11.5683 4.23303L11.1514 10.4878C11.0888 11.4263 11.0575 11.8955 10.8548 12.2513C10.6764 12.5645 10.4072 12.8163 10.0828 12.9735C9.71435 13.1521 9.2441 13.1521 8.30358 13.1521H6.50866C5.56814 13.1521 5.09789 13.1521 4.72941 12.9735C4.40501 12.8163 4.13585 12.5645 3.95741 12.2513C3.75472 11.8955 3.72344 11.4263 3.66088 10.4878L3.24389 4.23303M6.21691 6.90875V9.88176M8.59533 6.90875V9.88176" stroke="#FB3748" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                {t("Remove")}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setQrModalContent({
                                                        show: true,
                                                        url: esim.qrCode?.url
                                                    })
                                                }}
                                                style={{ color: "#5926f0" }}
                                            >
                                                <BsQrCode />
                                                {t("Click to Preview Qr Code")}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.right}>
                                        <div className={styles.card}>
                                            <span>{t("Price")}</span>
                                            <p>{esim.currency} {esim.price}</p>
                                        </div>
                                        <div className={styles.card}>
                                            <span>{t("Operator")}</span>
                                            <p>{esim.operator}</p>
                                        </div>
                                        <div className={styles.card}>
                                            <span>{t("Validity")}</span>
                                            <p>{esim.validity}</p>
                                        </div>
                                        <div className={styles.card}>
                                            <span>{t("Availability")}</span>
                                            <p>{esim.availability}</p>
                                        </div>
                                        <div style={{ gridColumn: "span 2" }} className={styles.card}>
                                            <span>{t("Lpa")}</span>
                                            <p>{esim.lpa}</p>
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>{t("No eSIMs found")}</p>
                        )}
                    </div>
                </div>


                <Modal toggle={() => setQrModalContent({ show: false, url: "" })} isOpen={qrModalContent.show}>
                    <ModalHeader toggle={() => setQrModalContent({ show: false, url: "" })}>
                        {t("Your Esim QR Code")}
                    </ModalHeader>
                    <ModalBody>
                        {qrModalContent.show && (
                            <div >
                                <div style={{ display: 'flex', justifyContent: "center" }}>
                                    <img src={qrModalContent.url} alt="" />                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div style={{ display: 'flex', alignItems: "center", gap: '8px' }}>
                            <a download={qrModalContent.url} href={qrModalContent.url} >
                                <button style={{ border: 'none', fontWeight: 600, color: "white", borderRadius: "6px", padding: "7px 15px", background: "#5926f0" }}>{t("Download QR Code")}</button>
                            </a>
                        </div>
                    </ModalFooter>

                </Modal>
            </ModalBody>
        </Modal>
    )
}

export default PrevModal
