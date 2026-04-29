import { useTranslation } from "react-i18next"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

const ConfirmationModal = ({ isOpen, toggle, onConfirm, onCancel }) => {
    const { t } = useTranslation()
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{t("Confirm")}</ModalHeader>
            <ModalBody>
                {t("Beneficiary country and Bank country doesn't match, Updating the bank details will also update the beneficiary's details, (i.e: country, city, phone number, card details, mobile wallet details, cash pickup details, etc.).")}            </ModalBody>
            <ModalFooter>
                <Button style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "40px",
                    display: "flex",
                    alignItems: "center",
                    padding: ".6rem 2rem"
                }}
                    className="i_t_button" onClick={onCancel}>{t("Cancel")}</Button>
                <Button style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "40px",
                    display: "flex",
                    alignItems: "center",
                    padding: ".6rem 2rem"
                }}
                    className="i_t_button" onClick={onConfirm}>{t("Proceed")}</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmationModal