import { ChevronRight, HelpCircle, Search } from "react-feather";
import { Button, Card, CardBody, CardFooter, Input } from "reactstrap";
import search from "./files/search.svg"
import cross from "./files/cross.svg"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PaymentCountry = ({ country, setCountry, setSubStep }) => {
    const [countries, setCountries] = useState([])
    const [filtered, setFiltered] = useState([])
    const { t } = useTranslation()

    useEffect(() => {
        const fetchCountries = async () => {
            const res = await fetch("https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json")
            const data = await res.json()
            setCountries(data)
            setFiltered(data)
        }
        fetchCountries()
    }, [])

    const searchCountry = (e) => {
        const filt = countries.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFiltered(filt)
    }

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                background: "rgba(0,0,0,.03)",
                borderRadius: "20px",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "14px",
                gap: "14px",
                paddingBottom: 0
            }}>
                <Card style={{ margin: 0 }}>
                    <CardBody style={{ display: "flex", alignItems: "center", padding: ".5rem .75rem", borderRadius: "10px" }}>
                        <Search color="#a0a0a0" size={18} />
                        <Input type="text" placeholder="Search Country" style={{ border: "none", outline: "none", fontSize: "1rem" }} onChange={searchCountry} />
                    </CardBody>
                </Card>
                <Card style={{
                    margin: 0,
                    overflowX: "hidden",
                    overflowY: "auto",
                    minWidth: "200px",
                    flex: "1",
                    padding: ".5rem",
                    borderRadius: "10px",
                    scrollbarWidth: "none",
                    maxHeight: "100%"
                }}>
                    <CardBody style={{ padding: 0 }}>
                        {
                            filtered.length > 0
                            &&
                            filtered.map(item => (
                                <div key={item.code} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".5rem",
                                    padding: "0 .5rem",
                                    cursor: "pointer",
                                    background: item.name === country.name && "linear-gradient(to left, #e64067, #5926f0, #4828a0)",
                                    color: item.name === country.name && "white",
                                    borderRadius: "10px"
                                }}
                                    onClick={() => setCountry(item)}>
                                    <img src={item.image} alt={item.code} style={{ width: "50px", borderRadius: "30px", overflow: "hidden" }} draggable="false" />
                                    {/* <img src={`https://flagsapi.com/${item.code}/shiny/64.png` ?? item.image} alt={item.code} style={{ width: "50px", borderRadius: "30px", overflow: "hidden" }} draggable="false" /> */}
                                    {/* <img src={`https://flagcdn.com/48x36/${item.code.toLowerCase()}.png`} alt={item.code} style={{ width: "50px", borderRadius: "30px", overflow: "hidden" }} draggable="false" /> */}
                                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                                </div>
                            ))
                        }
                    </CardBody>
                </Card>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem"
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
                    gap: "12px",
                    padding: "7px 24px",
                    fontSize: "16px"
                }}
                    onClick={() => setSubStep(2)}
                    disabled={!country}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default PaymentCountry;