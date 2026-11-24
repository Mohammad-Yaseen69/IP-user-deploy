import React, { useContext, useEffect, useState } from "react";
import styles from "./styles/index.module.scss";
import TopRight from "../topRight";
import { useTranslation } from "react-i18next";
import { Search, Filter, Sliders } from "react-feather";
import { Button, Input } from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import BeneficiaryCard from "./BeneficiaryCard";
import { UserContext } from "../../Context/UserContext";
import add_ben from "./add_ben.svg";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import AddBeneficiaryFlowV2 from "../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2";
import { USE_NEW_BENEFICIARY_FLOW } from "../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants";
import InstaPayLoader from "../Loader";
import {
  useBeneficiariesPage,
  useInvalidateBeneficiaryPages,
} from "../../hooks/BeneficiaryHooks/useBeneficiariesPage";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

// `channel` is a case-insensitive contains match, so "mobile" also covers stored "mobile_wallet"
// and "cash" covers "cash_pickup". InstaPay wallet needs the exact match so it skips "mobile_wallet".
const ACCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "All", filters: {} },
  { value: "bank", label: "Bank Account", filters: { channel: "bank" } },
  { value: "mobile", label: "Mobile Wallet", filters: { channel: "mobile" } },
  { value: "wallet", label: "InstaPay Wallet", filters: { account_type: "wallet" } },
  { value: "crypto", label: "Crypto", filters: { channel: "crypto" } },
  { value: "card", label: "Card", filters: { channel: "card" } },
  { value: "cash", label: "Cash Pickup", filters: { channel: "cash" } },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
  { value: "date_desc", label: "Date (Newest first)" },
  { value: "date_asc", label: "Date (Oldest first)" },
  { value: "type", label: "Type" },
];

const Beneficiaries = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { verifyToken, getUserBeneficiaries } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [openMenu, setOpenMenu] = useState(null); // "filter" | "sort" | null

  const can = usePermission();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState(null);
  const [beneficiaryMode, setBeneficiaryMode] = useState("edit");

  const location = useLocation();
  useEffect(() => {
    const wantsAdd = new URLSearchParams(location.search).get("action") === "add";
    if (wantsAdd && USE_NEW_BENEFICIARY_FLOW && can("beneficiaries.add")) setIsAddOpen(true);
  }, [location.search]);

  const openBeneficiary = (beneficiary, mode) => {
    verifyToken();

    if (!USE_NEW_BENEFICIARY_FLOW) {
      const businessPath = beneficiary?.beneficiary_type === "business" ? "/business" : "";
      navigate(`/beneficiaries/edit${businessPath}?user_id=${beneficiary?._id}&${mode}=true`);
      return;
    }

    setActiveBeneficiary(beneficiary);
    setBeneficiaryMode(mode);
  };

  const activeFilterCount = (typeFilter !== "all") + (accountTypeFilter !== "all");
  const accountTypeFilters = ACCOUNT_TYPE_OPTIONS.find(
    (o) => o.value === accountTypeFilter,
  ).filters;

  const {
    beneficiaries: filtered,
    isLoading,
    hasNextPage,
    loaderRef,
  } = useBeneficiariesPage({
    search: searchTerm,
    type: typeFilter,
    sort: sortBy,
    filters: accountTypeFilters,
  });
  const invalidateBeneficiaryPages = useInvalidateBeneficiaryPages();

  const onBeneficiarySaved = () => {
    getUserBeneficiaries();
    invalidateBeneficiaryPages();
  };

  const emptyText = isLoading ? t("Loading beneficiaries...") : t("No Beneficiaries");
  const isMobile = useMediaQuery("(max-width:1000px)");
  const loadMore = hasNextPage && (
    <div ref={loaderRef} style={{ height: 60, flexShrink: 0 }}>
      <InstaPayLoader />
    </div>
  );

  const toggleMenu = (name) => setOpenMenu((prev) => (prev === name ? null : name));

  const renderToolbar = () => (
    <div className={styles.toolbar}>
      <div className={styles.dropdown}>
        <Button
          color="transparent"
          className={styles.toolbar_btn}
          onClick={() => toggleMenu("filter")}
        >
          <Filter size={16} /> {t("Filter")}
          {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
        </Button>
        {openMenu === "filter" && (
          <div className={styles.menu}>
            <div className={styles.menu_title}>{t("Type")}</div>
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`${styles.menu_item} ${typeFilter === o.value ? styles.menu_item_active : ""}`}
                onClick={() => {
                  setTypeFilter(o.value);
                  setOpenMenu(null);
                }}
              >
                {t(o.label)}
              </button>
            ))}
            <div className={styles.menu_title}>{t("Account Type")}</div>
            {ACCOUNT_TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`${styles.menu_item} ${accountTypeFilter === o.value ? styles.menu_item_active : ""}`}
                onClick={() => {
                  setAccountTypeFilter(o.value);
                  setOpenMenu(null);
                }}
              >
                {t(o.label)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.dropdown}>
        <Button
          color="transparent"
          className={styles.toolbar_btn}
          onClick={() => toggleMenu("sort")}
        >
          <Sliders size={16} /> {t("Sort")}
        </Button>
        {openMenu === "sort" && (
          <div className={styles.menu}>
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`${styles.menu_item} ${sortBy === o.value ? styles.menu_item_active : ""}`}
                onClick={() => {
                  setSortBy(o.value);
                  setOpenMenu(null);
                }}
              >
                {t(o.label)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.top}>
          <h4>{t("Beneficiaries")}</h4>
          <TopRight />
        </div>
        <div className={styles.table_header}>
          <div className={styles.search_field}>
            <Search />
            <Input
              type="search"
              placeholder={t("Search for Beneficiaries")}
              style={{ padding: ".5rem 1rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {renderToolbar()}

          {can("beneficiaries.add") &&
            (USE_NEW_BENEFICIARY_FLOW ? (
              <Button
                color="transparent"
                className={`${styles.btn} ${styles.add_btn}`}
                style={{ padding: ".5rem 1rem" }}
                onClick={() => {
                  verifyToken();
                  setIsAddOpen(true);
                }}
              >
                {t("Add Beneficiary")}
              </Button>
            ) : (
              <Button
                color="transparent"
                className={`${styles.btn} ${styles.add_btn}`}
                style={{ padding: ".5rem 1rem" }}
                onClick={verifyToken}
              >
                <Link to={"/beneficiaries/add"}>{t("Add Beneficiary")}</Link>
              </Button>
            ))}
        </div>

        <div
          style={{
            maxHeight: `calc(${100}vh - ${300}px)`,
            overflowY: "auto",
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem 0 1rem 1rem",
            margin: "1rem -1rem",
            overflowX: "auto",
            height: "fit-content",
            minHeight: "500px",
          }}
        >
          {can("beneficiaries.view-all") && filtered.length > 0
            ? filtered.map((item) => (
                <BeneficiaryCard
                  key={item._id}
                  user={item}
                  onEdit={(ben) => openBeneficiary(ben, "edit")}
                  onView={(ben) => openBeneficiary(ben, "view")}
                />
              ))
            : emptyText}
          {!isMobile && loadMore}
        </div>
      </div>

      <div className={styles.mobile}>
        <div className={styles.top}>
          <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {t("Beneficiaries")}
          </h4>
        </div>
        <div className={styles.bottom}>
          <div className={styles.table_header}>
            <div style={{ flex: 1 }} className={styles.search_field}>
              <Search />
              <Input
                type="search"
                placeholder={t("Search for Beneficiaries")}
                style={{ padding: ".5rem 1rem" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {USE_NEW_BENEFICIARY_FLOW ? (
              <button
                type="button"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "inline-flex",
                }}
                onClick={() => setIsAddOpen(true)}
              >
                <img
                  src={add_ben}
                  width={42}
                  height={42}
                  loading="lazy"
                  alt={t("Add Beneficiary")}
                />
              </button>
            ) : (
              <Link to={"/beneficiaries/add"}>
                <img src={add_ben} loading="lazy" />
              </Link>
            )}
          </div>
          <div className="mt-3">{renderToolbar()}</div>
          <div className={styles.table_body}>
            {filtered.length > 0
              ? filtered.map((item) => (
                  <BeneficiaryCard
                    key={item._id}
                    user={item}
                    onEdit={(ben) => openBeneficiary(ben, "edit")}
                    onView={(ben) => openBeneficiary(ben, "view")}
                  />
                ))
              : emptyText}
            {isMobile && loadMore}
          </div>
        </div>
      </div>

      {USE_NEW_BENEFICIARY_FLOW && (
        <AddBeneficiaryFlowV2
          open={isAddOpen}
          handleClose={() => setIsAddOpen(false)}
          onSaveSuccess={onBeneficiarySaved}
        />
      )}

      {USE_NEW_BENEFICIARY_FLOW && activeBeneficiary && (
        <AddBeneficiaryFlowV2
          open={!!activeBeneficiary}
          mode={beneficiaryMode}
          existingBeneficiary={activeBeneficiary}
          handleClose={() => setActiveBeneficiary(null)}
          onSaveSuccess={onBeneficiarySaved}
        />
      )}
    </>
  );
};

export default Beneficiaries;
