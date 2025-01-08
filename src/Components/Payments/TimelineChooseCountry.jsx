import React, { useState } from 'react'
import { ArrowRight, Check, ChevronRight, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import { countries } from 'country-list-json'
import ReactFlagsSelect from 'react-flags-select'
import "./styles/button.css"

const TimelineChooseCountry = ({ mobileView, setStepNumber, country, setCountry, src }) => {
    const [completed, setCompleted] = useState(false)
    const [countryError, setCountryError] = useState(false)
    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            icon={<div style={{
                borderRadius: "100%",
                height: "100%",
                width: "100%"
            }}>{completed && <Check />}</div>}
            iconStyle={{
                boxShadow: "none",
                padding: "5px",
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
            }}
            contentStyle={{
                background: "transparent",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: completed && "translateY(-11px)",
                marginLeft: mobileView ? "45px" : "60px"
            }}
        >
            {
                completed
                    ?
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}>
                        <p style={{ margin: 0, padding: 0 }}>{country.name}.</p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
                    :
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Select the country where you want to send money</H4>
                        <div style={{
                            marginTop: "1.5rem",
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap"
                        }}>
                            <div style={{
                                width: "100%",
                                maxWidth: "300px",
                                flex: 1,
                            }}>
                                <ReactFlagsSelect
                                    defaultCountry="US"
                                    searchable={true}
                                    selected={country.code}
                                    onSelect={(e) => {
                                        src(e)
                                        const selectedCountry = countries.filter(item => item.code.toLowerCase() == e.toLowerCase())[0]
                                        setCountry(selectedCountry)
                                        setStepNumber(1)
                                    }}
                                    placeholder="Choose destination country"
                                    style={{ margin: 0 }}
                                />
                                {
                                    countryError
                                    &&
                                    <span style={{ fontSize: ".7rem", color: "red", marginTop: ".3rem" }}>Country is required.</span>
                                }
                            </div>
                            <button className='arrow__btn' style={{ marginTop: ".2rem" }} type='submit' onClick={() => {
                                if (!country) {
                                    setCountryError(true)
                                } else {
                                    setCompleted(true)
                                    setStepNumber(2)
                                }
                            }}>
                                {/* <ArrowRight size={20} /> */}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </>
            }
        </VerticalTimelineElement >
    )
}

export default TimelineChooseCountry