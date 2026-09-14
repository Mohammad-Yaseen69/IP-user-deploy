import { useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";

// Renders Paytently's hosted-forms card page inside an iframe. Once the card is
// collected the iframe signals us (via paytently-collected.html) and we redirect
// the whole page to the authorize URL to complete 3DS.
const PaytentlyHostedModal = ({ isOpen, hostedUrl, authorizeUrl, onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const onMessage = (e) => {
            if (e?.data?.type === "paytently_card_collected") {
                if (authorizeUrl) window.location.href = authorizeUrl;
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [authorizeUrl]);

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered size="md">
            <ModalBody style={{ padding: 0, minHeight: "600px", borderRadius: "12px", overflow: "hidden" , maxHeight: "750px"}}>
                {hostedUrl ? (
                    <iframe
                        title={t("Card payment")}
                        src={hostedUrl}
                        style={{ width: "100%", height: "600px", border: 0 }}
                        allow="payment"
                    />
                ) : null}
            </ModalBody>
        </Modal>
    );
};

export default PaytentlyHostedModal;
