import { useEffect, useMemo, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import styles from "./styles/plans.module.scss"
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../Helper/AmountFormat'
import useWindowWidth from '../../utils/useWindowWidth'
import { isInIframe, openInNewTab } from '../../utils/Functions'
import { useNavigate } from 'react-router'
import addFunds from "../HomeNewUpdated/files/AddFunds.png"
import CryptoPay from "../HomeNewUpdated/files/CryptoPay.svg"
import logo from "../../assets/images/logo/logo.webp"
import PaymentActionsButtons from '../ReceiptInvoices/InvoicePayment/PaymentActionsButtons'
import PayAsGuest from './PayAsGuest'
import PayWithCrypto from './PayWithCrypto'

const PlansModal = ({ isOpen, toggle, plansData, dataHandler, isLoading, user, user_name, data }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    const plans = useMemo(() => plansData || [], [plansData])
    const navigate = useNavigate()
    const [showCryptoModal, setShowCryptoModal] = useState(false)
    const [showGuestModal, setShowGuestModal] = useState(false)
    const [selectedAction, setSelectedAction] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState()

    useEffect(() => {
        if (plansData) {
            setSelectedPlan(plansData[0])
        }
    }, [plansData])
    const chevron = (active) => (
        <svg
            style={{
                transform: active ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
            }}
            className={styles.chev}
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
        >
            <path
                d="M7.5 9l4.5 4.5L16.5 9"
                stroke="#6b6b6b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
    // const url = data ? `/payments?payment_action=send_money&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.currency}&amount=${data.amount}&isShipping=${data.shippingAddress}&payment_type=invoice` : "/"


    const actionButtons = [
        {
            label: "Pay With InstaPay",
            logo: logo,
            action: () => {
                if (isInIframe()) {
                    const toNavigate = `${import.meta.env.VITE_PUBLIC_URL}/login?redirect=${encodeURIComponent('/')}`
                    openInNewTab(toNavigate)
                } else {
                    const path = '/';
                    sessionStorage.setItem("path", path);
                    navigate(path)
                }
            },
            width: "13px",
            disabled: true
        },
        {
            label: "Pay with Crypto",
            logo: CryptoPay,
            action: () => {
                setShowCryptoModal(true)
            },
            disabled: true
        },
        {
            label: "Pay As Guest",
            logo: addFunds,
            action: () => {
                setShowGuestModal(true)
                toggle()
            }
        }
    ]

    const handleContinue = () => {
        if (selectedAction?.action) {
            selectedAction.action()
        }
    }


    console.log(showGuestModal, "guest modal")
    return (
        <>
            <Modal isOpen={isOpen} style={{ minWidth: width > 1000 && "900px" }} toggle={toggle} >
                <ModalBody style={{ padding: "0px" }}>
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <h1>{t('Plans & Pricing')}</h1>
                        </div>

                        <div className={styles.main}>
                            <div className={styles.left} >
                                {isLoading && <div style={{ padding: 16 }}>{t('Loading plans...')}</div>}
                                {!isLoading && plans?.length === 0 && (
                                    <div style={{ padding: 16, color: '#777', fontWeight: 600 }}>{t('No plans available')}</div>
                                )}
                                {!isLoading && plans?.map((plan) => {
                                    const isActive = selectedPlan?._id === plan._id
                                    const wallet = plan?.receivingWallet?.currency
                                    const onClick = () => setSelectedPlan(selectedPlan?._id === plan._id && width < 1000 ? null : plan)
                                    return (
                                        <div key={plan._id} className={`${styles.item} ${isActive && width > 1000 ? styles.active : ''}`}>
                                            <div className={styles.itemHeader} onClick={onClick}>
                                                <div>
                                                    <h3>{plan.title}</h3>
                                                    <div className={styles.price}>
                                                        <h5>{wallet.symbol || wallet.code} {formatCurrency(plan.price, true)}</h5>
                                                        <span>/ {t(plan.billingCycle)?.toLowerCase()}</span>
                                                    </div>
                                                </div>
                                                {width < 1000 && chevron(isActive)}
                                            </div>

                                            {width < 1000 && isActive && (
                                                <div
                                                    className={styles.right}
                                                >
                                                    <div className={styles.heading}>{plan.title}</div>
                                                    <div className={styles.desc}>{plan.description}</div>

                                                    <div className={styles.termsLabel}>{t('Terms & Conditions')}:</div>
                                                    <textarea
                                                        className={styles.terms}
                                                        readOnly
                                                        value={plan?.termsAndConditions?.text || ''}
                                                    />

                                                    <div style={{ marginTop: "15px" }}>
                                                        <span style={{ fontWeight: 600, fontSize: "16px" }}>{t("Select a payment option to continue:")} </span>
                                                        <div style={{ margin: "10px 0 30px 0" }}>
                                                            <PaymentActionsButtons
                                                                inPlans={true}
                                                                actionButtons={actionButtons}
                                                                selectedAction={selectedAction}
                                                                setSelectedAction={setSelectedAction}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className={styles.footer}>
                                                        <div className={styles.priceWrap}>
                                                            <span className={styles.price}>{(plan?.receivingWallet?.currency?.code || 'USD')} {formatCurrency(plan.price, true)}</span>
                                                            <span className={styles.cycle}>/ {t(plan.billingCycle)?.toLowerCase()}</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ padding: "0px", marginTop: "10px" }} className={styles.actions}>
                                                        <button
                                                            style={{ width: "100%", justifyContent: "center" }}
                                                            className={styles.ctaBtn}
                                                            onClick={handleContinue}
                                                            disabled={!selectedAction}
                                                        >
                                                            {t('Select this Plan')}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M20.7806 12.5306L14.0306 19.2806C13.8899 19.4214 13.699 19.5004 13.5 19.5004C13.301 19.5004 13.1101 19.4214 12.9694 19.2806C12.8286 19.1399 12.7496 18.949 12.7496 18.75C12.7496 18.551 12.8286 18.3601 12.9694 18.2194L18.4397 12.75H3.75C3.55109 12.75 3.36032 12.671 3.21967 12.5303C3.07902 12.3897 3 12.1989 3 12C3 11.8011 3.07902 11.6103 3.21967 11.4697C3.36032 11.329 3.55109 11.25 3.75 11.25H18.4397L12.9694 5.78063C12.8286 5.6399 12.7496 5.44903 12.7496 5.25001C12.7496 5.05098 12.8286 4.86011 12.9694 4.71938C13.1101 4.57865 13.301 4.49959 13.5 4.49959C13.699 4.49959 13.8899 4.57865 14.0306 4.71938L20.7806 11.4694C20.8504 11.539 20.9057 11.6218 20.9434 11.7128C20.9812 11.8038 21.0006 11.9014 21.0006 12C21.0006 12.0986 20.9812 12.1962 20.9434 12.2872C20.9057 12.3783 20.8504 12.461 20.7806 12.5306Z" fill="white" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {width > 1000 && (
                                <div className={styles.right}>
                                    {selectedPlan && (
                                        <>
                                            <div className={styles.heading}>{selectedPlan.title}</div>
                                            <div className={styles.desc}>{selectedPlan.description}</div>

                                            <div className={styles.termsLabel}>{t('Terms & Conditions')}:</div>
                                            <textarea
                                                className={styles.terms}
                                                readOnly
                                                value={selectedPlan?.termsAndConditions?.text || ''}
                                            />

                                            <div style={{ marginTop: "15px" }}>
                                                <span style={{ fontWeight: 600, fontSize: "16px" }}>{t("Select a payment option to continue:")} </span>
                                                <PaymentActionsButtons
                                                    isRow={true}
                                                    actionButtons={actionButtons}
                                                    inPlans={true}
                                                    selectedAction={selectedAction}
                                                    setSelectedAction={setSelectedAction}
                                                />
                                            </div>

                                            <div className={styles.footer}>
                                                <div className={styles.priceWrap}>
                                                    <span className={styles.price}>{(selectedPlan?.receivingWallet?.currency?.code || 'USD')} {formatCurrency(selectedPlan.price, true)}</span>
                                                    <span className={styles.cycle}>/ {t(selectedPlan?.billingCycle)?.toLowerCase()}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ paddingTop: width < 1000 && "0px" }} className={styles.actions}>
                            <button style={{ width: width < 1000 && "100%" }} className={styles.cancelBtn} onClick={toggle}>{t('Cancel')}</button>
                            {width > 1000 &&
                                <button
                                    className={styles.ctaBtn}
                                    onClick={handleContinue}
                                    disabled={!selectedAction}
                                >
                                    {t('Continue')}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.7806 12.5306L14.0306 19.2806C13.8899 19.4214 13.699 19.5004 13.5 19.5004C13.301 19.5004 13.1101 19.4214 12.9694 19.2806C12.8286 19.1399 12.7496 18.949 12.7496 18.75C12.7496 18.551 12.8286 18.3601 12.9694 18.2194L18.4397 12.75H3.75C3.55109 12.75 3.36032 12.671 3.21967 12.5303C3.07902 12.3897 3 12.1989 3 12C3 11.8011 3.07902 11.6103 3.21967 11.4697C3.36032 11.329 3.55109 11.25 3.75 11.25H18.4397L12.9694 5.78063C12.8286 5.6399 12.7496 5.44903 12.7496 5.25001C12.7496 5.05098 12.8286 4.86011 12.9694 4.71938C13.1101 4.57865 13.301 4.49959 13.5 4.49959C13.699 4.49959 13.8899 4.57865 14.0306 4.71938L20.7806 11.4694C20.8504 11.539 20.9057 11.6218 20.9434 11.7128C20.9812 11.8038 21.0006 11.9014 21.0006 12C21.0006 12.0986 20.9812 12.1962 20.9434 12.2872C20.9057 12.3783 20.8504 12.461 20.7806 12.5306Z" fill="white" />
                                    </svg>
                                </button>}
                        </div>
                    </div>
                </ModalBody>
            </Modal>


            {showGuestModal &&
                <PayAsGuest
                    isOpen={showGuestModal}
                    amount={selectedPlan?.price}
                    wallet={selectedPlan?.receivingWallet}
                    toggle={() => setShowGuestModal(false)}
                    username={user_name}
                    user={user}
                    planId={selectedPlan?.planId}
                    type='plan'
                />
            }


            <PayWithCrypto
                data={data}
                dataHandler={dataHandler}
                type='plan'
                isOpen={showCryptoModal}
                toggle={() => setShowCryptoModal(false)}
            />
        </>
    )
}

export default PlansModal