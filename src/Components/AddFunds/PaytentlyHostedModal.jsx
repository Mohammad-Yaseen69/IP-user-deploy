import { useEffect, useRef } from "react";
import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";

const PaytentlyHostedModal = ({ isOpen, hostedUrl, authorizeUrl, onClose, onCardCollected }) => {
    const { t } = useTranslation();
    const handled = useRef(false);

    useEffect(() => {
        handled.current = false;
    }, [hostedUrl]);

    useEffect(() => {
        const onMessage = (e) => {
            if (e?.data?.type !== "paytently_card_collected") return;
   
            if (e.origin !== window.location.origin || handled.current) return;
            handled.current = true;

            if (onCardCollected) {
                onCardCollected();
            } else if (authorizeUrl) {
                window.location.href = authorizeUrl;
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [authorizeUrl, onCardCollected]);

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
