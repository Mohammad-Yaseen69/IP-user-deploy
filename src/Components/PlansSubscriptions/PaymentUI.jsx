import styles from '../ReceiptInvoices/InvoicePayment/styles/index.module.scss'
import UserDets from '../PaymentAddressPublic/UserDets'
import { formatCurrency } from '../../Helper/AmountFormat'
import CountriesData from "../PaymentsNewer/CountriesData.json"
import PayAsGuest from '../PaymentAddressPublic/PayAsGuest'
import ip from "../PaymentAddressPublic/instapay_black.svg";
import { useTranslation } from 'react-i18next'
import LanguagePicker from '../LanguagePicker'
import addFunds from "../HomeNewUpdated/files/AddFunds.png"
import CryptoPay from "../HomeNewUpdated/files/CryptoPay.svg"
import logo from "../../assets/images/logo/logo.webp"
import { isInIframe, openInNewTab } from '../../utils/Functions'
import { useNavigate } from 'react-router'
import AnimatedHeader from '../PaymentAddressPublic/AnimatedHeader'
import useWindowWidth from '../../utils/useWindowWidth'
import PaymentActionsButtons from '../ReceiptInvoices/InvoicePayment/PaymentActionsButtons'
import PayWithCrypto from '../PaymentAddressPublic/PayWithCrypto'
import { useState } from 'react'
import InvoiceDetails from '../ReceiptInvoices/InvoicePayment/InvoiceDetails'

const PaymentUI = ({ data, user_name, state, dataHandler, url }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const width = useWindowWidth()
    const [verificationBadge, setShowVerificationBadge] = useState(false)
    const actionButtons = [
        {
            label: "Pay With InstaPay",
            logo: logo,
            purple: true,
            onClick: () => {
                if (isInIframe()) {
                    const toNavigate = `${import.meta.env.VITE_PUBLIC_URL}/login?redirect=${encodeURIComponent(url)}`
                    openInNewTab(toNavigate)
                } else {
                    const path = url;
                    sessionStorage.setItem("path", path);
                    navigate(path)
                }
            },
            width: "15px",
            // disabled: true
        },
        {
            label: "Pay with Crypto",
            logo: CryptoPay,
            onClick: () => {
                dataHandler("showCryptoModal", true)
            },
            disabled: true
        },
        {
            label: "Pay As Guest",
            logo: addFunds,
            onClick: () => dataHandler("showCreditModal", !state.showCreditModal)
        }
    ]
    return (
        <>
            {
                state.showCreditModal
                &&
                <PayAsGuest
                    amount={formatCurrency(data?.plan?.price, true)}
                    isOpen={state.showCreditModal}
                    toggle={() => dataHandler("showCreditModal", !state.showCreditModal)}
                    user={data?.plan?.account}
                    wallet={data?.plan?.receivingWallet}
                    username={user_name}
                    subscriptionId={data.subscriptionId}
                    countryIsoCode={data.countryIsoCode}
                    type='subscription'
                />
            }

            {state.showCryptoModal &&
                <PayWithCrypto
                    data={{
                        ...state,
                        currentWallet: data.receivingWallet,
                        amount: data.amount || data.price
                    }}
                    dataHandler={dataHandler}
                    type='subscription'
                    isOpen={state.showCryptoModal}
                    toggle={() => dataHandler("showCryptoModal", false)}
                    invoiceId={data.invoiceId}
                />
            }
            <div className={styles.left}>
                <UserDets
                    cover={data?.plan?.account?.coverImage?.url}
                    dp={data?.plan?.account?.profileImage?.url}
                    setShowVerTT={(value) => setShowVerificationBadge(value)}
                    showVerTT={verificationBadge}
                    userCountry={CountriesData.find(c => c.alpha3 === data?.plan.account?.country?.country_iso_code)}
                    userDetails={{
                        ...data?.plan.account,
                        kyc_status: data?.plan.account?.user?.kyc_status
                    }}
                    user_name={data?.plan?.account?.username}
                    invoice={true}

                />

                <div className={styles.buttons}>
                    <div>
                        <button style={{ color: "white", background: "#5926F0" }} onClick={() => navigate(`/profile/${data?.plan?.account?.username}`)}>
                            {t("View Profile")}
                        </button>
                        <button onClick={() => navigate(`/pay/${data?.plan?.account?.username}`)}>
                            {t("View Payment Address")}
                        </button>
                    </div>

                    <LanguagePicker newUI={true} />
                </div>
            </div>

            <div className={styles.right}>

                <InvoiceDetails data={data} isSubscription={true} />

                <div className={styles.amount}>
                    <span> {t("Amount")} </span>
                    <h1>{data.currency || data?.plan?.receivingWallet?.currency?.code} {formatCurrency(data.amount || data.plan?.price, true)}</h1>
                </div>

                {!data.paid ?
                    <PaymentActionsButtons actionButtons={actionButtons} />
                    :
                    <div className={styles.paidInvoice}>
                        <p>
                            {("This invoice is paid!")}
                        </p>
                    </div>
                }


            </div>
            {width < 1000 &&
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        marginTop: "3rem"
                    }}
                >
                    <AnimatedHeader mobileUI />
                    <img src={ip} alt="" style={{ margin: "20px auto", width: "200px" }} />
                </div>
            }
        </>
    )
}

export default PaymentUI