import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { Button, Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'react-feather'
import styles from "./styles/AddCurrency.module.css"
import add from "./files/add.svg"
import { toast } from 'react-toastify'
import country from "./Currencies.json"

const AddCurrencyModal = ({ isOpen, toggle, setSavedWalelt }) => {
    const { t } = useTranslation()
    const [currency, setCurrency] = useState("")
    const [desc, setDesc] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [currencies, setCurrencies] = useState([])
    const [error, setError] = useState("")
    const { authHeader, userWallets, userDetails, getUserWallets } = useContext(UserContext)
    const [showSuccess, setShowSuccess] = useState(false)

    const addNewCurrency = async () => {
        setIsSaving(true)
        setError("")
        try {
            const currentCurrency = currencies.filter(item => item.code === currency)?.[0];
            if (currentCurrency) {
                const data = {
                    code: currentCurrency?.code,
                    account_id: userDetails?._id,
                    desc
                }
                const encrypted = encryptData(data)
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/currency/request-currency-user/${currentCurrency?._id}`, {
                    data: encrypted
                }, {
                    headers: authHeader
                })
                const resData = await decryptData(res?.data?.data)
                console.log("addCurrency = ", resData)
                console.log(resData?.walletDetails)
                setSavedWalelt(resData?.walletDetails)
                setShowSuccess(true)
                setCurrency("")
                getUserWallets()
                toggle()
            }
        } catch (error) {
            const decrypted = decryptData(error?.response?.data?.data)
            setError(decrypted?.message ?? "Something went wrong!")
            const message = decrypted?.message == "You can only have 8 wallets!" ? "You Can Have Only 8 Wallets" : decrypted?.message
            toast.error(t(message ?? "Something went wrong!"))
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        const getCurrencies = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/currency/get-currencies`, {
                    headers: authHeader
                })
                const data = await decryptData(res?.data?.data)
                console.log(data)
                const filtered = data?.currencies
                    // ?.filter(item => !userWallets?.some(it => it?.currency?.code === item?.code))
                    ?.map(item => {
                        const coun = country?.find(it => item?.code === it?.code)
                        return {
                            ...item,
                            flag: coun?.flag
                        }
                    })
                // ?.map(item => {
                //     const iso3 = countries?.find(it => it?.currency_name === item?.name)?.iso3
                //     const filt = countriesJson?.find(it => it?.alpha3 === iso3)


                //     return {
                //         ...item,
                //         flag: filt?.file_url
                //     }
                // })
                setCurrencies(filtered)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            }
        }
        if (userWallets) {
            getCurrencies()
        }
    }, [userWallets])

    const isAlreadyAdded = (item) => {
        return userWallets?.some(it => it?.currency?.code === item?.code)
    }

    return (
        <>
            <Modal
                contentClassName={styles.content}
                isOpen={isOpen}
                style={{
                    maxWidth: "818px",
                }}>
                <ModalBody className={styles.container}>
                    <div className={styles.left}>
                        <h1>{t("Wallet").toUpperCase()}</h1>
                        <h2>{t("Add a currency")}</h2>
                        <p>{t("When you add a currency, any payments you receive in that currency will be credited to your InstaPay balance. Your primary currency will be used for sending or requesting payments unless specified otherwise.")}</p>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.currencies}>
                            {
                                currencies?.map(item => (
                                    <div
                                        key={item?.code}
                                        data-content={t("Already Exist")}
                                        className={`${styles.currency} ${item?.code === currency ? styles.active : isAlreadyAdded(item) ? styles.disabled : ""}`}
                                        onClick={() => {
                                            if (isAlreadyAdded(item)) {
                                                return
                                            }
                                            setCurrency(item?.code)
                                        }}
                                    >
                                        <img src={item?.flag} alt="" />
                                        {t(item?.name)} ({t(item?.code)})
                                    </div>
                                ))
                            }
                        </div>
                        <div className={styles.buttons}>
                            <button
                                onClick={() => {
                                    toggle()
                                    setCurrency("")
                                }}
                                disabled={isSaving}
                                className={styles.t_btn}
                            >
                                {t("Cancel")}
                            </button>
                            <Button
                                onClick={addNewCurrency}
                                disabled={isSaving || !currency}
                                className={styles.f_btn}
                            >
                                <img src={add} alt="" />
                                <span>{t("Add Currency")}</span>
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
            <Modal isOpen={showSuccess}>
                <ModalHeader toggle={() => setShowSuccess(!showSuccess)}>
                    New Currency Added
                </ModalHeader>
                <ModalBody>
                    <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                        <CheckCircle size={64} className="text-success" />
                        Currency Added!
                    </h5>
                    <div className="text-center">
                        <p className="mb-0">
                            New {currency} wallet added successfully!
                        </p>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default AddCurrencyModal