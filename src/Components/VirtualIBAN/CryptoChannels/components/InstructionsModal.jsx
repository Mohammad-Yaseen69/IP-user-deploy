import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import useWindowWidth from "../../../../utils/useWindowWidth"
import Callout from "../../CryptoWallet/components/Callout"
import IncludesList from "../../CryptoWallet/components/IncludesList"
import ModalShell from "../../CryptoWallet/components/ModalShell"

const HOW_IT_WORKS = [
    "Add a channel for the crypto asset you want to receive.",
    "We generate a dedicated receiving address on every network that asset supports.",
    "Send crypto to that address — we detect the deposit and convert it automatically.",
    "The converted amount lands in your virtual IBAN balance, ready to spend or withdraw.",
]

/**
 * Shown the first time a vIBAN has no crypto channels yet, explaining what
 * a channel is before jumping into "Add crypto channel". Never shown again
 * once at least one channel exists.
 */
const InstructionsModal = ({ isOpen, toggle, onNext, currency = "EUR" }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            centered
            style={{ maxWidth: width > 640 ? "560px" : "100%" }}
        >
            <ModalBody style={{ padding: 0 }}>
                <ModalShell
                    title={t("Crypto channels")}
                    subtitle={t("Receive crypto straight into your virtual IBAN.")}
                    onClose={toggle}
                    secondaryLabel={t("Maybe later")}
                    onSecondary={toggle}
                    primaryLabel={t("Next")}
                    onPrimary={onNext}
                >
                    <Callout variant="brand" title={t("What is a crypto channel?")}>
                        {t("A crypto channel is an additional receiving address you add on top of this vIBAN. Anything sent to it is detected, converted and credited to your {{currency}} balance automatically.", { currency })}
                    </Callout>

                    <IncludesList
                        heading={t("How it works")}
                        items={HOW_IT_WORKS.map((item) => t(item))}
                    />

                    <Callout>
                        {t("You can add a channel for more than one crypto asset, each with its own dedicated address.")}
                    </Callout>
                </ModalShell>
            </ModalBody>
        </Modal>
    )
}

export default InstructionsModal
