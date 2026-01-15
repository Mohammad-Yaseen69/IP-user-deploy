import { useMemo } from 'react'
import { formatCurrency } from '../../../Helper/AmountFormat'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

const VendorBalanceModal = ({ vendorBalance, vendorBalanceInUSD, currency, vendorBalanceLoading, sendingAmount, sendingLimit, isOpen, toggle }) => {
    const vendorBalanceModalText = useMemo(() => {
        if (vendorBalance === 0) {
            return `We're currently unable to process transfers in ${currency}. Please try again later or contact support for assistance.`
        }

        if (vendorBalanceInUSD < 4) {
            return <>
                {"We understand that your remaining sending limit is up to"}{" "}
                {formatCurrency(sendingLimit, true) || "N/A"}{" "}
                {currency}. {"However, at this time, we are unable to process your request. Please try again later."}{" "}
                <br /><br />
                {"Thank you for your understanding."}
            </>
        }

        return <>
            {"We understand that your remaining sending limit is up to"}{" "}
            {formatCurrency(sendingLimit, true) || "N/A"} {" "}
            {currency}.{"However, at this time, we can only process a maximum of"} {" "}
            {formatCurrency(vendorBalance, true)} {currency}.
            <br /><br />
            {"You may proceed with"} {" "}
            {formatCurrency(vendorBalance, true)} {currency} {" "}
            {"at the moment or try again later to be able to send"} {" "}
            {formatCurrency(sendingAmount, true)} {currency}.
            <br /><br />
            {"Thank you for your understanding."}
        </>
    }, [vendorBalance, vendorBalanceLoading, vendorBalanceInUSD, currency, sendingLimit, sendingAmount])

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader style={{ paddingBottom: "6px" }} toggle={toggle}>
                <h2 style={{ fontSize: "24px" }}>{("Notice")}</h2>
            </ModalHeader>
            <ModalBody>
                <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                    {vendorBalanceModalText}
                </h3>
            </ModalBody>
        </Modal>
    )
}

export default VendorBalanceModal
