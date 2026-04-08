import { useTranslation } from "react-i18next"
import styles from "../styles/index.module.scss"
import QrDetails from "../../PaymentAddressPublic/QrDetails"
import { useContext, useMemo } from "react"
import { UserContext } from "../../../Context/UserContext"
import QrGenerate from "../../Settings/QrGenerate"
import InstaPayLoader from "../../Loader"
import { DownloadButton } from "../UI/FormElements"
import ShareableLink from "../UI/ShareableLink"
import useWindowWidth from "../../../utils/useWindowWidth"
import { formatCurrency } from "../../../Helper/AmountFormat"

const Preview = ({ invoiceId, data, isPending, uploadData, mutate }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)


    const qrCodeUrl = useMemo(() => {
        const base = window.location.origin || 'https://my.insta-pay.ch';
        return `${base}/invoice/qr/${userDetails?.username}/${invoiceId}`
    }, [invoiceId])


    const width = useWindowWidth()
    return (
        <>
            {isPending ?
                <div style={{ width: "70%", margin: "auto" }}>
                    <InstaPayLoader />
                </div> :
                <div style={{ display: 'grid', gridTemplateColumns: width > 460 ? '1.5fr .5fr' : "1fr", gap: 16, fontWeight: 600 }}>
                    <div className={styles.previewInfo}>
                        <div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Title')}:</div>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{data.title}</div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Description')}:</div>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{data.description}</div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Amount')}:</div>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{data.currency} {formatCurrency(data.amount, true)}</div>
                            </div>
                        </div>

                        <ShareableLink invoiceId={invoiceId} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <QrDetails inInvoice={true} invoiceId={invoiceId} username={userDetails?.username} />
                        <DownloadButton url={uploadData?.url} />
                    </div>

                </div>
            }


            <QrGenerate
                invoiceQrGenerateFn={mutate}
                invoiceId={invoiceId}
                isInvoice={true}
                invoiceUrl={qrCodeUrl}
            />
        </>
    )
}

export default Preview