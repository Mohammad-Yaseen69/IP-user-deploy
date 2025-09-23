import React, { useMemo, useState } from 'react'
import { ChevronRight, HelpCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import { Button, Input, Label } from 'reactstrap'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { toast } from 'react-toastify'
import { countries } from 'country-list-json'

const AirtimeDetails = ({ setSubStep, services, service, setService, phone, setPhone, setProviders, country }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false)

    const verifyPhone = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-airtime/+${phone}`)
            const data = await decryptData(res.data.data)
            // console.log(data)
            setProviders(...data)
            setSubStep(prev => prev + 1);
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
            toast.error("Invalid phone number!")
        } finally {
            setIsLoading(false)
        }
    }

    const countryCode = useMemo(() => countries.filter(it => country?.name?.toLowerCase()?.includes(it.name.toLowerCase()))?.[0]?.code, [country])
    return (
        <div style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column"
        }}>
            <div style={{
                background: "rgba(0,0,0,.03)",
                borderRadius: "20px",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "2rem",
                gap: "14px",
                paddingBottom: "1rem",
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                {/* <div>
                    <Label>{t("Service")}</Label>
                    <Input type='select' value={service} onChange={e => setService(e.target.value)}>
                        <option value="" disabled>--Select-A-Service--</option>
                        {services.map(item => (
                            <option value={item?.id}>{item?.name}</option>
                        ))}
                    </Input>
                </div> */}
                {
                    service == 1
                    &&
                    <div>
                        <Label style={{
                            color: "#7D7D7D",
                            fontSize: "1rem",
                            fontStyle: "normal",
                            fontWeight: 600,
                            lineHeight: "170%",
                        }}>{t("Enter The Phone Number")}</Label>
                        <PhoneInput
                            countryCodeEditable={false}
                            country={countryCode?.toLowerCase()}
                            disableDropdown={true}
                            value={phone}
                            onChange={e => setPhone(e)}
                            containerStyle={{
                                border: "none",
                                display: "flex",
                                gap: ".5rem",
                                flexDirection: "row-reverse",
                                height: "40px"
                            }}
                            inputStyle={{
                                borderRadius: "8px",
                                border: "1px solid rgba(0, 0, 0, 0.13)",
                                background: "#FFF",
                                padding: "1.5rem",
                                width: "100%",
                                height: "40px"
                            }}
                            buttonStyle={{
                                borderRadius: "8px",
                                border: "1px solid rgba(0, 0, 0, 0.13)",
                                background: "#FFF",
                                position: "static",
                                padding: "1.5rem .75rem",
                            }}
                        />
                    </div>
                }
            </div>
            <div style={{
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
                    onClick={verifyPhone}
                    disabled={isLoading || !phone || !service || phone.length < 9}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </div>
    )
}

export default AirtimeDetails