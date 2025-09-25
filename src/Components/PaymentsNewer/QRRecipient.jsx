import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody } from 'reactstrap'
import invite from "./files/invite.png"
import countries from "./CountriesData.json"
import { useNavigate } from 'react-router'
import InviteFriendModal from './InviteFriendModal'


const QRRecipient = ({ wallet, dataHandler }) => {
    const { t } = useTranslation()
    const country = countries.find(item => item.name === wallet?.country_name || item?.name?.toLowerCase()?.includes(wallet?.country_name?.toLowerCase()))
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            height: "100%"
        }}>
            <CardBody style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadiwus: "20px",
                padding: 0,
                width: "100%",
                height: "100%",
                justifyContent: "space-between"
            }}>
                <Card style={{
                    height: "fit-content",
                    marginBottom: 0,
                    boxShadow: "none",
                }}>
                    <CardBody style={{
                        background: "rgba(0,0,0,.03)",
                        padding: "1rem",
                        borderRadius: "31px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <Card style={{ marginBottom: "1rem" }}>
                            <CardBody style={{ padding: "1rem" }}>
                                <h5>{t("Recipient Details")}:</h5>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div style={{
                                        flex: 1,
                                    }}>
                                        {
                                            wallet?.profileImage
                                                ?
                                                <img
                                                    alt='adfaf'
                                                    src={wallet?.profileImage}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: "10px",
                                                        aspectRatio: "1",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                                :
                                                <div style={{
                                                    width: "100%",
                                                    borderRadius: "10px",
                                                    aspectRatio: "1",
                                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                    color: "white",
                                                    fontSize: "12cqi",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    containerType: "inline-size",
                                                    overflow: "hidden"
                                                }}>
                                                    {wallet?.first_name?.[0] || wallet?.company_name?.[0]}
                                                </div>
                                        }
                                    </div>
                                    <div style={{ flex: 1.8, containerType: "inline-size", display: "flex", flexDirection: "column", gap: ".75rem", justifyContent: "space-evenly" }}>
                                        {/* country */}
                                        <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
                                            <img src={country?.file_url} alt="" style={{ width: "24px", objectFit: "contain", borderRadius: "3px", boxShadow: "0 0 3px #0000001e" }} />
                                            <span>{country?.name}</span>
                                        </div>
                                        {/* username */}

                                        <h4 style={{ fontSize: "7.3cqi", marginBottom: "0" }}>{wallet?.first_name || wallet?.company_name} {wallet?.last_name}</h4>
                                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                            <div style={{
                                                borderRadius: "6px",
                                                flex: "1",
                                                whiteSpace: "nowrap",
                                                background: "#8000803e",
                                                width: "fit-content",
                                                fontSize: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#800080",
                                                padding: "3px 7px"
                                            }}>{wallet?.account_type === "individual" ? "Personal" : "Business"} Account</div>
                                            <div style={{
                                                borderRadius: "6px",
                                                flex: "1",
                                                whiteSpace: "nowrap",
                                                background: "#FFA5003e",
                                                width: "fit-content",
                                                fontSize: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#FFA500",
                                                padding: "3px 7px"
                                            }}>@{wallet?.username}</div>
                                            <div style={{
                                                borderRadius: "6px",
                                                flex: "1",
                                                whiteSpace: "nowrap",
                                                background: "#FFA5003e",
                                                width: "fit-content",
                                                fontSize: "8px",
                                                fontWeight: "500",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#FFA500",
                                                padding: "3px 7px"
                                            }}>{wallet?.wallet_id}</div>
                                        </div>
                                        <div style={{
                                            borderRadius: "6px",
                                            whiteSpace: "nowrap",
                                            background: "radial-gradient(6787.48% 187.54% at -4.08% -52.83%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                            width: "100%",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            color: "#FFf",
                                            padding: "5px 1.25rem",
                                            cursor: "pointer"
                                        }} onClick={() => {
                                            // window.open(`https://my.insta-pay.ch/profile/${wallet?.username}`, "_blank")
                                            navigate(`/profile/${wallet?.username}`)
                                        }}>{t("Visit Profile")}</div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <button onClick={() => {
                            dataHandler("beneficiary", {})
                            dataHandler("beneficiary_wallet", {})
                            window.history.replaceState(null, null, window.location.search?.split("&wallet_id")?.[0])
                        }} style={{
                            all: "unset",
                            padding: ".4rem 1rem",
                            fontSize: "1rem",
                            background: "white",
                            borderRadius: "8px",
                            boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                            cursor: "pointer",
                            textAlign: "center"
                        }}>
                            <span style={{
                                background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 500
                            }}>{t("Go Back")}</span>
                        </button>
                    </CardBody>
                    <div style={{
                        display: "flex",
                        paddingLeft: "29px",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "1.5rem"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                            <img src={invite} alt="i" width={13} height={13} />
                            <span style={{
                                color: "#a6a6a6",
                                fontSize: "11px",
                                fontWeight: "600"
                            }}>{t("Recipient not on InstaPay?")}</span>
                        </div>
                        <button style={{
                            all: "unset",
                            padding: ".3rem 1rem",
                            fontSize: ".6rem",
                            background: "white",
                            borderRadius: "40px",
                            boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                            cursor: "pointer"
                        }} onClick={() => setIsOpen(true)}>
                            <span style={{
                                background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 500
                            }}>{t("Invite")}</span>
                        </button>
                        <InviteFriendModal
                            isOpen={isOpen}
                            toggle={() => setIsOpen(false)}
                        />
                    </div>
                </Card>
                {/* <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: ".5rem",
                    flexWrap: "wrap",
                    paddingLeft: "1rem",
                    marginTop: "1rem"
                }}>
                    <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                        <HelpCircle size={12} />
                        <span>{t("Trouble Sending Money?")}</span>
                    </a>
                    <div style={{
                        display: "flex",
                        gap: "12px",
                    }}>
                        <Button size="sm" style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 8px"
                        }}
                            onClick={() => {
                                setSubStep(prev => prev - 1)
                            }}
                            disabled={!wallet}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button size="sm" style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                        }}
                            className="i_t_button"
                            onClick={() => {
                                setSubStep(prev => prev + 1)
                            }}
                            disabled={!wallet}
                        >
                            {t("Confirm")} <ChevronRight size={20} />
                        </Button>
                    </div>
                </div> */}
            </CardBody>
        </Card>
    )
}

export default QRRecipient