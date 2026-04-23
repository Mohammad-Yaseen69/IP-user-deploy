import { getCroppedImg, UserContext } from "./UserContext";
import axios from "axios";
import { decryptData } from "../Helper/EssentilaMethods/Decryption";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { publicRoutes } from "../RouteNew/Routes";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import questionsData from "../Components/Settings/questions.json"
import SessionExpireModal from "../Components/SessionExpireModal";
import { useSearchParams } from "react-router-dom";
import { apiWrapper } from "../utils/Functions/apiWrapper";



const getRegisteredBeneficiariesFn = async (head) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-registered-beneficiaries`, {
        headers: head
    })

    return decryptData(res.data.data)?.registeredBeneficiaries
}
const getBalances = async (head) => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-balance-usd`, {
        headers: head
    })

    return decryptData(res.data.data)?.data
}


const processReceivingNonIpFundsFn = async () => {
    const res = await apiWrapper({
        endpoint: "/api/pre-wallet/proceed-receiving-funds",
        method: "POST",
    })

    return res
}


const UserState = ({ children }) => {
    if (import.meta.env.PROD) {
        console.clear()
    }
    if (import.meta.env.PROD) {
        console.info(`%c Dear User, Please be aware that copying and pasting code or commands directly into your console(in this section) can pose significant security risks. Malicious code can compromise your account, steal sensitive information, or damage your system. \nFor your safety, never paste commands from untrusted or unknown sources.\nThank you for your attention to this matter.\nSincerely,\nInstaPay`, 'color: white; font-size: 20px; font-weight: 500; background: linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%); padding: .5rem; border-radius: 5px;');
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
    const [available, setAvailable] = useState(0)
    const [blocked, setBlocked] = useState(0)
    const [showAnotherLoginModal, setShowAnotherLoginModal] = useState(false)
    const base_url = window.location.origin || 'https://my.insta-pay.ch';


    const { data: registeredBenApiData, isLoading: benLoading } = useQuery({
        queryKey: ["RegisteredBeneficiaries", userDetails?._id],
        queryFn: () => getRegisteredBeneficiariesFn(authHeader),
        enabled: !!userDetails?._id
    })
    const { data: balances, isLoading: balanceLoading } = useQuery({
        queryKey: ["getBalancesIUSD", userDetails?._id],
        queryFn: () => getBalances(authHeader),
        enabled: !!userDetails?._id
    })

    const processReceivingNonIpFunds = useMutation({
        mutationFn: () => processReceivingNonIpFundsFn(),
    })

    const [searchParams] = useSearchParams();
    const isSessionExpired = searchParams.get("show_logout_modal");


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
                    decryptData(error?.response?.data?.data).message === "Unauthorize to access this route."
                ) {
                    // setSearchParams({ ...currentParams, show_logout_modal: "unauthorized" }, { replace: true });
                    navigate(`${window.location.pathname}${window.location.search}${window.location.search ? "&" : "?"}show_logout_modal=unauthorized`)
                    setShowModalState(true);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    console.log(window.location)


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
                getImage(pAddressData?.coverImage?.url, coordinates, "pa", "cover")
            }
        }
    }


    const verifyToken = (isFetchRequired = false) => {
        if ((!window.location.pathname.includes("auth") && !userDetails && Object.keys(userDetails || {}).length === 0) || isFetchRequired) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${token}`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserDetails(decrypted)
                    if (!decrypted?.country?.status) {
                        sessionStorage.setItem("country_status_error", "Service not available in your country!")
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        clearData()
                        navigate("/login", { replace: true })
                    }
                    if (decrypted?.status !== "active") {
                        toast.error("Account Suspended!")
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        clearData()
                        navigate("/login", { replace: true })
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
                            navigate("/login", { replace: true })
                        }
                    }
                })
        }
    }

    // check auth
    const checkAuth = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${token}`)
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserDetails(decrypted)
                if (!decrypted?.country?.status) {
                    sessionStorage.setItem("country_status_error", "Service not available in your country!")
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    clearData()
                    navigate("/login", { replace: true })
                }
                if (decrypted?.status !== "active") {
                    toast.error("Account Suspended!")
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    clearData()
                    navigate("/login", { replace: true })
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
            })
            .catch((err) => {
                const dec = decryptData(err?.response?.data?.data)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                clearData()
                if (dec?.message?.toLowerCase()?.includes("account not found")) {
                    navigate("/login", { replace: true })
                }
                if (!publicRoutes.some(item => window.location.pathname.toLowerCase().includes(item.path.toLowerCase().split(":")[0])) && !window.location.pathname.toLowerCase().includes("profile/")) {
                    sessionStorage.setItem("path", window.location.href?.split("pay.ch")?.[1])
                    navigate("/login", { replace: true })
                }
            })
    }


    const getUserWallets = (dontSort) => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallet/${userDetails?._id}`, { headers: authHeader })
            .then(async (res) => {
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
                    const wallets = defaultWallet ? [defaultWallet, ...otherWallets] : otherWallets
                    setUserWallets(wallets);
                }
            })
    }

    const getPAddressDets = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-payment-address/${userDetails?.username}`, {
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
        } catch {
            // 
        }
    }
    useEffect(() => {
        if (userDetails?._id /*&& userWallets.length === 0*/) {
            getUserWallets()
            getPAddressDets()
        }
    }, [userDetails])

    useEffect(() => {
        if (balances) {
            setAvailable(balances?.available ?? 0)
            setBlocked(balances?.blocked ?? 0)
        }
    }, [balances])

    useEffect(() => {
        if (userDetails?._id && userDetails?.isPendingRequests) {
            processReceivingNonIpFunds.mutateAsync()
        }
    }, [userDetails?._id, userDetails?.isPendingRequests])



    // user beneficiaries
    const getUserBeneficiaries = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-user-beneficiaries/${userDetails?._id}`, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            setBeneficiaries(decrypted.beneficiaryList)

        } catch {
            // 
        }
    }

    const checkRegisteredBenficiaries = () => {
        setRegisteredBeneficiaries(registeredBenApiData)
    }

    // security questions
    const getSecurityQuestions = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-security-question`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const questions = decrypted.questionsList?.map(item => {
                    const question = questionsData.find(it => it.language_code === (userDetails?.language ?? "en") && it.number === item?.question_no)
                    return { ...question, ...item }
                })
                setUserSecurityQues(questions)
            })
            .catch(() => {
                // console.log(err.response.data)
            })
    }

    // invitation link
    const getInvitationLink = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-link/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const url = decrypted?.url.split("/signup/")
                const formattedUrl = `${base_url}/signup/${url[1]}`
                setReferralLink(formattedUrl)
            })
    }

    // user sessions
    const getSessions = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/login/get-user-login-history/${userDetails._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserSessions(decrypted?.history?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))?.slice(0) ?? [])
                // console.log(decrypted?.history?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))?.slice(0) ?? [])
            })
            .catch(() => {
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
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-profile-completion/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.fieldsInformation) {
                    const { completedBasicFields, totalBasicFields, completedProfilePercent } = decrypted.fieldsInformation
                    setProfileIncompleteReason(completedBasicFields !== totalBasicFields ? "basic" : "")
                    setProfileCompleted(completedProfilePercent === 100)
                    setProfileCompletedPercentage(completedProfilePercent)
                }
            })

    }
    useEffect(() => {
        if (userDetails?._id) {
            getProfileCompletionDetails()
        }
    }, [userDetails])

    // getActive countries
    const getAllActiveCountries = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/country/get-all-active-country`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setAllowedCountries(decrypted?.Countries)
            })
    }
    useEffect(() => {
        getAllActiveCountries()
    }, [])

    // user portfolio
    const getUserDocuments = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/get-all-document/${userDetails._id}/portfolio`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserPortfolio(decrypted.result)
            })
    }
    const getUserVideos = (userId = null) => {
        const id = userId ?? userDetails?._id
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/get-all-document/${id}/address`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUserVideos(decrypted.result)
            })
    }

    const getWithdrawals = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/get-all-withdrawal/${userDetails?._id}`, {
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
        if (userDetails?._id) {
            getWithdrawals()
        }
    }, [userDetails])
    const [totalReferralAmount, setTotalReferralAmount] = useState(0)
    const getReferralCommission = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-user-commissions/${userDetails?._id}`, {
                headers: authHeader
            })

            const data = decryptData(res.data.data)
            setTotalReferralAmount(data?.availableCommission ?? 0)
            // console.log(data)
        } catch {
            // console.log(decryptData(error?.response?.data?.data));
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

    const validateReceivingLimits = () => {
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
    const [is30DaysInfo, setIs30DaysInfo] = useState(false)
    const [threeDaysReminderInfo, set3DaysReminderInfo] = useState(false)

    useEffect(() => {
        if (userDetails?._id) {
            if (!userDetails?.user?.answer1 || !userDetails?.user?.answer2 || !userDetails?.user?.answer3) {
                const getSecurityQuestionDetails = async () => {
                    try {
                        const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/check-security-questions/${userDetails?._id}`, {
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
            const getInfoQuestionDets = async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/check-financial-questions/${userDetails?._id}`, {
                        headers: authHeader
                    })
                    const dec = decryptData(res.data.data)
                    setIs30DaysInfo(dec?.thirtyDaysCheck)
                    if (!dec?.thirtyDaysCheck) {
                        set3DaysReminderInfo(dec?.currentCheck)
                    }
                } catch (error) {
                    console.log("Chin Tapak dam dam: ", error)
                }
            }

            getInfoQuestionDets()

        }

    }, [userDetails])



    return (
        <UserContext.Provider value={{ userDetails, setUserDetails, userWallets, setUserWallets, token, authHeader, beneficiaries, setBeneficiaries, userTransactions, setUserTransactions, searchQuery, setSearchQuery, apiDates, setApiDates, userSecurityQues, referralLink, userSessions, allowedFeatures, verifyToken, userWithdrawals, setUserWithdrawals, allowedWithdrawals, registeredBeneficiaries, profileCompleted, allowedCountries, userPortfolio, profileIncompleteReason, setUserPortfolio, setUserVideos, getUserVideos, userVideos, checkRegisteredBenficiaries, getAllActiveCountries, getUserWallets, getUserBeneficiaries, getUserDocuments, checkAuth, getSecurityQuestions, getInvitationLink, getSessions, profileCompletedPercentage, getWithdrawals, getReferralCommission, totalReferralAmount, validateSendingLimits, validateReceivingLimits, validateTransactionsCount, profileLockTIme, setProfileLockTime, showInactivityModal, setShowInactivityModal, is30Days, setIs30Days, threeDaysReminder, set3DaysReminder, is30DaysInfo, setIs30DaysInfo, threeDaysReminderInfo, set3DaysReminderInfo, clearData, croppedImages, updateCoordinates, setCroppedImages, missingTabsData, setMissingTabsData, setAvailable, available, setBlocked, blocked, benLoading, balanceLoading, showModalState, setShowModalState, processReceivingNonIpFunds: processReceivingNonIpFunds.mutateAsync, showAnotherLoginModal, setShowAnotherLoginModal }}>
            {((showModalState || Boolean(isSessionExpired)) && !location.pathname.startsWith("/pay/")) &&
                <SessionExpireModal
                    isOpen={(showModalState || Boolean(isSessionExpired))}
                    toggle={() => {
                        setShowModalState(false);
                        window.history.replaceState(null, null, window.location.pathname);
                    }}
                />
            }
            {children}
        </UserContext.Provider>
    )
}

export default UserState;