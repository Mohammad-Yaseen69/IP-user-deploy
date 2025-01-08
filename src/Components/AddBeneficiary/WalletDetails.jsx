import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FormGroup, Input, Label } from 'reactstrap'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'

const WalletDetails = ({ wallet, authHeader, setWalletError, setWalletIds, setDuplicateWallet, walletIds, activeTab = "", firstTime }) => {
    const { t } = useTranslation()
    const [details, setDetails] = useState(null)
    useEffect(() => {
        setDuplicateWallet(false)
        if (wallet?.wallet_id ? wallet?.wallet_id?.length : wallet.length === 8) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-by-wallet-id/${wallet?.wallet_id ?? wallet}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted.walletDetails)
                    setDetails(decrypted.walletDetails)
                    const filtered = walletIds.filter(item => item === decrypted?.walletDetails?._id)
                    setWalletIds(filtered.length === 0 ? [...walletIds, decrypted?.walletDetails?._id] : walletIds)
                    setDuplicateWallet(filtered.length === 0 || firstTime ? false : true)
                    setWalletError("")
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    if (decrypted?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/auth/login";
                    }
                    if (decrypted.status === false) {
                        setWalletError("Invalid Wallet Id")
                    }
                })
        } else {
            setDetails(null)
        }
    }, [wallet, activeTab])
    return (
        <>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label">{t("Wallet Holder Name")} <span className="req_star">*</span></Label>
                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} value={`${details?.first_name ?? ""} ${details?.last_name ?? ""}`} disabled readOnly />
            </FormGroup>
            <FormGroup style={{ flex: 1, margin: 0 }}>
                <Label className="col-form-label" htmlFor="card-holder-name">{t("Wallet Currency")} <span className="req_star">*</span></Label>
                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} value={details?.currency?.code ?? ""} disabled readOnly />
            </FormGroup>
        </>
    )
}

export default WalletDetails