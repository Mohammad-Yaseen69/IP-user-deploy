import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import cardStyles from "../PaymentsNewer/InternationalFlow/styles/creditcard.module.css"
import logo_w from "../../assets/images/logo/logo_white.png"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { current } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'


const ManageSaveCards = () => {
    const [cards, setCards] = useState()
    const { authHeader, userDetails } = useContext(UserContext)
    const {t} = useTranslation()
    const [isDeleting, setIsDeleting] = useState()
    const [deleteData, setDeleteData] = useState({
        show: false,
        current: {

        }
    })

    useEffect(() => {
        const getSavedCards = async () => {
            try {

                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                setCards(dec?.panList)

            } catch {
                setCards([])
            }
        }

        getSavedCards()
    }, [])

    const deleteCard = async () => {
        setIsDeleting(true)
        try {
            const res = await axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/delete-user-pan/${deleteData.current?._id}`)
            await decryptData(res.data.data)
            toast.success("Deleted card successfully!")
            setCards(prev => prev.filter(item => item?._id !== deleteData.current?._id))
            setDeleteData({ show: false, current: {} })
        } catch (error) {
        }
        finally {
            setIsDeleting(false)
        }
    }



    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontWeight: 600, color: 'black', fontSize: "24px" }}>{t("Manage Your Save Cards")}</h1>

            <div style={{
                display: "flex",
                // gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginTop: "2rem",
                width: "100%",
                justifyItems: "flex-start",
                flexWrap: "wrap"
            }}>
                {cards?.map(item => (
                    <div key={item?._id} style={{
                        width: "100%",
                        maxWidth: "300px", // Never bigger than 300px
                        minWidth: "220px"   // Minimum reasonable size
                    }} className={cardStyles.card} onClick={() => {
                    }}>
                        <div className={cardStyles.c_top}>
                            <img src={logo_w} alt="" />
                        </div>
                        <div className={cardStyles.c_bot}>
                            <span>XXXX XXXX XXXX {item?.last4}</span>
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <svg
                                    title="Delete"
                                    onClick={() => setDeleteData({ show: true, current: item })}
                                    style={{ marginLeft: "12px", cursor: "pointer" }}
                                    width="44"
                                    height="44"
                                    viewBox="0 0 44 44"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onMouseEnter={e => {
                                        const tooltip = e.currentTarget.nextSibling;
                                        if (tooltip) tooltip.style.opacity = 1;
                                    }}
                                    onMouseLeave={e => {
                                        const tooltip = e.currentTarget.nextSibling;
                                        if (tooltip) tooltip.style.opacity = 0;
                                    }}
                                >
                                    <path d="M19 13H25M13 16H31M29 16L28.2987 26.5193C28.1935 28.0975 28.1409 28.8867 27.8 29.485C27.4999 30.0118 27.0472 30.4353 26.5017 30.6997C25.882 31 25.0911 31 23.5093 31H20.4907C18.9089 31 18.118 31 17.4983 30.6997C16.9528 30.4353 16.5001 30.0118 16.2 29.485C15.8591 28.8867 15.8065 28.0975 15.7013 26.5193L15 16" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: "100%",
                                        top: "-30%",
                                        transform: "translateX(-50%)",
                                        background: "#222",
                                        color: "#fff",
                                        fontSize: "12px",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        whiteSpace: "nowrap",
                                        opacity: 0,
                                        pointerEvents: "none",
                                        transition: "opacity 0.2s",
                                        zIndex: 10
                                    }}
                                >
                                    {t("Delete")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={deleteData.show} toggle={() => setDeleteData({ show: false, current: {} })}>
                <ModalHeader toggle={() => setDeleteData({ show: false, current: {} })}>
                    {t("Delete Card Info")}
                </ModalHeader>
                <ModalBody>
                    {t("Are you sure you want to delete the Credit/Debit card ending with")} {deleteData.current?.last4}?
                </ModalBody>
                <ModalFooter>
                    <Button color='danger' onClick={deleteCard} disabled={isDeleting} style={{ borderRadius: "8px", padding: ".7rem 1.5rem" }}>
                        {t("Delete")}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default ManageSaveCards
