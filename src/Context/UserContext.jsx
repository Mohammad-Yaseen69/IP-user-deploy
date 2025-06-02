import axios from "axios";
import { useEffect, useState } from "react";
import { createContext } from "react";
import { decryptData } from "../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../Helper/EssentilaMethods/Encryption";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { publicRoutes } from "../RouteNew/Routes";
import questionsData from "../Components/Settings/questions.json"
import Modal from "../Components/SessionExpireModal"

axios.defaults.timeout = 10000;
axios.defaults.timeoutErrorMessage = "Server Timeout."
axios.defaults.withCredentials = true


// axios.interceptors.response.use(
//     response => {
//         return response
//     },
//     error => {
//         if (error.message === "Server Timeout." && error?.config?.url?.toLowerCase()?.includes("fontawesomev23")) {
//             toast.error("Request timed out. Please try again!");
//         }
//         const message = decryptData(error.response.data.data)
//         if (error.response.status === 401 && message.message === "Unauthorize to access this route.") {
//             window.history.replaceState(null, null, `?show_logout_modal=unauthorized`)
//             showLogoutModal = true
//         }
//         return Promise.reject(error);
//     }
// );

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.crossOrigin = url
        image.addEventListener('error', (error) => reject(error))
        image.src = url
    })


export const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg')
    })
}

export const UserContext = createContext(null)

const UserState = ({ children }) => {
    console.log(`%c Dear User, Please be aware that copying and pasting code or commands directly into your console(in this section) can pose significant security risks. Malicious code can compromise your account, steal sensitive information, or damage your system. \nFor your safety, never paste commands from untrusted or unknown sources.\nThank you for your attention to this matter.\nSincerely,\nInstaPay`, 'color: white; font-size: 20px; font-weight: 500; background: linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%); padding: .5rem; border-radius: 5px;');

    const checkBusinessBeneficiary = async (email) => {
        const data = { email }
        if (email) {
            const encrypted = encryptData(data)
            try {
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/account-check/business`, {
                    data: encrypted
                })
                return decryptData(res.data.data).status
            } catch (error) {
                return decryptData(error.response.data.data).status
            }
        }
    }

    const checkIndividualBeneficiary = async (email, phone) => {
        const data = { email, phone }
        if (email && phone) {
            const encrypted = encryptData(data)
            try {
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/account-check/individual`, {
                    data: encrypted
                })
                return decryptData(res.data.data).status
            } catch (error) {
                return decryptData(error.response.data.data).status
            }
        }
    }


    const token = localStorage.getItem("token")
    const [userDetails, setUserDetails] = useState(null)
    const [userWallets, setUserWallets] = useState([])
    const [beneficiaries, setBeneficiaries] = useState([])
    const [registeredBeneficiaries, setRegisteredBeneficiaries] = useState([])
    const [userTransactions, setUserTransactions] = useState([])
    const [userSecurityQues, setUserSecurityQues] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [apiDates, setApiDates] = useState(null)
    const [referralLink, setReferralLink] = useState("")
    const [userSessions, setUserSessions] = useState([])
    const [allowedFeatures, setAllowedFeatures] = useState(null)
    const [userWithdrawals, setUserWithdrawals] = useState(undefined)
    const [allowedWithdrawals, setAllowedWithdrawals] = useState(null)
    const [allowedCountries, setAllowedCountries] = useState([])
    const [userPortfolio, setUserPortfolio] = useState([])
    const [userVideos, setUserVideos] = useState([])
    const [profileCompleted, setProfileCompleted] = useState(null)
    const [profileCompletedPercentage, setProfileCompletedPercentage] = useState(0)
    const [profileIncompleteReason, setProfileIncompleteReason] = useState("")
    const [showModalState, setShowModalState] = useState(false)
    const navigate = useNavigate()
    const [croppedImages, setCroppedImages] = useState({
        profileDP: "",
        profileBanner: "",
        paDP: "",
        paBanner: "",
    })
    const [pAddressData, setPAddressData] = useState({})
    const [missingTabsData, setMissingTabsData] = useState([])

    const authHeader = {
        "Authorization": `Bearer ${token}`,
        "source": "user"
    }



    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (
                    error.response?.status === 401 &&
                    decryptData(error.response.data.data).message === "Unauthorize to access this route."
                ) {
                    window.history.replaceState(null, null, `?show_logout_modal=unauthorized`);
                    setShowModalState(true);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);



    const [profileLockTIme, setProfileLockTime] = useState(0)
    useEffect(() => {
        if (profileLockTIme > 0) {
            const timeout = setTimeout(() => {
                setProfileLockTime(prev => prev - 1);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [profileLockTIme]);

    const clearData = () => {
        setUserDetails(null)
        setUserWallets([])
        setBeneficiaries([])
        setRegisteredBeneficiaries([])
        setUserTransactions([])
        setUserSecurityQues([])
        setSearchQuery("")
        setApiDates(null)
        setReferralLink("")
        setUserSessions([])
        setAllowedFeatures(null)
        setUserWithdrawals([])
        setAllowedWithdrawals(null)
        setUserPortfolio([])
        setProfileCompleted(null)
        setProfileCompletedPercentage(0)
        setProfileIncompleteReason("")
    }

    const getImage = async (dp, c, type, name) => {
        const croppedImage = await getCroppedImg(dp, c)
        const imgUrl = URL.createObjectURL(croppedImage);

        if (type === "profile") {
            if (name === "dp") {
                setCroppedImages(prev => ({ ...prev, profileDP: imgUrl }))
                // setCoordinates(prev => ({ ...prev, profileDP: c }))
            }
            else {
                setCroppedImages(prev => ({ ...prev, profileBanner: imgUrl }))
                // setCoordinates(prev => ({ ...prev, profileBanner: c }))
            }
        }
        else {
            if (name === "dp") {
                setCroppedImages(prev => ({ ...prev, paDP: imgUrl }))
                // setCoordinates(prev => ({ ...prev, paDp: c }))
            }
            else {
                setCroppedImages(prev => ({ ...prev, paBanner: imgUrl }))
            }
        }
    }

    const updateCoordinates = (type, name, coordinates) => {
        if (type === "profile") {
            if (name === "dp") {
                getImage(userDetails?.profileImage?.url, coordinates, "profile", "dp")
            }
            else {
                getImage(userDetails?.coverImage?.url, coordinates, "profile", "cover")
            }
        }
        else {
            if (name === "dp") {
                getImage(pAddressData?.profileImage?.url, coordinates, "pa", "dp")
            }
            else {
                console.log(pAddressData?.coverImage?.url)
                getImage(pAddressData?.coverImage?.url, coordinates, "pa", "cover")
            }
        }
    }


    const verifyToken = () => {
        if (!window.location.pathname.includes("auth")) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/auth/${token}`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserDetails(decrypted)
                    if (!decrypted?.country?.status) {
                        sessionStorage.setItem("country_status_error", "Service not available in your country!")
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        clearData()
                        navigate("/login")
                    }
                    if (decrypted?.status !== "active") {
                        toast.error("Account Suspended!")
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        clearData()
                        navigate("/login")
                    }
                    if (decrypted.profileImage?.coordinates) {
                        getImage(decrypted.profileImage?.url, decrypted.profileImage?.coordinates, "profile", "dp")
                    }
                    if (decrypted.coverImage?.coordinates) {
                        getImage(decrypted.coverImage?.url, decrypted.coverImage?.coordinates, "profile", "cover")
                    }

                    if (!decrypted?.tfa) {
                        setMissingTabsData(prev => prev.includes("tfa") ? prev : [...prev, "tfa"]);
                    }
                    if ((decrypted?.user?.kyc_status === "declined" || !decrypted.user?.kyc_status)) {
                        setMissingTabsData(prev => prev.includes("kyc") ? prev : [...prev, "kyc"]);
                    }
                    if (!decrypted?.insta_username && !decrypted?.telegram_bot) {
                        setMissingTabsData(prev => prev.includes("social") ? prev : [...prev, "social"]);
                    }

                    return decrypted
                })
                .catch(err => {
                    if (err?.response?.data?.data) {
                        decryptData(err.response.data.data)
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        clearData()
                        if (!publicRoutes.some(item => window.location.pathname.toLowerCase().includes(item.path.toLowerCase().split(":")[0])) && !window.location.pathname.toLowerCase().includes("profile/")) {
                            sessionStorage.setItem("path", window.location.href?.split("pay.ch")?.[1])
                            navigate("/login")
                        }
                    }
                })
        }
    }

    // check auth
    const checkAuth = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/auth/${token}`)
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserDetails(decrypted)
                if (!decrypted?.country?.status) {
                    sessionStorage.setItem("country_status_error", "Service not available in your country!")
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    clearData()
                    navigate("/login")
                }
                if (decrypted?.status !== "active") {
                    toast.error("Account Suspended!")
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    clearData()
                    navigate("/login")
                }
            })
            .catch(err => {
                const dec = decryptData(err.response.data.data)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                clearData()
                if (dec?.message?.toLowerCase()?.includes("account not found")) {
                    navigate("/login")
                }
                if (!publicRoutes.some(item => window.location.pathname.toLowerCase().includes(item.path.toLowerCase().split(":")[0])) && !window.location.pathname.toLowerCase().includes("profile/")) {
                    sessionStorage.setItem("path", window.location.href?.split("pay.ch")?.[1])
                    navigate("/login")
                }
            })
    }


    // user wallets
    const getUserWallets = (dontSort) => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-user-wallet/${userDetails?._id}`, { headers: authHeader })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const sorted = decrypted.walletList.sort((a, b) => {
                    if (a.wallet_type === 'insta' && b.wallet_type === 'crypto') {
                        return -1;
                    } else if (a.wallet_type === 'crypto' && b.wallet_type === 'insta') {
                        return 1;
                    }
                    return 0;
                });

                if (dontSort) {
                    setUserWallets(sorted)
                } else {
                    const defaultWallet = decrypted.walletList.find(w => w.default);
                    const otherWallets = sorted.filter(w => !w.default);
                    setUserWallets(defaultWallet ? [defaultWallet, ...otherWallets] : otherWallets);
                }
            })
            .catch(err => "a") // console.log(decryptData(err.response.data.data)))
    }

    const getPAddressDets = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/get-payment-address/${userDetails?.username}`, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            const p = decrypted?.paymentAddressDetails

            if (p?.profileImage?.coordinates) {
                getImage(p?.profileImage?.url, p?.profileImage?.coordinates, "pa", "dp")
            }
            if (p?.coverImage?.coordinates) {
                getImage(p?.coverImage?.url, p?.coverImage?.coordinates, "pa", "cover")
            }
            setPAddressData(p)
        } catch (error) {
        }
    }
    useEffect(() => {
        if (userDetails /*&& userWallets.length === 0*/) {
            getUserWallets()
            getPAddressDets()
        }
    }, [userDetails])

    // user beneficiaries
    const getUserBeneficiaries = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-user-beneficiaries/${userDetails?._id}`, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            setBeneficiaries(decrypted.beneficiaryList)

        } catch (error) {
        }
    }

    // beneficiary registration check
    const checkRegisteredBenficiaries = () => {
        if (beneficiaries.length > 0) {
            Promise.all(beneficiaries.map(async (benef) => {
                if (benef.beneficiary_type === "individual") {
                    const isNotRegistered = await checkIndividualBeneficiary(benef.email, benef.phone);
                    // // console.log(benef.email, benef.beneficiary_type, benef.phone, "not registered", isNotRegistered);
                    return !isNotRegistered;
                } else {
                    const isNotRegistered = await checkBusinessBeneficiary(benef.email);
                    // // console.log(benef.email, "not registered", isNotRegistered);
                    return !isNotRegistered;
                }
            })).then((results) => {
                const filtered = beneficiaries.filter((_, index) => results[index]);
                setRegisteredBeneficiaries(filtered);
                // // console.log(filtered);
            }).catch((error) => {
                console.error("An error occurred while checking beneficiaries:", error);
            });
        };
    }

    // security questions
    const getSecurityQuestions = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user/get-security-question`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const questions = decrypted.questionsList?.map(item => {
                    const question = questionsData.find(it => it.language_code === (userDetails?.language ?? "en") && it.number === item?.question_no)
                    return { ...question, ...item }
                })
                console.log(decrypted.questionsList)
                console.log(questions)
                setUserSecurityQues(questions)
            })
            .catch(err => {
                // console.log(err.response.data)
            })
    }

    // invitation link
    const getInvitationLink = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/invitation/get-link/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const url = decrypted?.url.split("/signup/")
                const formattedUrl = `https://my.insta-pay.ch/signup/${url[1]}`
                setReferralLink(formattedUrl)
            })
            .catch(err => {
            })
    }

    // user sessions
    const getSessions = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/login/get-user-login-history/${userDetails._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserSessions(decrypted?.history?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))?.slice(0) ?? [])
                // console.log(decrypted?.history?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))?.slice(0) ?? [])
            })
            .catch(err => {
                // console.log(err)
            })
    }
    useEffect(() => {
        if (userSessions.length === 0 && userDetails && window.location.pathname.toLowerCase().includes("settings")) {
            getSessions()
        }
    }, [userSessions, userDetails, window.location])


    // profile completion details
    const getProfileCompletionDetails = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user/get-profile-completion/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                console.log(decrypted)
                const { completedBasicFields, totalBasicFields, completedProfilePercent } = decrypted?.fieldsInformation
                setProfileIncompleteReason(completedBasicFields !== totalBasicFields ? "basic" : "")
                setProfileCompleted(completedProfilePercent === 100)
                setProfileCompletedPercentage(completedProfilePercent)
            })
            .catch(err => {
                // console.log(decrypted)
            })

    }
    useEffect(() => {
        if (userDetails) {
            getProfileCompletionDetails()
        }
    }, [userDetails])

    // getActive countries
    const getAllActiveCountries = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/country/get-all-active-country`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setAllowedCountries(decrypted?.Countries)
            })
            .catch(err => {

            })
    }
    useEffect(() => {
        getAllActiveCountries()
    }, [])

    // user portfolio
    const getUserDocuments = () => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-all-document/${userDetails._id}/portfolio`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserPortfolio(decrypted.result)
            })
            .catch(err => {
            })
    }
    const getUserVideos = (userId = null) => {
        const id = userId ?? userDetails?._id
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-all-document/${id}/address`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                console.log(decrypted)
                setUserVideos(decrypted.result)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                console.log(decrypted)
            })
    }

    const getWithdrawals = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/withdrawal/get-all-withdrawal/${userDetails?._id}`, {
                headers: authHeader
            })
            const decrypted = await decryptData(res.data.data)
            if (decrypted?.withdrawalList?.length === 0) {
                setMissingTabsData(prev => prev.includes("withdrawls") ? prev : [...prev, "withdrawls"]);
            }
            console.log(decrypted)
            setUserWithdrawals(decrypted?.withdrawalList ?? [])
        } catch (error) {
            const dec = decryptData(error.response?.data?.data);

            if (dec?.message?.includes("found")) {
                setMissingTabsData(prev => prev.includes("withdrawls") ? prev : [...prev, "withdrawls"]);
            }
            setUserWithdrawals([])
        }
    }


    useEffect(() => {
        if (userDetails) {
            getWithdrawals()
        }
    }, [userDetails])
    const [totalReferralAmount, setTotalReferralAmount] = useState(0)
    const getReferralCommission = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/invitation/get-user-commissions/${userDetails?._id}`, {
                headers: authHeader
            })

            const data = decryptData(res.data.data)
            setTotalReferralAmount(data?.availableCommission ?? 0)
            // console.log(data)
        } catch (error) {
            // console.log(decryptData(error.response.data.data));
        }
    }

    const validateSendingLimits = () => {
        if (userDetails?.level?.daily_sending_limit - userDetails?.used_limits?.daily_sending_limit < 1) {
            return true
        }
        if (userDetails?.level?.monthly_sending_limit - userDetails?.used_limits?.monthly_sending_limit < 1) {
            return true
        }
        if (userDetails?.level?.yearly_sending_limit - userDetails?.used_limits?.yearly_sending_limit < 1) {
            return true
        }
        return false;
    }

    const validateReceivingLimits = (amount) => {
        if (userDetails?.level?.daily_receiving_limit - userDetails?.used_limits?.daily_receiving_limit < 1) {
            return true
        }
        if (userDetails?.level?.monthly_receiving_limit - userDetails?.used_limits?.monthly_receiving_limit < 1) {
            return true
        }
        if (userDetails?.level?.yearly_receiving_limit - userDetails?.used_limits?.yearly_receiving_limit < 1) {
            return true
        }
        return false;
    }

    const validateTransactionsCount = () => {
        if (userDetails?.used_limits?.daily_transaction_count === 0) {
            return true
        }
        if (userDetails?.used_limits?.monthly_transaction_count === 0) {
            return true
        }
        if (userDetails?.used_limits?.yearly_transaction_count === 0) {
            return true
        }
        return false;
    }


    const [showInactivityModal, setShowInactivityModal] = useState(false)


    // 30 days/3 days securtiy questions
    const [is30Days, setIs30Days] = useState(false)
    const [threeDaysReminder, set3DaysReminder] = useState(false)

    useEffect(() => {
        if (userDetails) {
            if (!userDetails?.user?.answer1 || !userDetails?.user?.answer2 || !userDetails?.user?.answer3) {
                const getSecurityQuestionDetails = async () => {
                    try {
                        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/check-security-questions/${userDetails?._id}`, {
                            headers: authHeader
                        })
                        setIs30Days(res?.data?.thirtyDaysCheck)
                        if (!res?.data?.thirtyDaysCheck) {
                            set3DaysReminder(res?.data?.currentCheck)
                        }
                    } catch (error) {
                        console.log("Chin Tapak dam dam: ", error)
                    }
                }
                getSecurityQuestionDetails()
            }
        }

    }, [userDetails])

    return (
        <UserContext.Provider value={{ userDetails, setUserDetails, userWallets, setUserWallets, token, authHeader, beneficiaries, setBeneficiaries, userTransactions, setUserTransactions, searchQuery, setSearchQuery, apiDates, setApiDates, userSecurityQues, referralLink, userSessions, allowedFeatures, verifyToken, userWithdrawals, setUserWithdrawals, allowedWithdrawals, registeredBeneficiaries, profileCompleted, allowedCountries, userPortfolio, profileIncompleteReason, setUserPortfolio, setUserVideos, getUserVideos, userVideos, checkRegisteredBenficiaries, getAllActiveCountries, getUserWallets, getUserBeneficiaries, getUserDocuments, checkAuth, getSecurityQuestions, getInvitationLink, getSessions, profileCompletedPercentage, getWithdrawals, getReferralCommission, totalReferralAmount, validateSendingLimits, validateReceivingLimits, validateTransactionsCount, profileLockTIme, setProfileLockTime, showInactivityModal, setShowInactivityModal, is30Days, setIs30Days, threeDaysReminder, set3DaysReminder, clearData, croppedImages, updateCoordinates, setCroppedImages, missingTabsData, setMissingTabsData }}>
            {showModalState && <Modal isOpen={showModalState} toggle={() => window.history.replaceState(null, null, "")} />}
            {children}
        </UserContext.Provider>
    )
}

export default UserState;