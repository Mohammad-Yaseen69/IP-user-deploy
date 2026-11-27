import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search } from "react-feather";
import { useTranslation } from "react-i18next";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import PageHeader from "../../Common/PageHeader";
import styles from "./styles/Index.module.css";
import ActivityTable from "./components/Table";
import { EntityDropdown } from "./components/EntityDropdown";
import { ActionDropdown } from "./components/ActionDropdown";
import adminActivitiesData from "../../Data/userActivitiesData.json";
import Paginations from "../../Common/Component/Paginations";
const LogActivity = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);
  const fmt = (str) => str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? str;

  const { data: ActivityData, isLoading: Loading } = useQuery({
    queryKey: ["activity-logs", page, limit, search],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/business-agents/activity-logs?limit=${limit}&page=${page}&search=${search}`,
        method: "GET",
        isEncrypted: false,
        isDecrypted: true,
      }),
    keepPreviousData: true,
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);
  const data = ActivityData?.data?.logs || [];
  const totalPages = ActivityData?.data?.totalPages || 1;
  const filteredData = data.filter((item) => {
    const entityMatch = selectedEntity ? item.entityType === selectedEntity : true;

    const actionMatch = selectedActions.length > 0 ? selectedActions.includes(item.action) : true;

    return entityMatch && actionMatch;
  });

  return (
    <div className={styles.container}>
      <PageHeader
        title={t("Activity Feed")}
        subtitle={t("Stay on top of user actions and permission settings.")}
      />
      <div className={styles.main}>
        <div className={styles.searchCont}>
          <div className={styles.searchBox}>
            <Search />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search for Activity Feeds")}
            />
          </div>
          <div className={styles.mobileCOntainer}>
            <EntityDropdown
              fmt={fmt}
              value={selectedEntity}
              onChange={setSelectedEntity}
              adminActivitiesData={adminActivitiesData}
            />
            <br />
            <ActionDropdown
              selectedEntity={selectedEntity}
              value={selectedActions}
              onChange={setSelectedActions}
              fmt={fmt}
              adminActivitiesData={adminActivitiesData}
            />
          </div>
        </div>
        <ActivityTable filteredData={filteredData} Loading={Loading} />
        <Paginations
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};

export default LogActivity;
