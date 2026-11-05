import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { useVirtualIbanProcessingStatus, useVirtualIbans } from "../../hooks/useVirtualIban";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import useWindowWidth from "../../utils/useWindowWidth";
import InstaPayLoader from "../Loader";
import TopRight from "../topRight";
import Compliance from "./Compliance";
import AccountsSidebar from "./components/AccountsSidebar";
import BalanceHeader from "./components/BalanceHeader";
import IbanCreationFailed from "./components/IbanCreationFailed";
import InactiveIban from "./components/InactiveIban";
import MonthlyExpenses from "./components/MonthlyExpenses";
import QuickActions from "./components/QuickActions";
import RecentTransactions from "./components/RecentTransactions";
import TabsNav from "./components/TabsNav";
import CryptoChannels from "./CryptoChannels";
import IBAN from "./IBAN/IBAN";
import IBANDetails from "./IBAN/IBANDetails";
import Manage from "./Manage/Manage";
import OnboardingIBAN from "./OnBoardingIBAN";
import styles from "./styles/index.module.css";
import { asVirtualIbanArray, isVirtualIbanAdminBlocked } from "./utils/virtualIban";
import VirtualIbanModal from "./VirtualIbanModal";
import Notifications from "../Notifications";
import LanguagePicker from "../LanguagePicker";
import { ChevronLeft } from "react-feather";

const VirtualBank = () => {
  const { userDetails, selectedAccount, setSelectedAccount } = useContext(UserContext);
  const { t } = useTranslation();
  const can = usePermission();
  const width = useWindowWidth();
  const { data: rawIbans = [], isLoading: ibansLoading } = useVirtualIbans(userDetails?._id);
  const { data: ibanCreationStatus, isLoading: ibanCreationStatusLoading } =
    useVirtualIbanProcessingStatus();
  const [activeTab, setActiveTab] = useState("overview");
  const [showGetIBAN, setShowGetIBAN] = useState(false);
  const ibanDetailsRef = useRef(null);
  const onboardingRef = useRef(null);
  const [onboardingStep, setOnboardingStep] = useState("landing");

  const ibans = useMemo(() => asVirtualIbanArray(rawIbans), [rawIbans]);
  const creationInProgress = ibanCreationStatus?.inProgress === true;
  // shortcut: only shown when the user has no IBAN yet; a failed second account still lands on the dashboard
  const creationFailed = ibanCreationStatus?.failed === true;
  const isInitialLoading = ibansLoading || ibanCreationStatusLoading;
  const canCreateIban = can("virtual-iban.account.create");
  const canViewDetails = can("virtual-iban.details.view");
  const canViewTransactions = can("virtual-iban.transactions.view");
  const canUpdateStatus = can("virtual-iban.status.update");

  const selectedIban = useMemo(
    () => ibans.find((iban) => (iban?._id || iban?.id) === selectedAccount) || ibans[0],
    [ibans, selectedAccount],
  );
  const selectedIbanAdminBlocked = isVirtualIbanAdminBlocked(selectedIban);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [q, setQ] = useState("");
  const [order, setOrder] = useState("desc");

  const skip = (page - 1) * limit;

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "virtual-iban-transactions",
      selectedIban?._id || selectedIban?.id,
      page,
      limit,
      statusFilter,
      typeFilter,
      q,
      order,
    ],
    queryFn: async () => {
      const id = selectedIban?._id || selectedIban?.id;
      if (!id) return { items: [], pagination: undefined };

      const params = new URLSearchParams();
      params.append("iban_id", id);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (q) params.append("q", q);
      if (order) params.append("order", order);
      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("skip", String(skip));

      const res = await apiWrapper({
        endpoint: `/api/virtual-iban/transactions??${params.toString()}`,
        method: "GET",
      });

      if (Array.isArray(res)) return { items: res, pagination: res.pagination };
      if (res && res.data && Array.isArray(res.data))
        return { items: res.data, pagination: res.pagination };
      return { items: [], pagination: undefined };
    },
    enabled: !!(selectedIban && canViewTransactions),
    keepPreviousData: true,
  });

  const {
    data: inquiries = [],
    isLoading: inquriesLoading,
    refetch: refetchInquries,
  } = useQuery({
    queryKey: ["user-compliance-inquiries"],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: "/api/compliance/inquiries",
        method: "GET",
        isDecrypted: true,
      });
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });

  useEffect(() => {
    if (inquiries.find((req) => req.status === "REQUESTED" || req.status === "action_needed")) {
      setActiveTab("compliance");
    }
  }, [inquiries]);

  useEffect(() => {
    if (!selectedAccount && ibans?.length) {
      setSelectedAccount(ibans[0]?._id || ibans[0]?.id);
    }
    if (ibans?.length) {
      setShowGetIBAN(false);
    }
  }, [ibans, selectedAccount]);

  const handleOpenIBAN = () => {
    if (!canCreateIban) return;
    setShowGetIBAN(true);
    setSelectedAccount(null);
  };

  const handleBackToDashboard = () => {
    setShowGetIBAN(false);
    setSelectedAccount(ibans[0]?._id || ibans[0]?.id || null);
  };

  const scrollToIbanDetails = () => {
    const scroll = () => {
      ibanDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(scroll);
    } else {
      setTimeout(scroll, 0);
    }
  };

  const handleShowIbanDetails = () => {
    if (!canViewDetails) return;
    setActiveTab("ibanassets");
    scrollToIbanDetails();
  };

  useEffect(() => {
    if (activeTab === "ibanassets") {
      scrollToIbanDetails();
    }
  }, [activeTab, selectedAccount]);

  // Same gates as TabsNav, so a link can't open a tab the user can't see.
  const linkableTabs = {
    "crypto-channels": canViewDetails,
    ibanassets: canViewDetails,
    "transaction-history": canViewTransactions,
    compliance: true,
  };
  const location = useLocation();
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (linkableTabs[tab]) setActiveTab(tab);
  }, [location.search, canViewDetails, canViewTransactions]);

  useEffect(() => {
    refetch();
  }, []);

  console.log(rawIbans, "rawIbans");
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>
            {userDetails?.account_type === "business" ? t("Business IBAN") : t("My virtual bank")}
          </h1>
          <p>
            {userDetails?.account_type === "business"
              ? t("Activate a dedicated business account to receive and hold company funds.")
              : t("Manage and monitor your InstaPay Virtual Bank Account.")}
          </p>
        </div>

        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>
      {(showGetIBAN || (ibans.length === 0 && canCreateIban)) &&
        userDetails?.account_type === "business" && (
          <div className={styles.mobileTop}>
            <div className={styles.headerTitle}>
              {onboardingStep !== "landing" && (
                <ChevronLeft size={22} onClick={() => onboardingRef.current?.back()} />
              )}
              <h1>
                {onboardingStep === "pricing"
                  ? t("Your pricing")
                  : onboardingStep === "ActivateAccount"
                    ? t("Activate your account")
                    : userDetails?.account_type === "business"
                      ? t("Business IBAN")
                      : t("My virtual bank")}
              </h1>
            </div>
            <div className={styles.mobileTopRight}>
              <Notifications hideShadow={true} />
              <LanguagePicker hideShadow={true} />
            </div>
          </div>
        )}
      {isInitialLoading ? (
        <div style={{ minHeight: "520px", width: "100%" }}>
          <InstaPayLoader fallback transparent fullHeight />
        </div>
      ) : creationInProgress ? (
        <div style={{ minHeight: "520px", width: "100%" }} />
      ) : creationFailed && !showGetIBAN && ibans.length === 0 && canCreateIban ? (
        <div className={styles.main}>
          <IbanCreationFailed
            feeRefunded={ibanCreationStatus?.feeRefunded}
            onRetry={handleOpenIBAN}
          />
        </div>
      ) : showGetIBAN || (ibans.length === 0 && canCreateIban) ? (
        userDetails?.account_type === "business" ? (
          <OnboardingIBAN ref={onboardingRef} onStepChange={setOnboardingStep} />
        ) : (
          <IBAN onCreated={handleBackToDashboard} />
        )
      ) : selectedIbanAdminBlocked ? (
        <div className={styles.main}>
          <InactiveIban />
        </div>
      ) : (
        <div className={styles.main}>
          <div className={styles.topPanel}>
            <AccountsSidebar
              selectedAccount={selectedAccount}
              onSelect={setSelectedAccount}
              setShowGetIBAN={handleOpenIBAN}
              accounts={ibans}
              isLoading={ibansLoading}
            />
            <div className={styles.panelDivider} />
            <BalanceHeader
              iban={selectedIban}
              isLoading={ibansLoading}
              onShowDetails={handleShowIbanDetails}
            />
          </div>

          <div className={styles.section}>
            <QuickActions selectedIban={selectedIban} />
          </div>

          <div className={styles.section}>
            <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {activeTab === "overview" && (
            <div className={styles.tabContent}>
              {canViewTransactions && (
                <>
                  <MonthlyExpenses />
                  <div className={styles.section}>
                    <RecentTransactions
                      transactions={transactions.items ?? []}
                      setActiveTab={setActiveTab}
                      loading={transactionsLoading}
                      page={transactions?.pagination?.page}
                      setPage={setPage}
                      limit={limit}
                      setLimit={setLimit}
                      totalPages={transactions?.pagination?.totalPages ?? 1}
                      setStatusFilter={setStatusFilter}
                      setTypeFilter={setTypeFilter}
                      setQ={setQ}
                      selectedIban={selectedIban}
                      setOrder={setOrder}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "transaction-history" && canViewTransactions && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <RecentTransactions
                  transactions={transactions.items ?? []}
                  setActiveTab={setActiveTab}
                  loading={transactionsLoading}
                  page={transactions?.pagination?.page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  totalPages={transactions?.pagination?.totalPages ?? 1}
                  setStatusFilter={setStatusFilter}
                  setTypeFilter={setTypeFilter}
                  setQ={setQ}
                  setOrder={setOrder}
                  selectedIban={selectedIban}
                />
              </div>
            </div>
          )}

          {activeTab === "ibanassets" && canViewDetails && (
            <div className={styles.tabContent} ref={ibanDetailsRef}>
              <div className={styles.section}>
                <IBANDetails
                  ibanId={selectedIban?._id || selectedIban?.id}
                  fallbackIban={selectedIban}
                />
              </div>
            </div>
          )}
          {activeTab === "manage" && canUpdateStatus && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <Manage />
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <Compliance
                  refetch={refetchInquries}
                  inquiries={inquiries}
                  isLoading={inquriesLoading}
                />
              </div>
            </div>
          )}
          {activeTab === "crypto-channels" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <CryptoChannels selectedIban={selectedIban} />
              </div>
            </div>
          )}
        </div>
      )}
      {canCreateIban && (
        <VirtualIbanModal
          isOpen={creationInProgress}
          toggle={() => {}}
          onCreated={handleBackToDashboard}
          resumeProcessingData={creationInProgress}
          resumeProcessingLoading={ibanCreationStatusLoading}
        />
      )}
    </div>
  );
};

export default VirtualBank;
