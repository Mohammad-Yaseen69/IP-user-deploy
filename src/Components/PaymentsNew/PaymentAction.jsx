import ActionCard from "./Common/ActionCard";
import w1 from "./files/w1.png"
import sm from "./files/sm.svg"
import w2 from "./files/w2.png"
import rm from "./files/rm.svg"
import w3 from "./files/w3.png"
import q from "./files/q.svg"
import { useTranslation } from "react-i18next";

const PaymentAction = ({ setAction, setStep }) => {
    const { t } = useTranslation()
    return (
        <div style={{
            display: "flex",
            gap: "2rem",
            overflowX: "scroll",
            overflowY: "visible",
            padding: "2rem",
            scrollbarWidth: "none"
        }}>
            <ActionCard bg={w1} title={t("Send Money")} icon={rm} desc={t("Easily send money to friends, family, or businesses locally or internationally. Choose from multiple transfer options, including bank deposits, mobile wallets, cash pick-up, payment cards, and wallet to wallet transfers. Enjoy the convenience and security of Instapay for seamless and instant money transfers.")} setter={setAction} setterValue="send_money" setStep={setStep} />
            <ActionCard bg={w2} title={t("Request Money")} icon={sm} desc={t("Request a customized price quote from service providers or vendors. Get accurate cost estimates and quotes for the services or products you need.")} setter={setAction} setterValue="req_money" setStep={setStep} />
            <ActionCard bg={w3} title={t("Send A Quote")} icon={q} desc={t("Send a detailed price quote to your clients or customers. Present your services, products, or offers in a professional manner with a personalized quote.")} setter={setAction} setterValue="send_quote" setStep={setStep} />
            <ActionCard bg={w3} title={t("Request A Quote")} icon={q} desc={t("Request a detailed price quote from your clients or customers. Present your services, products, or offers in a professional manner with a personalized quote.")} setter={setAction} setterValue="req_quote" setStep={setStep} />
        </div>
    )
}

export default PaymentAction;