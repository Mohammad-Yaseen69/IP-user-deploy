import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/index.module.scss"
import { Modal, ModalBody } from 'reactstrap'
import back from "./back.png"
import { limitVolume, sourceOfFunds, sourceOfWealth, volume, professions } from './data'
import ContactBox from '../MyMasterCard/PaymentModal/ContactBox'
import { UserContext } from '../../Context/UserContext'
import { countriesInDiffLangs } from '../../Data/CountriesWithTranslations/countries'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import useWindowWidth from '../../utils/useWindowWidth'
import LanguagePicker from '../LanguagePicker'
import { useNavigate } from 'react-router-dom'

const FinancialInfoModal = ({ isOpen, toggle, toggleOnSuccess, setShowSuccessModal }) => {
    const [activeStep, setActiveStep] = useState()
    const [textAreaValue, setTextAreaValue] = useState("")
    const [selectedProfessions, setSelectedProfessions] = useState([])
    const [selectedVolume, setSelectedVolume] = useState("")
    const [selectedTransactionLimit, setSelectedTransactionLimit] = useState("")
    const [selectedCountries, setSelectedCountries] = useState([])
    const [selectedSourceOfFunds, setSelectedSourceOfFunds] = useState("")
    const [selectedSourceOfWealth, setSelectedSourceOfWealth] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const { t } = useTranslation()
    const [loading, setLoading] = useState()
    const { userDetails, authHeader, allowedCountries } = useContext(UserContext)
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleSearch = (query) => {
        setSearchQuery(query)
        if (activeStep === "profession") {
            setFilteredProfessions(
                professions.filter(prof =>
                    prof.toLowerCase().includes(query.toLowerCase())
                )
            )
        } else if (activeStep === "country") {
            setFilteredCountries(
                availableCountries.filter(country =>
                    country.name.toLowerCase().includes(query.toLowerCase())
                )
            )
        }
    }

    const toggleSelection = (item, type) => {
        switch (type) {
            case 'profession':
                setSelectedProfessions(prev =>
                    prev.includes(item)
                        ? prev.filter(p => p !== item)
                        : [...prev, item]
                )
                break;
            case 'country':
                setSelectedCountries(prev =>
                    prev.includes(item)
                        ? prev.filter(c => c !== item)
                        : [...prev, item]
                )
                break;
            case 'volume':
                setSelectedVolume(item)
                break;
            case 'transaction_limit':
                setSelectedTransactionLimit(item)
                break;
            case 'source_of_funds':
                setSelectedSourceOfFunds(item)
                break;
            case 'source_of_wealth':
                setSelectedSourceOfWealth(item)
                break;
            default:
        }
    }



    const handleBack = () => {
        decreaseStep()
        setSearchQuery("")
    }

    const [questions, setQuestions] = useState([
        {
            question: "What keeps you busy these days?",
            info: "Whether you're running a business, freelancing, creating, or simply managing your personal finances — we'd love to hear about you",
            step: 1,
            type: "keeps_busy"
        },
        {
            question: "What best describes your profession?",
            info: "Choose one or more from our full industry list!",
            step: 2,
            type: "profession"
        },
        {
            question: "Expected Monthly Transaction Volume?",
            info: "Estimate how much money will come into your account each month.",
            step: 3,
            type: "volume"
        },
        {
            question: "Expected Number of Transactions per Month?",
            info: "Estimate how much money will come into your account each month.",
            step: 4,
            type: "transaction_limit"
        },
        {
            question: "In Which Countries Will You Send Funds?",
            info: "Select all that apply or search country.",
            step: 5,
            type: "country"
        },
        {
            question: "Source of Funds",
            info: "Where does your money come from?",
            step: 6,
            type: "source_of_funds"
        },
        {
            question: "Source of Wealth",
            info: "How was your wealth accumulated?",
            step: 7,
            type: "source_of_wealth"
        },
        {
            question: "Are you a crypto user?",
            info: "Do you use crypto currency to send or receive your money?",
            step: 8,
            type: "crypto"
        },
    ])

    const [filteredProfessions, setFilteredProfessions] = useState(professions)
    const [filteredCountries, setFilteredCountries] = useState(countriesInDiffLangs[i18next.language])
    const [availableCountries, setAvailableCountries] = useState([])
    const [cryptoCheck, setCryptoCheck] = useState(null)


    useEffect(() => {
        if (Array.isArray(allowedCountries) && allowedCountries.length > 0) {
            setFilteredCountries(
                countriesInDiffLangs[i18next.language].filter(
                    c => allowedCountries.some(c2 => c2.country_iso_code === c.alpha3)
                )
            );
            setAvailableCountries(countriesInDiffLangs[i18next.language].filter(
                c => allowedCountries.some(c2 => c2.country_iso_code === c.alpha3)
            ))
        } else {
            setFilteredCountries(countriesInDiffLangs[i18next.language]);
        }
    }, [allowedCountries, i18next.language]);

    const isNextDisabled = () => {
        switch (activeStep) {
            case "keeps_busy":
                return !textAreaValue.trim();
            case "profession":
                return selectedProfessions.length === 0;
            case "volume":
                return !selectedVolume;
            case "transaction_limit":
                return !selectedTransactionLimit;
            case "country":
                return selectedCountries.length === 0;
            case "source_of_funds":
                return !selectedSourceOfFunds;
            case "source_of_wealth":
                return !selectedSourceOfWealth;
            case "crypto":
                return (cryptoCheck !== true && cryptoCheck !== false)
            default:
                return true;
        }
    };


    const answerHandler = async () => {
        setLoading(true)
        let answer;



        switch (activeStep) {
            case "keeps_busy":
                answer = [textAreaValue];
                break;
            case "profession":
                answer = selectedProfessions;
                break;
            case "volume":
                answer = [selectedVolume];
                break;
            case "transaction_limit":
                answer = [selectedTransactionLimit];
                break;
            case "country":
                answer = selectedCountries;
                break;
            case "source_of_funds":
                answer = [selectedSourceOfFunds];
                break;
            case "source_of_wealth":
                answer = [selectedSourceOfWealth];
                break;
            case "crypto":
                answer = [cryptoCheck]
                break;
            default:
                answer = "";
        }
        try {
            const data = {
                account_id: userDetails?._id,
                question_key: activeStep,
                answers: answer
            }


            console.log(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/user/add-financial-answer`, { data: encryptData(data) }, {
                headers: authHeader
            })

            console.log(res)
            if (checkForLast() && questions.length === 1) {
                toggleOnSuccess()
                setShowSuccessModal(true)
            }
            else {
                if (checkForLast()) {
                    setActiveStep(questions[0].type)
                }
                else {
                    increaseStep()
                }
            }


            setQuestions(prev => prev.filter(q => q.type !== activeStep))
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message || t("Something went wrong while adding your answer"))
        }
        finally {
            setLoading(false)
        }
    }

    const increaseStep = () => {
        const lastIndex = questions.length - 1;
        const currentIndex = questions.findIndex(q => q.type === activeStep)

        if (currentIndex < lastIndex) {
            setActiveStep(questions[currentIndex + 1].type)
        }
    }

    const decreaseStep = () => {
        const currentIndex = questions.findIndex(q => q.type === activeStep)

        if (currentIndex > 0) {
            console.log("asfdasf")
            setActiveStep(questions[currentIndex - 1].type)
        }
    }

    const checkForLast = () => {
        const lastIndex = questions.length - 1;
        const currentIndex = questions.findIndex(q => q.type === activeStep)

        return currentIndex === lastIndex
    }


    const checkForFirst = () => {
        const currentIndex = questions.findIndex(q => q.type === activeStep)
        return currentIndex === 0
    }

    useEffect(() => {
        console.log(userDetails)
        if (
            userDetails &&
            userDetails.user &&
            Array.isArray(userDetails.user.financial_answers)
        ) {
            let filteringQuestions = [...questions]
            filteringQuestions = filteringQuestions.filter(q => !userDetails?.user?.financial_answers?.some(a => a.question_key === q?.type))
            setQuestions(filteringQuestions)
            setActiveStep(filteringQuestions[0]?.type)
        }
    }, [userDetails])
    const width = useWindowWidth()



    const rightContent = (isMobile) => (
        <div className={styles.right}>
            <div className={styles.contentContainer}>
                <div style={{ padding: isMobile && "24px 24px 0 24px" }} className={styles.headerInfo}>
                    {!isMobile && <span>{t("Step")} {questions.findIndex(q => q.type === activeStep) + 1}</span>}
                    {!isMobile && <h2>{t(questions.find(q => q.type === activeStep)?.question)}</h2>}
                    <p>{t(questions.find(q => q.type === activeStep)?.info)}</p>
                </div>
                <div style={{ padding: activeStep === "keeps_busy" && "20px", paddingTop: isMobile && "5px" }} className={styles.content}>
                    {activeStep === "keeps_busy" && (
                        <div style={{ position: 'relative', width: '100%' }}>
                            <textarea
                                value={textAreaValue}
                                onChange={(e) => setTextAreaValue(e.target.value)}
                                placeholder={t('Type your answer')}
                                maxLength={250}
                                style={{ width: '100%', height: '120px', resize: 'none' }}
                            />
                            <span style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '12px', color: '#888' }}>
                                {textAreaValue.length} / 250
                            </span>
                        </div>
                    )}

                    {activeStep !== "keeps_busy" &&
                        <div className={styles.options}>
                            {(activeStep === "profession" || activeStep === "country") &&
                                <div style={{ justifyContent: "flex-start", gap: "12px" }} className={styles.option}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <g clipPath="url(#clip0_5690_3736)">
                                            <path d="M10.5 10.5L8.75005 8.75M10 5.75C10 8.09721 8.09721 10 5.75 10C3.40279 10 1.5 8.09721 1.5 5.75C1.5 3.40279 3.40279 1.5 5.75 1.5C8.09721 1.5 10 3.40279 10 5.75Z" stroke="#A4A4A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_5690_3736">
                                                <rect width="12" height="12" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <input
                                        placeholder={t('Search')}
                                        type="text"
                                        style={{ border: "none", background: "transparent", outline: "none" }}
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            }
                            {activeStep === "profession" && filteredProfessions.map((text, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.option} ${selectedProfessions.includes(text) ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text, 'profession')}
                                >
                                    <span>{t(text)}</span>
                                </div>
                            ))}
                            {activeStep === "volume" && volume.map((text, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.option} ${selectedVolume === text ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text, 'volume')}
                                >
                                    <span>{t(text)}</span>
                                </div>
                            ))}
                            {activeStep === "transaction_limit" && limitVolume.map((text, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.option} ${selectedTransactionLimit === text ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text, 'transaction_limit')}
                                >
                                    <span>{t(text)}</span>
                                </div>
                            ))}
                            {activeStep === "country" && filteredCountries.map((text, idx) => (
                                <div
                                    key={idx}
                                    style={{ justifyContent: "flex-start", gap: '8px' }}
                                    className={`${styles.option} ${selectedCountries.includes(text.alpha3) ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text.alpha3, 'country')}
                                >
                                    <img src={text.file_url} style={{ width: "30px", borderRadius: "3px" }} alt="" />
                                    <span>{t(text.name)}</span>
                                </div>
                            ))}
                            {activeStep === "source_of_funds" && sourceOfFunds.map((text, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.option} ${selectedSourceOfFunds === text ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text, 'source_of_funds')}
                                >
                                    <span>{t(text)}</span>
                                </div>
                            ))}
                            {activeStep === "source_of_wealth" && sourceOfWealth.map((text, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.option} ${selectedSourceOfWealth === text ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(text, 'source_of_wealth')}
                                >
                                    <span>{t(text)}</span>
                                </div>
                            ))}

                            {activeStep === "crypto" &&
                                <div style={{ padding: "0px" }} className={styles.options}>
                                    <div onClick={() => setCryptoCheck(true)} style={{ justifyContent: "flex-start", gap: "10px" }} className={`${styles.option} ${cryptoCheck === true && styles.checked}`}>
                                        <span className={styles.circle}>
                                            {cryptoCheck === true && <span></span>}
                                        </span>
                                        <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "0px" }}>
                                            {t("Yes")}
                                        </p>
                                    </div>
                                    <div onClick={() => setCryptoCheck(false)} style={{ justifyContent: "flex-start", gap: "10px" }} className={`${styles.option}  ${cryptoCheck === false && styles.checked}`}>
                                        <span className={styles.circle}>
                                            {cryptoCheck === false && <span></span>}
                                        </span>
                                        <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "0px" }}>
                                            {t("No")}
                                        </p>
                                    </div>
                                </div>
                            }


                        </div>
                    }
                </div>
            </div>
            <div className={styles.buttons}>
                <ContactBox style={{ padding: width < 500 && "0px" }} />

                <div className={styles.btns}>
                    {!checkForFirst() && (
                        <button className={styles.back} onClick={handleBack}>
                            {t("Back")}
                        </button>
                    )}
                    <button
                        disabled={isNextDisabled() || loading}
                        className={styles.next}
                        onClick={answerHandler}
                        style={{ opacity: (isNextDisabled() || loading) && 0.4 }}
                    >
                        {t("Add")}
                        {width > 500 &&
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                    </button>
                </div>
            </div>
        </div >
    )
    return (
        <>
            <Modal style={{ minWidth: width > 1100 && "1100px" }} isOpen={isOpen}>
                <ModalBody style={{ padding: width > 500 ? "12px" : "0px", background: "#E5E5E5" }} >
                    {width > 1100 ?
                        (
                            <div className={styles.container}>
                                <div style={{ backgroundImage: `url(${back})` }} className={styles.left}>
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "15px", width: "100%" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                            <div>
                                                {toggle
                                                    &&
                                                    <p onClick={toggle} style={{ fontSize: "10px", fontWeight: 600, color: 'white', marginBottom: '10px', cursor: "pointer" }}>{t("Cancel")}</p>
                                                }
                                                <span className={styles.label}>{t("Individual")}</span>
                                            </div>


                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <LanguagePicker backgroundWhite={true} />
                                                <button onClick={handleLogout} style={{ background: 'white', border: 'none', color: 'black', cursor: 'pointer', borderRadius: "10px", padding: ".5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h1>{t("Tell us more about you")}..</h1>
                                    </div>
                                    <div style={{ minHeight: '550px', zIndex: 1 }} className={styles.questions}>
                                        {questions.map((question, index) => (
                                            <div onClick={() => setActiveStep(question?.type)} style={{ opacity: question.type !== activeStep && 0.3, width: width < 1100 && "90%", flexShrink: "0" }} key={index} className={styles.question}>
                                                <div>
                                                    <span>
                                                        {t("Step")} {index + 1}
                                                    </span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M6 12L10 8L6 4" stroke="#5D5D5D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>
                                                </div>
                                                <h4>{t(question.question)}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {rightContent()}
                            </div>
                        ) :
                        (
                            <div style={{ gridTemplateColumns: "1fr" }} className={styles.container}>
                                <div style={{ backgroundImage: `url(${back})` }} className={styles.left}>
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "15px", width: "100%" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                            <div>
                                                {toggle
                                                    &&
                                                    <p onClick={toggle} style={{ fontSize: "10px", fontWeight: 600, color: 'white', marginBottom: '10px', cursor: "pointer" }}>{t("Cancel")}</p>
                                                }
                                                <span className={styles.label}>{t("Individual")}</span>
                                            </div>


                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <LanguagePicker backgroundWhite={true} />
                                                <button onClick={handleLogout} style={{ background: 'white', border: 'none', color: 'black', cursor: 'pointer', borderRadius: "10px", padding: ".5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h1>{t("Tell us more about you")}..</h1>
                                    </div>
                                    <div style={{ padding: "0px", background: "transparent", zIndex: 1 }} className={styles.questions}>
                                        {questions.map((question, index) => (
                                            <React.Fragment key={index}>
                                                <div
                                                    onClick={() => setActiveStep(question?.type)}
                                                    style={{ opacity: question.type !== activeStep && 0.3 }}
                                                    className={styles.question}
                                                >
                                                    <div>
                                                        <span>
                                                            {t("Step")} {index + 1}
                                                        </span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M6 12L10 8L6 4" stroke="#5D5D5D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <h4>{t(question.question)}</h4>
                                                </div>
                                                {activeStep === question.type && (
                                                    <div style={{ width: "100%", }}>
                                                        {rightContent("mobile")}
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </ModalBody>
            </Modal>
        </>
    )
}

export default FinancialInfoModal
