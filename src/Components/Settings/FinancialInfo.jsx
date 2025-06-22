import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/FinInfo.module.scss"
import CitiesData from "../CitiesDropDown/CitiesData.json"
import { ChevronRight } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'

const FinancialInfo = () => {
    const [questions, setQuestions] = useState([
        {
            question: "What keeps you busy these days?",
            info: "Whether you're running a business, freelancing, creating, or simply managing your personal finances — we'd love to hear about you!",
            step: 1,
            answer: "",
            type: "keeps_busy"
        },
        {
            question: "What best describes your profession?",
            info: "Choose one or more from our full industry list!",
            step: 2,
            answer: [],
            type: "profession"
        },
        {
            question: "Expected Monthly Transaction Volume?",
            info: "Estimate how much money will come into your account each month.",
            step: 3,
            answer: "",
            type: "volume"
        },
        {
            question: "Expected Number of Transactions per Month?",
            info: "Estimate how much money will come into your account each month.",
            step: 4,
            answer: "",
            type: "transaction_limit"
        },
        {
            question: "In Which Countries Will You Send Funds?",
            info: "Select all that apply or search country.",
            step: 5,
            answer: [],
            type: "country"
        },
        {
            question: "Source of Funds",
            info: "Where does your money come from?",
            step: 6,
            answer: "",
            type: "source_of_funds"
        },
        {
            question: "Source of Wealth",
            info: "How was your wealth accumulated?",
            step: 7,
            answer: "",
            type: "source_of_wealth"
        }
    ])
    const [countriesWithRegion, setCountriesWithRegion] = useState({})
    const [filteredCountriesWithRegion, setFilteredCountriesWithRegion] = useState({})
    const [activeDropdown, setActiveDropdown] = useState(0)
    const [search, setSearch] = useState()
    const { userDetails } = useContext(UserContext)
    const { t } = useTranslation()



    useEffect(() => {
        const countryFilteration = () => {
            const countryAnswers = questions.find(q => q?.type === "country")
            const filteredCountries = CitiesData.filter(cont => countryAnswers?.answer?.includes(cont?.iso3))
            const regionCountries = filteredCountries?.reduce((acc, country) => {
                const region = country?.region
                if (!acc[region]) {
                    acc[region] = []
                }
                acc[region].push(country)
                return acc
            }, {})

            setCountriesWithRegion(regionCountries)

            console.log(regionCountries, "with region")
        }

        countryFilteration()
    }, [CitiesData, questions])

    useEffect(() => {
        if (search?.trim()) {
            const filteredRegions = Object.entries(countriesWithRegion)?.reduce((acc, [region, countries]) => {
                const filteredCountries = countries?.filter(country =>
                    country?.name?.toLowerCase().includes(search?.toLowerCase())
                )

                if (filteredCountries?.length > 0) {
                    acc[region] = filteredCountries
                }
                return acc
            }, {})

            setFilteredCountriesWithRegion(filteredRegions)
        } else {
            setFilteredCountriesWithRegion(countriesWithRegion)
        }
    }, [search, countriesWithRegion])

    useEffect(() => {
        if (userDetails) {
            setQuestions(questions.filter(q => userDetails?.user?.financial_answers?.some(a => a?.question_key === q?.type))?.map((answer) => {
                const userAnswer = userDetails?.user?.financial_answers?.find(a => a?.question_key === answer?.type)
                return userAnswer ? { ...answer, answer: userAnswer?.answers } : answer
            }))

            console.log(userDetails?.user)
        }
    }, [userDetails])
    return (
        <div style={{ backgroundColor: 'white' }} className={styles.container}>

            {questions?.map((question, idx) => (
                <div key={idx} className={styles.contentBox}>
                    <span className={styles.label}>{t(question?.question)}</span>

                    {(question?.type !== "profession" && question?.type !== "country" && question?.type !== "keeps_busy") &&
                        <div className={styles.option}>
                            <span>
                                {t(question?.answer)}
                            </span>
                        </div>
                    }
                    {question?.type === "keeps_busy" && <textarea value={question?.answer} />}
                    {question?.type === "profession" &&
                        <div className={styles.multiOptions}>
                            {question?.answer?.map((item, idx2) => (
                                <div key={idx2} style={{ flex: 1, minWidth: "45%" }} className={styles.option}>
                                    <span>
                                        {t(item)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    }
                    {question?.type === "country" &&
                        <div className={styles.countryOptions}>
                            <div className={`${styles.option} ${styles.inputBox}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <g clip-path="url(#clip0_5081_2957)">
                                        <path d="M10.5 10.5L8.75005 8.75M10 5.75C10 8.09721 8.09721 10 5.75 10C3.40279 10 1.5 8.09721 1.5 5.75C1.5 3.40279 3.40279 1.5 5.75 1.5C8.09721 1.5 10 3.40279 10 5.75Z" stroke="#A4A4A4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_5081_2957">
                                            <rect width="12" height="12" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>

                                <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder='Search...' style={{ border: "none", outline: "none", background: "transparent", fontWeight: 600 }} />
                            </div>

                            <div className={styles.dropDownCont}>
                                {Object.entries(filteredCountriesWithRegion)?.map(([region, countries], idx) =>
                                    <div key={idx} className={`${styles.dropdown} ${activeDropdown !== idx && styles.hide}`}>
                                        <div onClick={() => setActiveDropdown(idx)} className={styles.head}>
                                            <span>{t(region)}</span>

                                            <ChevronRight style={{ transition: '0.3s', transform: activeDropdown === idx && "rotate(90deg)" }} />
                                        </div>
                                        <div className={styles.countries}>
                                            {countries?.map((cont, i) => (
                                                <div key={i} className={styles.option}>
                                                    <span>{t(cont?.name)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>
            ))}

        </div>
    )
}

export default FinancialInfo
