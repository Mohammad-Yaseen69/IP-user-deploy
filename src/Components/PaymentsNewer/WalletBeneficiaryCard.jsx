import React, { useEffect, useState } from 'react'
import { Check } from 'react-feather'

const WalletBeneficiaryCard = ({ user, setWallet, wallet }) => {
    const [walletBadges, setWalletBadges] = useState([])

    useEffect(() => {
        if (user) {
            setWalletBadges(user.wallet)
        }
    }, [user])


    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 0 5px rgba(128, 128, 128, 0.2)",
            borderRadius: "10px",
            padding: "1rem",
            gap: "12px",
            cursor: "pointer",
            minHeight: "70px",
            border: user?.wallet.some(item => item === wallet) ? "2px solid rgba(89, 38, 240, .3)" : "none"
        }} onClick={() => {
            if (walletBadges.some(item => item.wallet_id === wallet)) {
                return;
            } else {
                setWallet(walletBadges[0].wallet_id)
            }
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem"
            }}>
                <div style={{
                    minWidth: "30px",
                    minHeight: "30px",
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 800
                }}>{user?.beneficiary_type === "individual" ? user.first_name[0] : user.company_name[0]}</div>
                <h5 style={{ marginBottom: 0 }}>{`${user?.first_name} ${user?.last_name}`.slice(0, 20)}</h5>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                {
                    walletBadges.length > 0
                    &&
                    walletBadges.map(badge => (
                        <div style={{
                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            padding: ".25rem .5rem",
                            borderRadius: "100px",
                            color: "white",
                            fontSize: ".5rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: ".25rem",
                            position: "relative",
                            minWidth: "38px",
                            justifyContent: "center"
                        }} onClick={() => setWallet(badge?.wallet_id)}>
                            {wallet === badge?.wallet_id && (
                                <div style={{
                                    position: "absolute",
                                    top: "-4px",
                                    left: "-4px",
                                    height: "15px",
                                    width: "15px",
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "10px",
                                    background: "white",
                                    border: "1px solid rgba(0,0,0,.1)"
                                }}>
                                    <Check size={13} color='green' />
                                </div>
                            )}
                            {badge?.currency?.code}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default WalletBeneficiaryCard