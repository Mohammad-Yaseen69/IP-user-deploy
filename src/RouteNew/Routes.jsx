import { lazy } from 'react';
const QrCode = lazy(() => import("../Components/QrCode"));
const QRScan = lazy(() => import("../Components/QrScan"));
const ChatbotQrCode = lazy(() => import("../Components/ChatbotQrCode"));
const PanTransaction = lazy(() => import("../Components/Chatbot/PanTransaction"));
const PanTransactionStatus = lazy(() => import("../Components/Chatbot/PanTransactionStatus"));
const PaymentStatus = lazy(() => import("../Components/PaymentStatus"));
const DataDecrypt = lazy(() => import("../Components/DataDecrypt"));
const NotFound = lazy(() => import("../Components/NotFound"));
const PaypalTransactions = lazy(() => import("../Components/Chatbot/PaypalTransactions"));
const GetLocation = lazy(() => import("../Components/Chatbot/GetLocation"));
const ShowLocation = lazy(() => import("../Components/Chatbot/ShowLocation"));
const AddBeneficiary = lazy(() => import('../Components/AddBeneficiary'));
const AddFunds = lazy(() => import('../Components/AddFunds'));
const Analytics = lazy(() => import('../Components/Analytics'));
const AuthNew = lazy(() => import('../Components/AuthNew'));
const Beneficiaries = lazy(() => import('../Components/Beneficiaries'));
const BroadcastSignup = lazy(() => import('../Components/BroadcastSignup'));
const BroadcastVerify = lazy(() => import('../Components/BroadcastVerify'));
const ChipsInNew = lazy(() => import('../Components/ChipsInNew'));
// const CreditSuccess = lazy(() => import('../Components/CreditSuccess'));
const EditBeneficiary = lazy(() => import('../Components/EditBeneficiary'));
const HomeNewUpdated = lazy(() => import('../Components/HomeNewUpdated'));
const OtherTransactions = lazy(() => import('../Components/OtherTransactions'));
const PartnerVerificationPage = lazy(() => import('../Components/PartnerVerification'));
const PaymentAddress = lazy(() => import('../Components/PaymentAddress'));
const PaymentAddressPublic = lazy(() => import('../Components/PaymentAddressPublic'));
const PaymentsNewer = lazy(() => import('../Components/PaymentsNewer'));
const PendingNew = lazy(() => import('../Components/PendingNew'));
const Ecommerce = lazy(() => import('../Components/Ecommerce-store/Store/Index.jsx'));
const Portfolio = lazy(() => import('../Components/Portfolio'));
const ProfileTest = lazy(() => import('../Components/Profile'));
const Quotations = lazy(() => import('../Components/QuotationsNew'));
const ReferralsNew = lazy(() => import('../Components/ReferralsNew'));
// const Settings = lazy(() => import('../Components/Settings'));
const TransactionsNewApi = lazy(() => import('../Components/TransactionsNewApi'));
const UserSettings = lazy(() => import('../Components/User/UserSettings'));
const UserProfile = lazy(() => import('../Components/UserProfile'));
const UserProfilePublic = lazy(() => import('../Components/UserProfilePublic'));
const UserSettingsNew = lazy(() => import('../Components/UserSettings'));
const UserSettingsUpdated = lazy(() => import('../Components/UserSettingsNew'));
const DownloadQrPage = lazy(() => import("../Components/DownloadQrPage"))
const Settings = lazy(() => import("../Components/Settings"))
const WalletsNew = lazy(() => import("../Components/WalletsNew"))
const CardPayment = lazy(() => import("../Components/CardPayment"))
const Auth = lazy(() => import("../Components/Auth"))
const ScheduleCalendar = lazy(() => import("../Components/Chatbot/schedule-calendar"))
const SubscriptionCalendar = lazy(() => import("../Components/Chatbot/subscription-calendar"))
const RequestCalendar = lazy(() => import("../Components/Chatbot/schedule-payment-request"))
const SubscriptionRequest = lazy(() => import("../Components/Chatbot/subscription-payment-request"))
const SubscriptionCalendarEndDate = lazy(() => import("../Components/Chatbot/subscription-end-date"))
const SubscriptionRequestEndDate = lazy(() => import("../Components/Chatbot/subscription-request-end-date"))
const CreatePassword = lazy(() => import("../Components/CreatePassword/CreatePassword"))
const GeoFencing = lazy(() => import("../Components/GeoFencing"))
const MyMasterCard = lazy(() => import("../Components/MyMasterCard"))
const CreatePin = lazy(() => import("../Components/CreatePin"))
const UpdatePin = lazy(() => import("../Components/UpdatePin"))
const CreatePinChatBot = lazy(() => import("../Components/Chatbot/Pin/CreatePin"))
const VerifyPinChatBot = lazy(() => import("../Components/Chatbot/Pin/VerifyPin"))
const QuickQrPay = lazy(() => import("../Components/QuickQrPay"))
const QrQuickerPay = lazy(() => import("../Components/QrQuickerPay"))
const ReceiptInvoice = lazy(() => import("../Components/ReceiptInvoices"))
const InvoicePayment = lazy(() => import("../Components/ReceiptInvoices/InvoicePayment"))
const InvoicePaymentQr = lazy(() => import("../Components/ReceiptInvoices/InvoicePaymentQr"))
const PlansSubscription = lazy(() => import("../Components/PlansSubscriptions"))


export const routes = [
    { path: "/", component: <HomeNewUpdated /> },
    { path: "/dashboard", component: <HomeNewUpdated /> },
    { path: "/dashboard/default", component: <HomeNewUpdated /> },
    { path: "/wallets", component: <WalletsNew /> },
    { path: "/transactions", component: <TransactionsNewApi /> },
    { path: "/other-transactions", component: <OtherTransactions /> },
    { path: "/payments", component: <PaymentsNewer /> },
    // card payment success or failure
    { path: "/payments/:status/:token", component: <CardPayment /> },
    { path: "/beneficiaries", component: <Beneficiaries /> },
    { path: "/beneficiaries/add", component: <AddBeneficiary /> },
    { path: "/beneficiaries/edit", component: <EditBeneficiary /> },
    { path: "/referrals", component: <ReferralsNew /> },
    { path: "/quotations", component: <Quotations /> },
    { path: "/payment-requests", component: <PendingNew /> },
    { path: "/chips-in", component: <ChipsInNew /> },
    { path: "/portfolio", component: <Portfolio /> },
    { path: "/ecommerce-store", component: <Ecommerce /> },
    { path: "/payment-address", component: <PaymentAddress /> },
    { path: "/analytics", component: <Analytics /> },
    { path: "/settings", component: <Settings /> },
    { path: "/profile/me", component: <UserProfile /> },
    { path: "/my-profile", component: <ProfileTest /> },
    { path: "/users/settings", component: <UserSettingsNew /> },
    { path: "/users/settings-new", component: <UserSettingsUpdated /> },
    { path: "/users/settings/extra", component: <UserSettings /> },
    { path: "/profile/:user_name", component: <UserProfilePublic /> },
    { path: "/add-funds", component: <AddFunds /> },
    { path: "/add-funds/card/:type", component: <AddFunds /> },
    { path: "/add-funds/card/:type/:code", component: <AddFunds /> },
    { path: "/add-funds/success/:enc", component: <AddFunds /> },
    { path: "/add-funds/error/:enc", component: <AddFunds /> },
    { path: "/add-funds/aborted/:enc", component: <AddFunds /> },
    { path: "/onboarding/add-users", component: <BroadcastSignup /> },
    { path: "/payment-status/:type/:status/:code", component: <PaymentStatus /> },
    { path: "/create-password/:token", component: <CreatePassword /> },
    { path: "/geo-fencing", component: <GeoFencing /> },
    { path: "/my-mastercard", component: <MyMasterCard /> },
    { path: "/create-pin", component: <CreatePin /> },
    { path: "/update-pin", component: <UpdatePin /> },
    { path: "/invoices", component: <ReceiptInvoice /> },


    { path: "*", component: <NotFound type='Page' /> }
]
export const publicRoutes = [
    { path: "/qr-test", component: <QrCode /> },
    { path: "/q/:wallet_id", component: <QRScan /> },
    // { path: "/tcbf", component: <TempCountriesBankFields /> },
    { path: "/pay/:user_name", component: <PaymentAddressPublic /> },
    { path: "/pay/:user_name/:status", component: <PaymentAddressPublic /> },
    // { path: "/profile/:user_name", component: <UserProfilePublic /> },
    { path: "/partners/verification/:token", component: <PartnerVerificationPage /> },
    { path: "/onboarding/user-verification/:token", component: <BroadcastVerify /> },
    { path: "/download-qr-poster/:wallet_id", component: <DownloadQrPage /> },
    { path: "/chatbot/pan-transaction", component: <PanTransaction /> },
    { path: "/chatbot/pan-transaction/:status/:code", component: <PanTransactionStatus /> },
    { path: "/chatbot/scheduled/:token", component: <ScheduleCalendar /> },
    { path: "/chatbot/subscription/:token", component: <SubscriptionCalendar /> },
    { path: "/chatbot/request-scheduled/:token", component: <RequestCalendar /> },
    { path: "/chatbot/request-subscription/:token", component: <SubscriptionRequest /> },
    { path: "/chatbot/subscription-end-date/:token/:date", component: <SubscriptionCalendarEndDate /> },
    { path: "/chatbot/subscription-request-end-date/:token/:date", component: <SubscriptionRequestEndDate /> },
    { path: "/qr-activate", component: <ChatbotQrCode /> },
    { path: "/data-decrypt", component: <DataDecrypt /> },
    { path: "/chatbot/paypal-transaction/:status/:id", component: <PaypalTransactions /> },
    { path: "/chatbot/get-location", component: <GetLocation /> },
    { path: "/chatbot/payment-request", component: <ShowLocation /> },
    { path: "/create-password/:token", component: <CreatePassword /> },
    { path: "/quick-qrpay", component: <QuickQrPay /> },
    { path: "/set-account-pin/:accountId/:platformType", component: <CreatePinChatBot /> },
    { path: "/verify-bot-pin/:accountId/:platformType", component: <VerifyPinChatBot /> },
    { path: "/qr-quickerpay/:wallet_id", component: <QrQuickerPay /> },
    { path: "/invoice/:username/:invoiceId", component: <InvoicePayment /> },
    { path: "/invoice/qr/:username/:invoiceId", component: <InvoicePaymentQr /> },
    { path: "/pay/subscription/:subscriptionId", component: <PlansSubscription /> },
    { path: "*", component: <NotFound type='Page' /> }
]
export const authRoutes = [
    { path: `/login`, component: <Auth /> },
    { path: `/forgot-password`, component: <AuthNew /> },
    { path: `/signup`, component: <Auth /> },
    { path: `/signup/:code`, component: <Auth /> },
    { path: "*", component: <NotFound type='Page' /> }
]