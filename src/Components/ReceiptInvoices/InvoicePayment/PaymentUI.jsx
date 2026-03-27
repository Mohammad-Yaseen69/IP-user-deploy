import styles from './styles/index.module.scss'
import UserDets from '../../PaymentAddressPublic/UserDets'
import { formatCurrency } from '../../../Helper/AmountFormat'
import CountriesData from "../../PaymentsNewer/CountriesData.json"
import PayAsGuest from '../../PaymentAddressPublic/PayAsGuest'
import ip from "../../PaymentAddressPublic/instapay_black.svg";
import { useTranslation } from 'react-i18next'
import LanguagePicker from '../../LanguagePicker'
import addFunds from "../../HomeNewUpdated/files/AddFunds.png"
import CryptoPay from "../../HomeNewUpdated/files/CryptoPay.svg"
import logo from "../../../assets/images/logo/logo.png"
import { isInIframe, openInNewTab, flagCheck } from '../../../utils/Functions'
import { useNavigate } from 'react-router'
import AnimatedHeader from '../../PaymentAddressPublic/AnimatedHeader'
import useWindowWidth from '../../../utils/useWindowWidth'
import PaymentActionsButtons from './PaymentActionsButtons'
import PayWithCrypto from '../../PaymentAddressPublic/PayWithCrypto'
import InvoiceDetails from './InvoiceDetails'
import { useState } from 'react'

const PaymentUI = ({ data, user_name, state, dataHandler, url, toggleCreditModal }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const width = useWindowWidth()
    const [verificationBadge, setShowVerificationBadge] = useState(false)
    const userDetails = data?.account

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
            disabled: !flagCheck("payments.allowInstapay", userDetails, "invoice"),
            disabledMessage: t("This method is disabled for this payment address by admin.")
        },
        {
            label: "Pay with Crypto",
            logo: CryptoPay,
            onClick: () => {
                dataHandler("showCryptoModal", true)
            },
            disabled: !flagCheck("payments.allowCrypto", userDetails, "invoice"),
            disabledMessage: t("This method is disabled for this payment address by admin.")
        },
        {
            label: "Pay As Guest",
            logo: addFunds,
            onClick: toggleCreditModal,
            disabled: !flagCheck("payments.allowGuestPay", userDetails, "invoice"),
            disabledMessage: t("This method is disabled for this payment address by admin.")
        }
    ]
    return (    
        <>
            {
                state.showCreditModal
                &&
                <PayAsGuest
                    amount={formatCurrency(data.amount || data.price, true)}
                    isOpen={state.showCreditModal}
                    toggle={toggleCreditModal}
                    user={data.account}
                    wallet={data?.receivingWallet}
                    username={user_name}
                    isShipping={data.shippingAddress}
                    invoiceId={data.invoiceId}
                    type='invoice'
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
                    type='invoice'
                    isOpen={state.showCryptoModal}
                    toggle={() => dataHandler("showCryptoModal", false)}
                    invoiceId={data.invoiceId}
                    isShipping={data.shippingAddress}
                />
            }
            <div className={styles.left}>
                <UserDets
                    cover={data?.account?.coverImage?.url}
                    dp={data?.account?.profileImage?.url}
                    setShowVerTT={(value) => setShowVerificationBadge(value)}
                    showVerTT={verificationBadge}
                    userCountry={CountriesData.find(c => c.alpha3 === data?.account?.country?.country_iso_code)}
                    userDetails={{
                        ...data.account,
                        kyc_status: data?.account?.user?.kyc_status
                    }}
                    user_name={user_name}
                    invoice={true}

                />

                <div className={styles.buttons}>
                    <div>
                        <button onClick={() => navigate(`/profile/${user_name}`)} style={{ color: "white", background: "#5926F0" }}>
                            {t("View Profile")}
                        </button>
                        <button>
                            {t("Explore eShop")}
                        </button>
                    </div>

                    <LanguagePicker newUI={true} />
                </div>
            </div>

            <div className={styles.right}>

                <InvoiceDetails data={data} />

                <div className={styles.amount}>
                    <span> {t("Amount")} </span>
                    <h1>{data.currency} {formatCurrency(data.amount || data.price, true)}</h1>
                </div>

                {!data.paid ?
                    <PaymentActionsButtons actionButtons={actionButtons} userDetails={userDetails} />
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