import React, { useContext, useEffect, useMemo, useState } from "react";
import styles from "./styles/index.module.scss";
import TopRight from "../topRight";
import { useTranslation } from "react-i18next";
import { Search, Filter, Sliders } from "react-feather";
import { Button, Input } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import BeneficiaryCard from "./BeneficiaryCard";
import { UserContext } from "../../Context/UserContext";
import add_ben from "./add_ben.svg";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import AddBeneficiaryFlowV2 from "../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2";
import { USE_NEW_BENEFICIARY_FLOW } from "../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (Newest first)" },
  { value: "date_asc", label: "Date (Oldest first)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "type", label: "Type" },
];

const getDisplayName = (b) =>
  b?.beneficiary_type === "business"
    ? b?.company_name || ""
    : `${b?.first_name || ""} ${b?.last_name || ""}`.trim();

const getCreatedAt = (b) => new Date(b?.createdAt || 0).getTime();

const Beneficiaries = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { beneficiaries, verifyToken, getUserBeneficiaries, userDetails } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    if (userDetails) {
      getUserBeneficiaries();
    }
  }, [userDetails]);

  const can = usePermission();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState(null);
  const [beneficiaryMode, setBeneficiaryMode] = useState("edit");

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


  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const list = (beneficiaries || []).filter((item) => {
      if (typeFilter === "business" && item?.beneficiary_type !== "business") return false;
      if (typeFilter === "individual" && item?.beneficiary_type === "business") return false;

      if (!q) return true;
      return [
        item?.first_name,
        item?.last_name,
        item?.company_name,
        item?.email,
        item?.phone,
        item?.country_name,
        item?.city,
      ].some((v) => v?.toLowerCase().includes(q));
    });

    return [...list].sort((a, b) => {
      if (sortBy === "date_desc" || sortBy === "date_asc") {
        const diff = getCreatedAt(a) - getCreatedAt(b);
        return sortBy === "date_desc" ? -diff : diff;
      }
      if (sortBy === "type") {
        return (a?.beneficiary_type || "").localeCompare(b?.beneficiary_type || "");
      }
      const cmp = getDisplayName(a).localeCompare(getDisplayName(b));
      return sortBy === "name_desc" ? -cmp : cmp;
    });
  }, [beneficiaries, searchTerm, typeFilter, sortBy]);

  const toggleMenu = (name) => setOpenMenu((prev) => (prev === name ? null : name));

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-dropdown-root]")) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);
  const renderToolbar = () => (
    <div className={styles.toolbar} data-dropdown-root>
      <div className={styles.dropdown}>
        <Button
          color="transparent"
          className={styles.toolbar_btn}
          onClick={() => toggleMenu("filter")}
        >
          <Filter size={16} /> {t("Filter")}
        </Button>
        {openMenu === "filter" && (
          <div className={styles.menu}>
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
            : t("No Beneficiaries")}
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
            <div style={{ width: "100%" }} className={styles.search_field}>
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
                <img src={add_ben} loading="lazy" alt={t("Add Beneficiary")} />
              </button>
            ) : (
              <Link to={"/beneficiaries/add"}>
                <img src={add_ben} loading="lazy" />
              </Link>
            )}
          </div>
          {renderToolbar()}
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
              : t("No Beneficiaries")}
          </div>
        </div>
      </div>

      {USE_NEW_BENEFICIARY_FLOW && (
        <AddBeneficiaryFlowV2
          open={isAddOpen}
          handleClose={() => setIsAddOpen(false)}
          onSaveSuccess={() => getUserBeneficiaries()}
        />
      )}

      {USE_NEW_BENEFICIARY_FLOW && activeBeneficiary && (
        <AddBeneficiaryFlowV2
          open={!!activeBeneficiary}
          mode={beneficiaryMode}
          existingBeneficiary={activeBeneficiary}
          handleClose={() => setActiveBeneficiary(null)}
          onSaveSuccess={() => getUserBeneficiaries()}
        />
      )}
    </>
  );
};

export default Beneficiaries;
