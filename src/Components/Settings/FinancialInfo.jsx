import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/FinInfo.module.scss"
import CitiesData from "../CitiesDropDown/CitiesData.json"
import { Check, ChevronRight } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import Select from "react-select"
import { sourceOfFunds, sourceOfWealth, volume, limitVolume, professions } from '../FinancialInfoModal/data.js'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'


const questionsArray = [
    {
        question: "What keeps you busy these days?",
        info: "Whether you're running a business, freelancing, creating, or simply managing your personal finances — we'd love to hear about you!",
        answers: "",
        question_key: "keeps_busy"
    },
    {
        question: "What best describes your profession?",
        info: "Choose one or more from our full industry list!",
        answers: [],
        question_key: "profession"
    },
    {
        question: "Expected Monthly Transaction Volume?",
        info: "Estimate how much money will come into your account each month.",
        answers: "",
        question_key: "volume"
    },
    {
        question: "Expected Number of Transactions per Month?",
        info: "Estimate how much money will come into your account each month.",
        answers: "",
        question_key: "transaction_limit"
    },
    {
        question: "In Which Countries Will You Send Funds?",
        info: "Select all that apply or search country.",
        answers: [],
        question_key: "country"
    },
    {
        question: "Source of Funds",
        info: "Where does your money come from?",
        answers: "",
        question_key: "source_of_funds"
    },
    {
        question: "Source of Wealth",
        info: "How was your wealth accumulated?",
        answers: "",
        question_key: "source_of_wealth"
    },
    {
        question: "Are you a crypto user?",
        info: "Do you use crypto currency to send or receive your money?",
        question_key: "crypto",
        answers: null
    },
]

const FinancialInfo = () => {
    const [questions, setQuestions] = useState(questionsArray)
    const [countriesWithRegion, setCountriesWithRegion] = useState({})
    const [filteredCountriesWithRegion, setFilteredCountriesWithRegion] = useState({})
    const [activeDropdown, setActiveDropdown] = useState(1)
    const [search, setSearch] = useState()
    const { userDetails, allowedCountries, authHeader } = useContext(UserContext)
    const { t } = useTranslation()
    const [editMode, setEditMode] = useState(false)
    const [apiQuestions, setApiQuestions] = useState(questionsArray)
    const [loading, setLoading] = useState(false)



    useEffect(() => {
        const countryFilteration = () => {
            const countryAnswers = questions.find(q => q?.question_key === "country")
            const filteredCountries = editMode ? CitiesData.filter(cont => allowedCountries?.find(c => c.country_iso_code === cont.iso3)) : CitiesData.filter(cont => countryAnswers?.answers?.includes(cont?.iso3))
            const regionCountries = filteredCountries?.reduce((acc, country) => {
                const region = country?.region
                if (!acc[region]) {
                    acc[region] = []
                }
                acc[region].push(country)
                return acc
            }, {})

            setCountriesWithRegion(regionCountries)

        }

        countryFilteration()
    }, [CitiesData, questions, editMode])

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
            let filterations = questionsArray.filter(q => userDetails?.user?.financial_answers?.some(a => a?.question_key === q?.question_key))?.map((answers) => {
                const userAnswer = userDetails?.user?.financial_answers?.find(a => a?.question_key === answers?.question_key)
                return userAnswer ? { ...answers, answers: userAnswer?.answers } : answers
            })

            filterations = filterations.map((q) => q.question_key === "crypto" ? { ...q, answers: q.answers[0] === "false" ? false : true } : q)
            setQuestions(filterations)
            setApiQuestions(filterations)

            console.log(userDetails?.user)
        }
    }, [userDetails])

    const updateData = (field, value,) => {
        if (field === "country") {
            setQuestions(questions.map(q => q.question_key === field ? { ...q, answers: [...q.answers, value] } : q))
        } else {
            setQuestions(questions.map(q => q.question_key === field ? { ...q, answers: value } : q))
        }
    }

    const selectOptions = {
        source_of_funds: sourceOfFunds.map(opt => ({ label: opt, value: opt })),
        source_of_wealth: sourceOfWealth.map(opt => ({ label: opt, value: opt })),
        volume: volume.map(opt => ({ label: opt, value: opt })),
        transaction_limit: limitVolume.map(opt => ({ label: opt, value: opt })),
        profession: professions.map(opt => ({ label: opt, value: opt })),
    }

    const saveHandler = async () => {
        setLoading(true)
        try {
            const data = {
                answers: questions,
                account_id: userDetails?._id
            }


            console.log(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/user/update-financial-answers`, { data: encryptData(data) }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setEditMode(false)
            setApiQuestions(questions)
            console.log(dec)

        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message || "We couldn't edit your financial info at the moment please try again later.")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ backgroundColor: 'white' }} className={styles.container}>
            {!editMode && <button onClick={() => setEditMode(true)} className={styles.editBtn}>{t("Edit")}</button>}
            {questions?.map((question, idx) => (
                <div key={idx} className={styles.contentBox}>
                    <span className={styles.label}>{t(question?.question)}</span>

                    {(question?.question_key !== "profession" && question?.question_key !== "country" && question?.question_key !== "keeps_busy" && question?.question_key !== "crypto") &&
                        (
                            !editMode ?
                                <div className={styles.option}>
                                    <span>
                                        {t(question?.answers)}
                                    </span>
                                </div>
                                :
                                (Select &&
                                    <Select
                                        options={selectOptions[question.question_key]}
                                        value={
                                            selectOptions[question.question_key]?.find(opt => opt.value === question.answers) ||
                                            (question.answers && typeof question.answers === 'string' && selectOptions[question.question_key]?.some(opt => opt.value === question.answers) === false ? { label: question.answers, value: question.answers } : null)
                                        }
                                        styles={{
                                            container: (base) => ({ ...base, width: '100%', outline: "none" }),
                                            control: (base) => ({ ...base, fontWeight: 600 }),
                                        }}
                                        onChange={option => updateData(question.question_key, option ? option.value : "")}
                                    />
                                )
                        )
                    }
                    {question?.question_key === "keeps_busy" &&
                        <div style={{ position: "relative", width: "100%" }}>
                            <textarea
                                onChange={(e) => editMode ? updateData("keeps_busy", e.target.value) : e.preventDefault()}
                                value={question?.answers}
                                placeholder={t('Type your answer')}
                                maxLength={250}
                                style={{ width: '100%', height: '120px', resize: 'none' }}
                            />
                            {editMode &&
                                <span style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '12px', color: '#888' }}>
                                    {questions.find(q => q.question_key === "keeps_busy").answers?.length}{" / 250"}
                                </span>
                            }
                        </div>
                    }
                    {question?.question_key === "profession" &&
                        (!editMode ?
                            <div style={{ flexDirection: window.innerWidth < 700 && "column" }} className={styles.multiOptions}>
                                {Array.isArray(question.answers) && question?.answers?.map((item, idx2) => (
                                    <div key={idx2} style={{ flex: 1, minWidth: "45%" }} className={styles.option}>
                                        <span>
                                            {t(item)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            :
                            (Select &&
                                <Select
                                    options={selectOptions.profession}
                                    value={selectOptions.profession.filter(opt => Array.isArray(question.answers) && question.answers.includes(opt.value))}
                                    onChange={options => updateData("profession", options ? options.map(opt => opt.value) : [])}
                                    isMulti
                                    styles={{
                                        container: (base) => ({ ...base, width: '100%' }),
                                        control: (base) => ({ ...base, fontWeight: 600 })
                                    }}
                                />
                            )
                        )
                    }
                    {question?.question_key === "country" &&
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

                                <input value={search} onChange={(e) => setSearch(e.target.value)} question_key="text" placeholder={t('Search...')} style={{ border: "none", outline: "none", background: "transparent", fontWeight: 600 }} />
                            </div>

                            <div className={styles.dropDownCont}>
                                {Object.entries(filteredCountriesWithRegion)?.map(([region, countries], idx) => (
                                    <div style={{ overflow: "auto" }} key={`${idx}-${region}`} className={styles.dropdown}>
                                        <div
                                            className={styles.head}
                                            onClick={() => setActiveDropdown(activeDropdown === idx + 1 ? null : idx + 1)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span>{t(region)}</span>
                                            <ChevronRight
                                                style={{
                                                    transition: '0.3s',
                                                    transform: activeDropdown === idx + 1 ? "rotate(90deg)" : undefined
                                                }}
                                            />
                                        </div>
                                        {activeDropdown === idx + 1 && (
                                            <div className={styles.countries}>
                                                {countries?.map((cont, i) => (
                                                    <div
                                                        onClick={() => updateData("country", cont.iso3)}
                                                        key={i}
                                                        className={styles.option}
                                                        style={
                                                            {
                                                                display: "flex",
                                                                justifyContent: 'space-between',
                                                                alignItems: "center",
                                                                borderColor: !question.answers.includes(cont.iso3) && "transparent"
                                                            }
                                                        }
                                                    >
                                                        <span>{t(cont?.name)}</span>
                                                        {question.answers.includes(cont.iso3) && <Check width={15} />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    }

                    {question?.question_key === "crypto" &&
                        (!editMode ?
                            <div className={`${styles.option}`}>
                                <span>
                                    {question.answers === true
                                        ? t("Yes")
                                        : question.answers === false
                                            ? t("No")
                                            : ""}
                                </span>
                            </div>
                            :
                            <div className={styles.multiOptions}>
                                <div onClick={() => updateData("crypto", true)} style={{ justifyContent: "flex-start", gap: "10px", width: "100%" }} className={`${styles.option} ${question.answers === true && styles.checked}`}>
                                    <span className={styles.circle}>
                                        {question.answers === true && <span></span>}
                                    </span>
                                    <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "0px" }}>
                                        {t("Yes")}
                                    </p>
                                </div>
                                <div onClick={() => updateData("crypto", false)} style={{ justifyContent: "flex-start", gap: "10px", width: "100%" }} className={`${styles.option}  ${question.answers === false && styles.checked}`}>
                                    <span className={styles.circle}>
                                        {question.answers === false && <span></span>}
                                    </span>
                                    <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "0px" }}>
                                        {t("No")}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                </div>
            ))}


            {editMode &&
                <div style={{ display: "flex", gap: "1rem", marginTop: "4rem" }}>
                    <button
                        onClick={() => {
                            setEditMode(false)
                            setQuestions(apiQuestions)
                        }}
                        style={{ fontWeight: 600, background: "transparent", border: "none", outline: "none" }}
                    >{t("Cancel")}</button>
                    <button
                        onClick={saveHandler}
                        disabled={
                            questions.some(q => q.answers === "" || q.answers === undefined || q.answers === null || q.answers.length === 0) || loading
                        }
                        style={{ opacity: (questions.some(q => q.answers === "" || q.answers === undefined || q.answers === null || q.answers.length === 0) || loading) && .3 }}
                        className={styles.editBtn}>{t("Save")}</button>
                </div>
            }
        </div >
    )
}

export default FinancialInfo
