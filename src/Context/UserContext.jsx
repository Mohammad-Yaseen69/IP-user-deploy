import axios from "axios";
import { createContext } from "react";
// removed unused AiOutlineConsoleSql import

// axios.defaults.timeout = 10000;
// axios.defaults.timeoutErrorMessage = "Server Timeout."
axios.defaults.withCredentials = true


// axios.interceptors.response.use(
//     response => {
//         return response
//     },
//     error => {
//         if (error.message === "Server Timeout." && error?.config?.url?.toLowerCase()?.includes("fontawesomev23")) {
//             toast.error("Request timed out. Please try again!");
//         }
//         const message = decryptData(error?.response?.data?.data)
//         if (error.response.status === 401 && message.message === "Unauthorize to access this route.") {
//             window.history.replaceState(null, null, `?show_logout_modal=unauthorized`)
//             showLogoutModal = true
//         }
//         return Promise.reject(error);
//     }
// );


// Initial value for UserContext to avoid undefined errors
const initialUserContext = {
    userDetails: null,
    setUserDetails: () => { },
    userWallets: [],
    setUserWallets: () => { },
    token: '',
    authHeader: {},
    beneficiaries: [],
    setBeneficiaries: () => { },
    userTransactions: [],
    setUserTransactions: () => { },
    searchQuery: '',
    setSearchQuery: () => { },
    apiDates: null,
    setApiDates: () => { },
    userSecurityQues: [],
    referralLink: '',
    userSessions: [],
    allowedFeatures: null,
    verifyToken: () => { },
    userWithdrawals: undefined,
    setUserWithdrawals: () => { },
    allowedWithdrawals: null,
    registeredBeneficiaries: [],
    profileCompleted: null,
    allowedCountries: [],
    userPortfolio: [],
    profileIncompleteReason: '',
    setUserPortfolio: () => { },
    setUserVideos: () => { },
    getUserVideos: () => { },
    userVideos: [],
    checkRegisteredBenficiaries: () => { },
    getAllActiveCountries: () => { },
    getUserWallets: () => { },
    getUserBeneficiaries: () => { },
    getUserDocuments: () => { },
    checkAuth: () => { },
    getSecurityQuestions: () => { },
    getInvitationLink: () => { },
    getSessions: () => { },
    profileCompletedPercentage: 0,
    getWithdrawals: () => { },
    getReferralCommission: () => { },
    totalReferralAmount: 0,
    validateSendingLimits: () => false,
    validateReceivingLimits: () => false,
    validateTransactionsCount: () => false,
    profileLockTIme: 0,
    setProfileLockTime: () => { },
    showInactivityModal: false,
    setShowInactivityModal: () => { },
    is30Days: false,
    setIs30Days: () => { },
    threeDaysReminder: false,
    set3DaysReminder: () => { },
    is30DaysInfo: false,
    setIs30DaysInfo: () => { },
    threeDaysReminderInfo: false,
    set3DaysReminderInfo: () => { },
    clearData: () => { },
    croppedImages: {
        profileDP: '',
        profileBanner: '',
        paDP: '',
        paBanner: '',
    },
    updateCoordinates: () => { },
    setCroppedImages: () => { },
    missingTabsData: [],
    setMissingTabsData: () => { },
    setAvailable: () => { },
    available: 0,
    setBlocked: () => { },
    blocked: 0,
};

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.referrerPolicy = 'no-referrer'
        image.addEventListener('load', () => resolve(image))
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
export const UserContext = createContext(initialUserContext)

export const authHeader = {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "source": "user"
}



