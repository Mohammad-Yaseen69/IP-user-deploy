import { lazy } from "react";
import { Navigate } from "react-router";
import { usePermission } from "../hooks/GeneralUse/usePermission";
import { MENU } from "../Layout/SidebarNew/SbNMenu";
import { BusinessRoute } from "../hooks/GeneralUse/useBusiness";
import { AgentRoute } from "../hooks/GeneralUse/useAgent";
const BusinessAccount = lazy(() => import("../Components/AddBeneficiary/BusinessAccount"));
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
const AddBeneficiary = lazy(() => import("../Components/AddBeneficiary"));
const AddFunds = lazy(() => import("../Components/AddFunds"));
const CryptoFundSuccess = lazy(() => import("../Components/AddFunds/CryptoFundSuccess"));
const Analytics = lazy(() => import("../Components/Analytics"));
const AuthNew = lazy(() => import("../Components/AuthNew"));
const Beneficiaries = lazy(() => import("../Components/Beneficiaries"));
const BroadcastSignup = lazy(() => import("../Components/BroadcastSignup"));
const BroadcastVerify = lazy(() => import("../Components/BroadcastVerify"));
const ChipsInNew = lazy(() => import("../Components/ChipsInNew"));
// const CreditSuccess = lazy(() => import('../Components/CreditSuccess'));
const EditBeneficiary = lazy(() => import("../Components/EditBeneficiary"));
const HomeNewUpdated = lazy(() => import("../Components/HomeNewUpdated"));
const OtherTransactions = lazy(() => import("../Components/OtherTransactions"));
const PartnerVerificationPage = lazy(() => import("../Components/PartnerVerification"));
const PaymentAddress = lazy(() => import("../Components/PaymentAddress"));
const PaymentAddressPublic = lazy(() => import("../Components/PaymentAddressPublic"));
const PaymentsNewer = lazy(() => import("../Components/PaymentsNewer"));
const PendingNew = lazy(() => import("../Components/PendingNew"));
const Portfolio = lazy(() => import("../Components/Portfolio"));
const ProfileTest = lazy(() => import("../Components/Profile"));
const Quotations = lazy(() => import("../Components/QuotationsNew"));
const ReferralsNew = lazy(() => import("../Components/ReferralsNew"));
// const Settings = lazy(() => import('../Components/Settings'));
const TransactionsNewApi = lazy(() => import("../Components/TransactionsNewApi"));
const UserProfile = lazy(() => import("../Components/UserProfile"));
const UserProfilePublic = lazy(() => import("../Components/UserProfilePublic"));
const DownloadQrPage = lazy(() => import("../Components/DownloadQrPage"));
const Settings = lazy(() => import("../Components/Settings"));
const WalletsNew = lazy(() => import("../Components/WalletsNew"));
const CardPayment = lazy(() => import("../Components/CardPayment"));
const Auth = lazy(() => import("../Components/Auth"));
const ScheduleCalendar = lazy(() => import("../Components/Chatbot/schedule-calendar"));
const SubscriptionCalendar = lazy(() => import("../Components/Chatbot/subscription-calendar"));
const RequestCalendar = lazy(() => import("../Components/Chatbot/schedule-payment-request"));
const SubscriptionRequest = lazy(
  () => import("../Components/Chatbot/subscription-payment-request"),
);
const SubscriptionCalendarEndDate = lazy(
  () => import("../Components/Chatbot/subscription-end-date"),
);
const SubscriptionRequestEndDate = lazy(
  () => import("../Components/Chatbot/subscription-request-end-date"),
);
const PayViaSocial = lazy(() => import("../Components/SocialPay/index.jsx"));

const CreatePassword = lazy(() => import("../Components/CreatePassword/CreatePassword"));
const GeoFencing = lazy(() => import("../Components/GeoFencing"));
const MyMasterCard = lazy(() => import("../Components/MyMasterCard"));
const CreatePin = lazy(() => import("../Components/CreatePin"));
const UpdatePin = lazy(() => import("../Components/UpdatePin"));
const CreatePinChatBot = lazy(() => import("../Components/Chatbot/Pin/CreatePin"));
const VerifyPinChatBot = lazy(() => import("../Components/Chatbot/Pin/VerifyPin"));
const QuickQrPay = lazy(() => import("../Components/QuickQrPay"));
const QrQuickerPay = lazy(() => import("../Components/QrQuickerPay"));
const ReceiptInvoice = lazy(() => import("../Components/ReceiptInvoices"));
const InvoicePayment = lazy(() => import("../Components/ReceiptInvoices/InvoicePayment"));
const InvoicePaymentQr = lazy(() => import("../Components/ReceiptInvoices/InvoicePaymentQr"));
const PlansSubscription = lazy(() => import("../Components/PlansSubscriptions"));
const PlanPaymentLink = lazy(() => import("../Components/PlanPaymentLink"));
const StoreCreate = lazy(() => import("../Components/StoreCreate"));
const DelegateAccess = lazy(() => import("../Components/DelegateAccess"));
const CreateAgentPassword = lazy(() => import("../Components/CreateAgentPassword"));
const AgentLogin = lazy(() => import("../Components/Auth/agentAuth/index"));
const LogActivity = lazy(() => import("../Components/LogActivity"));
const VirtyalBank = lazy(() => import("../Components/VirtualIBAN"));
// const KYBOnboarding = lazy(() => import("../Components/KYBOnboarding/index"))
const ThirdPartySenders = lazy(() => import("../Components/ThirdPartySenders"));
const CopyX = lazy(() => import("../Components/CopyX"));
const OnboardingIBAN = lazy(() => import("../Components/VirtualIBAN/OnBoardingIBAN"));
const PriceActivation = lazy(
  () => import("../Components/VirtualIBAN/OnBoardingIBAN/PriceActivation/PriceActivation.jsx"),
);
const MoveMoney = lazy(
  () => import("../Components/VirtualIBAN/OnBoardingIBAN/moveMoney/MoveMoney.jsx"),
);
const CryptoActions = lazy(
  () => import("../Components/VirtualIBAN/OnBoardingIBAN/cryptoActions/CryptoActions.jsx"),
);
const IbanValidationPage = lazy(() => import("../Components/VirtualIBAN/IbanValidationPage"));
const InstaMedia = lazy(() => import("../Components/InstaMedia"));
const StatementsLetters = lazy(
  () => import("../Components/VirtualIBAN/StatementsLetters/StatementsLetters.jsx"),
);
const CryptoWalletsPage = lazy(
  () => import("../Components/VirtualIBAN/CryptoWallet/CryptoWalletsPage.jsx"),
);
const BeneficiariesVirtual = lazy(
  () => import("../Components/VirtualIBAN/Beneficiaries/BeneficiariesVirtual.jsx"),
);
const AgentCommission = lazy(() => import("../Components/AgentCommission/index.jsx"));
const Leads = lazy(() => import("../Components/AgentCommission/Leads/Leads.jsx"));
const SubAgents = lazy(() => import("../Components/AgentCommission/SubAgents/SubAgents.jsx"));
const Commissions = lazy(() => import("../Components/AgentCommission/Commissions/Commissions.jsx"));
const Clients = lazy(() => import("../Components/AgentCommission/Clients/Clients.jsx"));
const Documents = lazy(() => import("../Components/AgentCommission/Documents/Documents.jsx"));
const Reports = lazy(() => import("../Components/AgentCommission/Reports/Reports.jsx"));
const Support = lazy(() => import("../Components/AgentCommission/Support/Support.jsx"));
const AgentProfile = lazy(() => import("../Components/AgentCommission/Profile/Profile.jsx"));
const FeeModelRequests = lazy(
  () => import("../Components/AgentCommission/FeeRequests/FeeModelRequests.jsx"),
);
const LeadClaimConfirm = lazy(() => import("../Components/Auth/LeadClaimConfirm.jsx"));
const PaytentlyCardCollected = lazy(() => import("../Components/PaytentlyCardCollected"));

const PermissionRoute = ({ permission, children }) => {
  const can = usePermission();
  if (!can(permission)) {
    let fallbackPath = null;
    for (const section of MENU) {
      if (section.menu) {
        for (const item of section.menu) {
          if (item.type === "link" && item.url) {
            if (!item.permission || can(item.permission)) {
              try {
                const urlObj = new URL(item.url, window.location.origin);
                fallbackPath = urlObj.pathname + urlObj.search;
              } catch (e) {
                fallbackPath = item.url;
              }
              break;
            }
          }
        }
      }
      if (fallbackPath) break;
    }

    if (fallbackPath && fallbackPath !== window.location.pathname) {
      return <Navigate to={fallbackPath} replace />;
    }

    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          width: "100%",
          marginTop: "10vh",
        }}
      >
        You don&apos;t have permission to view this page.
      </div>
    );
  }

  return children;
};

export const routes = [
  {
    path: "/",
    component: (
      <PermissionRoute permission="dashboard.view">
        <HomeNewUpdated />
      </PermissionRoute>
    ),
  },
  {
    path: "/dashboard",
    component: (
      <PermissionRoute permission="dashboard.view">
        <HomeNewUpdated />
      </PermissionRoute>
    ),
  },
  {
    path: "/dashboard/default",
    component: (
      <PermissionRoute permission="dashboard.view">
        <HomeNewUpdated />
      </PermissionRoute>
    ),
  },
  {
    path: "/wallets",
    component: (
      <PermissionRoute permission="wallet.view">
        <WalletsNew />
      </PermissionRoute>
    ),
  },
  {
    path: "/transactions",
    component: (
      <PermissionRoute permission="transactions.main.view">
        <TransactionsNewApi />
      </PermissionRoute>
    ),
  },
  {
    path: "/other-transactions",
    component: (
      <PermissionRoute permission="schedules.view">
        <OtherTransactions />
      </PermissionRoute>
    ),
  },
  {
    path: "/payments",
    component: (
      <PermissionRoute permission="payments.view">
        <PaymentsNewer />
      </PermissionRoute>
    ),
  },
  // card payment success or failure
  { path: "/payments/:status/:token", component: <CardPayment /> },
  {
    path: "/beneficiaries",
    component: (
      <PermissionRoute permission="beneficiaries.view">
        <Beneficiaries />
      </PermissionRoute>
    ),
  },
  {
    path: "/beneficiaries/add",
    component: (
      <PermissionRoute permission="beneficiaries.add">
        <AddBeneficiary />
      </PermissionRoute>
    ),
  },
  {
    path: "/beneficiaries/edit",
    component: (
      <PermissionRoute permission="beneficiaries.edit">
        <EditBeneficiary />
      </PermissionRoute>
    ),
  },
  {
    path: "/beneficiaries/edit/business",
    component: (
      <PermissionRoute permission="beneficiaries.edit">
        <BusinessAccount />
      </PermissionRoute>
    ),
  },
  {
    path: "/referrals",
    component: (
      <PermissionRoute permission="referrals.view">
        <ReferralsNew />
      </PermissionRoute>
    ),
  },
  {
    path: "/quotations",
    component: (
      <PermissionRoute permission="quotations.view">
        <Quotations />
      </PermissionRoute>
    ),
  },
  {
    path: "/payment-requests",
    component: (
      <PermissionRoute permission="payment-request.view">
        <PendingNew />
      </PermissionRoute>
    ),
  },
  {
    path: "/chips-in",
    component: (
      <PermissionRoute permission="qr-sticker.view">
        <ChipsInNew />
      </PermissionRoute>
    ),
  },
  {
    path: "/portfolio",
    component: (
      <PermissionRoute permission="portfolio.view">
        <Portfolio />
      </PermissionRoute>
    ),
  },

  {
    path: "/payment-address",
    component: (
      <PermissionRoute permission="payment-address.view">
        <PaymentAddress />
      </PermissionRoute>
    ),
  },
  {
    path: "/analytics",
    component: (
      <PermissionRoute permission="analytics.view">
        <Analytics />
      </PermissionRoute>
    ),
  },
  {
    path: "/pay-via-social",
    component: (
      <PermissionRoute permission="payviasocial.view">
        <PayViaSocial />
      </PermissionRoute>
    ),
  },
  {
    path: "/settings",
    component: (
      <PermissionRoute permission="settings.view">
        <Settings />
      </PermissionRoute>
    ),
  },
  {
    path: "/profile/me",
    component: (
      <PermissionRoute permission="user-profile.view">
        <UserProfile />
      </PermissionRoute>
    ),
  },
  {
    path: "/my-profile",
    component: (
      <PermissionRoute permission="user-profile.view">
        <ProfileTest />
      </PermissionRoute>
    ),
  },
  { path: "/profile/:user_name", component: <UserProfilePublic /> },
  { path: "/add-funds", component: <AddFunds /> },
  { path: "/add-funds/card/:type", component: <AddFunds /> },
  { path: "/add-funds/card/:type/:code", component: <AddFunds /> },
  { path: "/add-funds/crypto-success", component: <CryptoFundSuccess /> },
  { path: "/add-funds/success/:enc", component: <AddFunds /> },
  { path: "/add-funds/error/:enc", component: <AddFunds /> },
  { path: "/add-funds/aborted/:enc", component: <AddFunds /> },
  { path: "/onboarding/add-users", component: <BroadcastSignup /> },
  { path: "/payment-status/:type/:status/:code", component: <PaymentStatus /> },
  { path: "/create-password/:token", component: <CreatePassword /> },
  {
    path: "/geo-fencing",
    component: (
      <PermissionRoute permission="geo-fencing.view">
        <GeoFencing />
      </PermissionRoute>
    ),
  },
  {
    path: "/my-mastercard",
    component: (
      <PermissionRoute permission="mastercard.view">
        <MyMasterCard />
      </PermissionRoute>
    ),
  },
  {
    path: "/my-mastercard/:status/:code",
    component: (
      <PermissionRoute permission="mastercard.view">
        <MyMasterCard />
      </PermissionRoute>
    ),
  },
  { path: "/create-pin", component: <CreatePin /> },
  { path: "/update-pin", component: <UpdatePin /> },
  {
    path: "/invoices",
    component: (
      <PermissionRoute permission="invoices.view">
        <ReceiptInvoice />
      </PermissionRoute>
    ),
  },
  { path: "/store-create", component: <StoreCreate /> },
  {
    path: "/delegate-access",
    component: (
      <BusinessRoute>
        <PermissionRoute permission="delegate-access.view">
          <DelegateAccess />
        </PermissionRoute>
      </BusinessRoute>
    ),
  },
  {
    path: "/activity",
    component: (
      <BusinessRoute>
        <PermissionRoute permission="activity-logs.view">
          <LogActivity />
        </PermissionRoute>
      </BusinessRoute>
    ),
  },
  {
    path: "/virtual-IBAN",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <VirtyalBank />
      </PermissionRoute>
    ),
  },
  {
    path: "/virtual-IBAN/statements-letters",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <StatementsLetters />
      </PermissionRoute>
    ),
  },
  {
    path: "/virtual-IBAN/beneficiaries-virtual",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <BeneficiariesVirtual />
      </PermissionRoute>
    ),
  },
  {
    path: "/onboarding-IBAN",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <OnboardingIBAN />
      </PermissionRoute>
    ),
  },
  {
    path: "/onboarding-IBAN/priceAcitvation",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <PriceActivation />
      </PermissionRoute>
    ),
  },
  {
    path: "/onboarding-IBAN/moneymove",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <MoveMoney />
      </PermissionRoute>
    ),
  },
  {
    path: "/onboarding-IBAN/crypto",
    component: (
      <PermissionRoute permission="virtual-iban.view">
        <CryptoActions />
      </PermissionRoute>
    ),
  },
  {
    path: "/crypto-wallets",
    component: (
      <PermissionRoute permission="wallet.view">
        <CryptoWalletsPage />
      </PermissionRoute>
    ),
  },
  {
    path: "/third-party-senders",
    component: (
      <PermissionRoute permission="payments.send-as-third-party.view">
        <ThirdPartySenders />
      </PermissionRoute>
    ),
  },
  { path: "/copy-trading", component: <CopyX /> },
  { path: "/copy-trading/:screen", component: <CopyX /> },
  { path: "*", component: <NotFound type="Page" /> },
];

export const publicRoutes = [
  { path: "/qr-test", component: <QrCode /> },
  { path: "/q/:wallet_id", component: <QRScan /> },
  // {path: "/tcbf", component: <TempCountriesBankFields /> },
  { path: "/pay/:user_name", component: <PaymentAddressPublic /> },
  { path: "/pay/:user_name/:status", component: <PaymentAddressPublic /> },
  // {path: "/profile/:user_name", component: <UserProfilePublic /> },
  {
    path: "/partners/verification/:token",
    component: <PartnerVerificationPage />,
  },
  {
    path: "/onboarding/user-verification/:token",
    component: <BroadcastVerify />,
  },
  { path: "/download-qr-poster/:wallet_id", component: <DownloadQrPage /> },
  { path: "/chatbot/pan-transaction", component: <PanTransaction /> },
  {
    path: "/chatbot/pan-transaction/:status/:code",
    component: <PanTransactionStatus />,
  },
  { path: "/chatbot/scheduled/:token", component: <ScheduleCalendar /> },
  { path: "/chatbot/subscription/:token", component: <SubscriptionCalendar /> },
  { path: "/chatbot/request-scheduled/:token", component: <RequestCalendar /> },
  {
    path: "/chatbot/request-subscription/:token",
    component: <SubscriptionRequest />,
  },
  {
    path: "/chatbot/subscription-end-date/:token/:date",
    component: <SubscriptionCalendarEndDate />,
  },
  {
    path: "/chatbot/subscription-request-end-date/:token/:date",
    component: <SubscriptionRequestEndDate />,
  },
  { path: "/qr-activate", component: <ChatbotQrCode /> },
  { path: "/data-decrypt", component: <DataDecrypt /> },
  {
    path: "/chatbot/paypal-transaction/:status/:id",
    component: <PaypalTransactions />,
  },
  { path: "/chatbot/get-location", component: <GetLocation /> },
  { path: "/chatbot/payment-request", component: <ShowLocation /> },
  { path: "/create-password/:token", component: <CreatePassword /> },
  { path: "/quick-qrpay", component: <QuickQrPay /> },
  {
    path: "/set-account-pin/:accountId/:platformType",
    component: <CreatePinChatBot />,
  },
  {
    path: "/verify-bot-pin/:accountId/:platformType",
    component: <VerifyPinChatBot />,
  },
  { path: "/qr-quickerpay/:wallet_id", component: <QrQuickerPay /> },
  {
    path: "/invoice/:username/:invoiceId",
    component: (
      <PermissionRoute permission="invoices.payment.pay">
        <InvoicePayment />
      </PermissionRoute>
    ),
  },
  {
    path: "/invoice/qr/:username/:invoiceId",
    component: (
      <PermissionRoute permission="invoices.payment.pay">
        <InvoicePaymentQr />
      </PermissionRoute>
    ),
  },
  {
    path: "/pay/subscription/:subscriptionId",
    component: <PlansSubscription />,
  },
  { path: "/pay/plan/:username/:planId", component: <PlanPaymentLink /> },
  { path: "/create-agent-password/:token", component: <CreateAgentPassword /> },
  { path: "/validate-iban/:ibanId", component: <IbanValidationPage /> },
  { path: "/v/:ibanId", component: <IbanValidationPage /> },
  { path: "/Insta-media", component: <InstaMedia /> },
  { path: "/lead-claim-confirm", component: <LeadClaimConfirm /> },
  { path: "/paytently/card-collected", component: <PaytentlyCardCollected /> },
  { path: "*", component: <NotFound type="Page" /> },
];
export const authRoutes = [
  { path: `/login`, component: <Auth /> },
  // {path: `/agent-login`, component: <Auth /> },
  { path: `/agent-login`, component: <AgentLogin /> },
  { path: `/forgot-password`, component: <AuthNew /> },
  { path: `/forgot-password/agent`, component: <AuthNew /> },
  { path: `/signup`, component: <Auth /> },
  { path: `/signup/:code`, component: <Auth /> },
  { path: "*", component: <NotFound type="Page" /> },
];
export const guestRoutes = [{ path: "*", component: <NotFound type="Page" /> }];
export const AgentCommissionRoutes = [
  {
    path: "/agent-commission",
    component: (
      <AgentRoute>
        <PermissionRoute permission="agent-commission.view">
          <AgentCommission />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/leads",
    component: (
      <AgentRoute>
        <PermissionRoute permission="leads.view">
          <Leads />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/sub-agents",
    component: (
      <AgentRoute>
        <PermissionRoute permission="sub-agents.view">
          <SubAgents />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/commissions",
    component: (
      <AgentRoute>
        <PermissionRoute permission="commissions.view">
          <Commissions />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/clients",
    component: (
      <AgentRoute>
        <PermissionRoute permission="clients.view">
          <Clients />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/documents",
    component: (
      <AgentRoute>
        <PermissionRoute permission="documents.view">
          <Documents />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/reports",
    component: (
      <AgentRoute>
        <PermissionRoute permission="reports.view">
          <Reports />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/support",
    component: (
      <AgentRoute>
        <PermissionRoute permission="support.view">
          <Support />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/agent-profile",
    component: (
      <AgentRoute>
        <PermissionRoute permission="agent-profile.view">
          <AgentProfile />
        </PermissionRoute>
      </AgentRoute>
    ),
  },
  {
    path: "/fee-model-requests",
    component: (
      <AgentRoute>
        <FeeModelRequests />
      </AgentRoute>
    ),
  },
  { path: "*", component: <NotFound type="Page" /> },
];
