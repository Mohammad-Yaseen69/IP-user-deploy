import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { useTranslation } from 'react-i18next'
import styles from "./index.module.css"
import { Swiper, SwiperSlide } from 'swiper/react'

const AddBeneficiaryAddressModal = ({ isOpen, toggle, beneficiaries = [], close, dataHandler }) => {
    const { t } = useTranslation()
    const [loading, setIsLoading] = useState(false)
    const { authHeader } = useContext(UserContext)
    const [addresses, setAddresses] = useState({})
    const [current, setCurrent] = useState(beneficiaries[0]?._id)
    const swiperRef = useRef(null)

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setAddresses(prev => ({
            ...prev,
            [name]: value
        }))
    }

    useEffect(() => {
        if (beneficiaries.length > 0) {
            beneficiaries.map(item => setAddresses(prev => ({ ...prev, [item?._id]: "" })))
        } else {
            setAddresses({})
        }
    }, [beneficiaries])

    const addBeneficiariesAddressHandler = async (beneficiary) => {
        setIsLoading(true)
        try {
            const encrypted = encryptData({ ...beneficiary, address: addresses?.[beneficiary?._id] })
            const res = await axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/update-beneficiary/${beneficiary?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            if (beneficiaries[beneficiaries.length - 1]?._id === beneficiary?._id) {
                toggle()
                dataHandler("beneficiary", {
                    ...beneficiary,
                    address: addresses?.[beneficiary?._id]
                })
            } else {
                swiperRef?.current?.swiper?.slideNext()
            }
        }
        catch (error) {
            toast.error(`Something went wrong while adding address for "${beneficiary?.first_name} ${beneficiary?.last_name}"`)
        }
        finally {
            setIsLoading(false)
        }
    }

    // const submitHandler = async () => {
    //     setIsLoading(true);
    //     let hasError = false;
    //     let updatedAddresses = { ...addresses };

    //     for (const beneficiary of beneficiaries) {
    //         try {
    //             await addBeneficiariesAddressHandler(beneficiary);
    //             delete updatedAddresses[beneficiary?._id];
    //         } catch (error) {
    //             hasError = true;
    //         }
    //     }

    //     if (!hasError) {
    //         toggle();
    //     } else {
    //         setAddresses(updatedAddresses);
    //     }

    //     setIsLoading(false);
    // };

    return (
        <Modal isOpen={isOpen} style={{ maxWidth: "920px", width: "100vw" }}>
            <ModalHeader toggle={close}>{t("Add Addresses For Beneficiaries")} ({beneficiaries.findIndex(i => i?._id === current) + 1}/{beneficiaries.length})</ModalHeader>
            <ModalBody>
                <Swiper
                    ref={swiperRef}
                    style={{ width: "100%" }}
                    className='mySwiper'
                    onSlideChange={e => setCurrent(beneficiaries[e.activeIndex]?._id)}
                >
                    {
                        beneficiaries.map(item => (
                            <SwiperSlide
                                style={{ width: "100%" }}
                                key={item?._id}
                            >
                                <div
                                    className={styles.benef}
                                >
                                    <div
                                        className={styles.benef_top}
                                    >
                                        <div className={styles.dp}>{item?.first_name?.[0]}</div>
                                        <div className={styles.bt_dets}>
                                            <h4>{item?.first_name} {item?.last_name}</h4>
                                            <div>
                                                <span>{t("Country")}: </span>
                                                <strong>{item?.country_name}</strong>
                                            </div>
                                            <div>
                                                <span>{t("Phone")}: </span>
                                                <strong>{item?.phone}</strong>
                                            </div>
                                            <div>
                                                <span>{t("Email")}: </span>
                                                <strong>{item?.email}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <textarea
                                        placeholder={`Enter ${item?.first_name} ${item?.last_name}'s address`}
                                        value={addresses[item?._id]}
                                        onChange={onChangeHandler}
                                        name={item?._id}
                                    ></textarea>
                                </div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </ModalBody>
            <ModalFooter>
                <button
                    style={{
                        all: "unset",
                        marginRight: "auto",
                        marginLeft: "1rem",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                    onClick={() => {
                        if (beneficiaries[beneficiaries.length - 1]?._id === current) {
                            close()
                        } else {
                            swiperRef?.current?.swiper?.slideNext()
                        }
                    }}
                >
                    {t("Skip")} {t("Current")}
                </button>
                <Button color='primary' onClick={() => addBeneficiariesAddressHandler(beneficiaries.find(i => i?._id === current))} disabled={loading || !addresses[current]}>
                    {t("Continue")}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AddBeneficiaryAddressModal