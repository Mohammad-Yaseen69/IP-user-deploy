import { useState } from "react";
import { useTranslation } from "react-i18next";
import useWindowWidth from "../../utils/useWindowWidth";
import TopRight from "../topRight";
import FeeModelRequestModal from "./FeeModelRequestModal";
import LeadModal from "./Leads/LeadModal";
import styles from "./styles/index.module.css";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import leadsIcon from "./icons/leads.svg";
import clientsIcon from "./icons/clients.svg";
import commissionIcon from "./icons/commission.svg";
import ibanIcon from "./icons/iban.svg";
import feePacksIcon from "./icons/feePacks.svg";
import claimPendingIcon from "./icons/claimPending.svg";

const AgentCommission = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEntityType] = useState("corporate");
  const [isFeeRequestModalOpen, setIsFeeRequestModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLeadSubmit = () => {};

  const { data: analytics = {} } = useQuery({
    queryKey: ["agentAnalytics"],
    queryFn: async () => {
      const dec = await apiWrapper({
        endpoint: "/api/agent-leads/analytics",
        method: "GET",
        isDecrypted: true,
      });
      return dec?.data || dec || {};
    },
  });

  const metricsData = [
    {
      id: 1,
      title: "Total Leads",
      value: analytics.totalLeads ?? 0,
      hasSubtext: true,
      isTrend: true,
      subtext: `${analytics.notRegistered ?? 0} not registered`,
      icon: leadsIcon,
      isCircleIcon: true,
    },
    {
      id: 2,
      title: "Total Clients",
      value: analytics.totalClients ?? 0,
      hasSubtext: true,
      isTrend: false,
      subtext: `${analytics.conversionRate || "0.0%"} conversion`,
      icon: clientsIcon,
      isCircleIcon: true,
    },
    {
      id: 3,
      title: "Commission",
      value: analytics.totalCommission ?? "€0.00",
      hasSubtext: true,
      isTrend: true,
      subtext: "Earned payout",
      icon: commissionIcon,
      isCircleIcon: true,
    },
    {
      id: 4,
      title: "IBANs Generated",
      value: analytics.ibansGenerated ?? 0,
      hasSubtext: true,
      isTrend: false,
      subtext: "Active bank accounts",
      icon: ibanIcon,
      isCircleIcon: false,
    },
    {
      id: 5,
      title: "Total Fee Packs",
      value: analytics.totalFeePacks ?? 0,
      hasSubtext: true,
      isTrend: false,
      subtext: "Approved pricing models",
      icon: feePacksIcon,
      isCircleIcon: true,
    },
    {
      id: 6,
      title: "Leads IBAN Pending",
      value: analytics.leadsIbanPending ?? 0,
      hasSubtext: true,
      isTrend: false,
      subtext: "In compliance review",
      icon: ibanIcon,
      isCircleIcon: false,
    },
    {
      id: 8,
      title: "Claim Pending Leads",
      value: analytics.claimPending ?? 0,
      hasSubtext: true,
      isTrend: false,
      subtext: "Awaiting user claim",
      icon: claimPendingIcon,
      isCircleIcon: false,
    },
  ];

  const funnelItems = analytics.funnelData || [
    { label: "Submitted Leads", value: 0, width: "0%", color: "#EAB308" },
    { label: "Claim Pending", value: 0, width: "0%", color: "#F59E0B" },
    {
      label: "Onboarding / Compliance Pending",
      value: 0,
      width: "0%",
      color: "#4F46E5",
    },
    { label: "IBAN Generated", value: 0, width: "0%", color: "#10B981" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Overview")}</h1>
          <p>{t("Operate the white-label platform across all tenants.")}</p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.metricsGrid}>
          {metricsData.map((card) => (
            <div key={card.id} className={styles.metricCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{t(card.title)}</span>
                {card.icon && (
                  <div
                    className={
                      card.isCircleIcon ? styles.iconWrapperCircle : styles.iconWrapperSquare
                    }
                  >
                    <img src={card.icon} width={24} height={24} alt="" />
                  </div>
                )}
              </div>
              <div className={styles.cardValue}>{card.value}</div>
              {card.hasSubtext && (
                <div className={styles.cardSubtext}>
                  <span className={card.isTrend ? styles.trendUp : ""}>{card.subtext}</span>
                  {card.subtextLabel && ` ${t(card.subtextLabel)}`}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.bottomContent}>
          <div className={styles.leftColumn}>
            <div className={styles.boxSection}>
              <h3 className={styles.sectionTitle}>{t("Lead funnel")}</h3>
              <div className={styles.funnelList}>
                {funnelItems.map((item, index) => (
                  <div key={index} className={styles.funnelItem}>
                    <div className={styles.funnelLabelContainer}>
                      <div className={styles.funnelLabel}>{t(item.label)}</div>
                      <div className={styles.funnelValueDark}>{item.value}</div>
                    </div>
                    <div className={styles.funnelBarContainer}>
                      <div
                        className={styles.funnelBar}
                        style={{
                          width: item.width || "0%",
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className={styles.rightColumn}>
            <div className={styles.boxSection} style={{ height: "100%" }}>
              <div className={styles.subAgentHeaderRow}>
                <h3 className={styles.sectionTitle}>{t("Sub-agent network")}</h3>
              </div>

              <div className={styles.subAgentTable}>
                <div className={styles.tableHeaderRow}>
                  <div className={styles.colAgentName}>{t("SUB-AGENT NETWORK")}</div>
                  <div className={styles.colActive}>{t("TOTAL NETWORK")}</div>
                  <div className={styles.colConv}>{t("CONVERSION")}</div>
                </div>

                <div className={styles.tableDataRow}>
                  <div className={styles.colAgentName}>
                    <div className={`${styles.avatar} ${styles.avatarPurple}`}>{t("BO")}</div>
                    <span className={styles.agentName}>{t("Broker One")}</span>
                  </div>
                  <div className={styles.colActive}>5</div>
                  <div className={styles.colConv}>50%</div>
                </div>

                <div className={styles.tableDataRow}>
                  <div className={styles.colAgentName}>
                    <div className={`${styles.avatar} ${styles.avatarBlue}`}>TL</div>
                    <span className={styles.agentName}>TradeBridge Ltd</span>
                  </div>
                  <div className={styles.colActive}>11</div>
                  <div className={styles.colConv}>58%</div>
                </div>

                <div className={styles.tableDataRow}>
                  <div className={styles.colAgentName}>
                    <div className={`${styles.avatar} ${styles.avatarPink}`}>AN</div>
                    <span className={styles.agentName}>Aicha Ndiaye</span>
                  </div>
                  <div className={styles.colActive}>2</div>
                  <div className={styles.colConv}>20%</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        {/* <div className={styles.boxSection}>
                    <h3 className={styles.sectionTitle}>{t("Quick actions")}</h3>
                    <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} onClick={() => handleOpenModal('corporate')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            {t("Submit business lead")}
                        </button>
                        <button className={styles.actionBtn} onClick={() => handleOpenModal('individual')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {t("Submit individual lead")}
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsFeeRequestModalOpen(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5926F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            {t("Request fee model")}
                        </button>
                    </div>
                </div> */}
      </div>

      <LeadModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleLeadSubmit}
        initialEntityType={initialEntityType}
      />

      <FeeModelRequestModal
        isOpen={isFeeRequestModalOpen}
        toggle={() => setIsFeeRequestModalOpen(!isFeeRequestModalOpen)}
      />
    </div>
  );
};

export default AgentCommission;
