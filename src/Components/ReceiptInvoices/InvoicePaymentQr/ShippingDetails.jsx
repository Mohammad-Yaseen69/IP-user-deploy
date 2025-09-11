import React, { useMemo } from 'react'
import CountryDropDown from '../../AddBeneficiary/CountryDropDown'
import CitiesDropDown from '../../CitiesDropDown'
import { State } from 'country-state-city'
import iso2 from "../../AddFunds/WalletFund/countries_iso2.json"

const ShippingDetails = ({ data, dataHandler }) => {
    const stateData = useMemo(() => {
        if (data.shippingDetails?.country?.iso) {
            return State.getStatesOfCountry(iso2[data.shippingDetails?.country?.iso?.toUpperCase()])
        }


    }, [data.shippingDetails?.country?.iso])


    return (
        <form action="">
            <div style={{ display: "grid", gap: "12px", width: "100%" }}>
                <label style={{ marginBottom: "0px", fontWeight: 600 }}>Country</label>
                <CountryDropDown
                    onSelect={(selectedCountry) => {
                        if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
                            selectedCountry.name = "Bolivia, Plurinational State of bolivia"
                        }
                        dataHandler("shippingDetails", {
                            ...data.shippingDetails,
                            country: {
                                name: selectedCountry?.name,
                                iso: selectedCountry?.alpha3
                            },
                            city: "",
                            state: ""
                        })
                    }}
                    country={data.shippingDetails?.country?.iso}
                    invoice={true}
                    background='#f6f6f6'
                />

                <label style={{ marginBottom: "0px", fontWeight: 600 }}>City</label>
                <CitiesDropDown
                    country={data.shippingDetails?.country?.iso}
                    isState={false}
                    setUserCity={v => dataHandler("shippingDetails", { ...data.shippingDetails, city: v })}
                    userCity={data.shippingDetails?.city}
                    iso_3={data.shippingDetails?.country?.iso}
                    background='#f6f6f6'
                />

                <label style={{ marginBottom: "0px", fontWeight: 600 }}>State</label>
                <CitiesDropDown
                    country={data.shippingDetails?.country?.iso}
                    isState={true}
                    setUserCity={v => dataHandler("shippingDetails", { ...data.shippingDetails, state: v })}
                    userCity={data.shippingDetails?.state}
                    stateData={stateData}
                    background='#f6f6f6'
                    title='Select State'
                    iso_3={data.shippingDetails?.country?.iso}
                />

                <label style={{ marginBottom: "0px", fontWeight: 600 }}>House No</label>
                <input
                    type="text"
                    value={data.shippingDetails?.houseNo || ""}
                    onChange={(e) => dataHandler("shippingDetails", { ...data.shippingDetails, houseNo: e.target.value })}
                    style={{ width: "100%", border: "1px solid rgba(0,0,0,.06)", borderRadius: "5px", padding: ".75rem", backgroundColor: "#f6f6f6" }}
                />

                <label style={{ marginBottom: "0px", fontWeight: 600 }}>Street</label>
                <input
                    type="text"
                    value={data.shippingDetails?.street || ""}
                    onChange={(e) => dataHandler("shippingDetails", { ...data.shippingDetails, street: e.target.value })}
                    style={{ width: "100%", border: "1px solid rgba(0,0,0,.06)", borderRadius: "5px", padding: ".75rem", backgroundColor: "#f6f6f6" }}
                />

                <label style={{ marginBottom: "0px", fontWeight: 600 }}>Zip Code</label>
                <input
                    type="text"
                    value={data.shippingDetails?.zipCode || ""}
                    onChange={(e) => dataHandler("shippingDetails", { ...data.shippingDetails, zipCode: e.target.value })}
                    style={{ marginBottom: "0px", width: "100%", border: "1px solid rgba(0,0,0,.06)", borderRadius: "5px", padding: ".75rem", backgroundColor: "#f6f6f6" }}
                />
            </div>
        </form>
    )
}

export default ShippingDetails
