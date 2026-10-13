import { Search } from "react-feather";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import { Input } from "reactstrap";
import TopRight from "../topRight";
import { useTranslation } from "react-i18next";
import sent_white from "../TransactionsNewApi/files/sent_white.png";
import sent_grey from "../TransactionsNewApi/files/sent_grey.png";
import received_white from "../TransactionsNewApi/files/received_white.png";
import received_grey from "../TransactionsNewApi/files/received_grey.png";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import q_styles from "./styles/index.module.css";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import InstaPayLoader from "../Loader";
import QuotationReceivedItem from "./QuotationReceivedItem";
import QuotationSentItem from "./QuotationSentItem";
import { useLocation } from "react-router";
import ReceivedItemMobile from "./Mobile/ReceivedItem";
import SentItemMobile from "./Mobile/SentItem";
import calendar from "../TransactionsNewApi/files/calendar.png";
import { DateRangePicker } from "react-date-range";
import { useQuery } from "@tanstack/react-query";

const Quotations = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState("Received Quotations");
  const [searchQuery, setSearchQuery] = useState("");
  const { userDetails, authHeader } = useContext(UserContext);
  const [activeItem, setActiveItem] = useState(0);
  // const [receivedQuotations, setReceivedQuotations] = useState([])

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const id = queryParams.get("_id");
  const currentIndex = queryParams.get("current-index");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const handleChange = (ranges) => {
    if (ranges.selection) {
      const startDate = ranges.selection.startDate.toISOString().split("T")[0];
      const endDate = ranges.selection.endDate.toISOString().split("T")[0];

      const formattedDateRange = {
        from: startDate,
        to: endDate,
      };

      setDateRange(ranges.selection);
    }
  };

  const { data: receivedQuotations = [], isLoading: isLoadingReceived } =
    useQuery({
      queryKey: ["receivedQuotations", userDetails?._id],
      queryFn: async () => {
        const response = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/quotation/get-quotation-by-reciever/${userDetails?._id}`,
          { headers: authHeader },
        );
        const decrypted = await decryptData(response?.data?.data);
        return decrypted?.quotation ?? [];
      },
      enabled: !!userDetails?._id,
    });
  const { data: sentQuotations = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["sentQuotations", userDetails?._id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/quotation/get-quotation-by-sender/${userDetails._id}`,
        { headers: authHeader },
      );
      const decrypted = await decryptData(response?.data?.data);
      return decrypted?.quotation ?? [];
    },
    enabled: !!userDetails?._id,
  });
  const isLoading = isLoadingReceived || isLoadingSent;
  useEffect(() => {
    if (tab) {
      setActive(tab === "received" ? "Received Quotations" : "Sent Quotations");
    }
  }, [tab]);

  useEffect(() => {
    setActiveItem(0);
  }, [active]);
  useEffect(() => {
    if (tab === "sent" && sentQuotations.length > 0) {
      if (currentIndex) {
        setActiveItem(currentIndex);
      } else {
        const ind = sentQuotations.findIndex((i) => i?._id === id);
        setActiveItem(ind + 1);
      }
    }
    if (tab === "received" && receivedQuotations.length > 0) {
      const ind = receivedQuotations.findIndex((i) => i?._id === id);
      setActiveItem(ind + 1);
    }
  }, [tab, id, sentQuotations, receivedQuotations]);

  const handleClickOutside = useCallback((event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      setShowDatePicker(false);
    }
  }, []);

  const handleDatePickerClick = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const filteredReceived = useMemo(() => {
    if (searchQuery.length > 0) {
      return receivedQuotations.filter(
        (item) =>
          item?.sender?.user?.first_name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
          item?.sender?.user?.last_name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()),
      );
    }
    return receivedQuotations;
  }, [receivedQuotations, searchQuery]);

  const filteredSent = useMemo(() => {
    if (searchQuery.length > 0) {
      return sentQuotations.filter(
        (item) =>
          item?.receiver?.user?.first_name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
          item?.receiver?.user?.last_name
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()),
      );
    }
    return sentQuotations;
  }, [sentQuotations, searchQuery]);
  const menuData = [
    {
      id: 3,
      name: "Received Quotations",
      icon_white: received_white,
      icon_grey: received_grey,
    },
    {
      id: 2,
      name: "Sent Quotations",
      icon_white: sent_white,
      icon_grey: sent_grey,
    },
  ];

  return (
    <>
      <div className={styles.container}>
        <div className={styles.top}>
          <h4>{t("Quotations")}</h4>
          <TopRight />
        </div>
        <div className={styles.table}>
          <div className={styles.menu}>
            <div className={styles.right}>
              {menuData.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background:
                      active === item.name
                        ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                        : "#f8f8f8",
                    boxShadow:
                      active === item.name
                        ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)"
                        : "none",
                    color: active === item.name ? "white" : "#848484",
                    minWidth: "200px",
                  }}
                  className={styles.menu_item}
                  onClick={() => setActive(item.name)}
                >
                  <img
                    src={
                      active === item.name ? item.icon_white : item.icon_grey
                    }
                    loading="lazy"
                    style={{ width: "18px" }}
                  />
                  <span>{t(item.name)}</span>
                  {active === item.name && <div className={styles.dot}></div>}
                </div>
              ))}
            </div>
            <div className={styles.left}>
              <div className={styles.search}>
                <Search size={16} color="#848484" />
                <Input
                  placeholder={t("Search Quotation")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.table_header}>
              <div>{t("Reference ID")}</div>
              <div>{t("Date & Time")}</div>
              {/* <div>{t("Title")}</div>
                        <div>{t("Description")}</div> */}
              {active === "Received Quotations" ? (
                <div>{t("Sender")}</div>
              ) : (
                <div>{t("Receiver")}</div>
              )}
              <div>{t("Amount")}</div>
              <div>{t("Revised Amount")}</div>
              <div>{t("Status")}</div>
              <div>{t("Actions")}</div>
              <div style={{ maxWidth: "15px" }}></div>
            </div>
            <div className={styles.table_body}>
              {isLoading ? (
                <div
                  style={{ height: "300px", width: "300px", margin: "0 auto" }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <>
                  {active === "Received Quotations" && (
                    <>
                      {filteredReceived?.length > 0 ? (
                        filteredReceived
                          ?.sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <QuotationReceivedItem
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                  {active === "Sent Quotations" && (
                    <>
                      {filteredSent.length > 0 ? (
                        filteredSent
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <QuotationSentItem
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mobile}>
        <div className={styles.top}>
          <h4>{t("Quotations")}</h4>
        </div>
        <div className={styles.table}>
          <div className={styles.menu}>
            <div className={styles.right}>
              {menuData.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background:
                      active === item.name
                        ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                        : "#f8f8f8",
                    boxShadow:
                      active === item.name
                        ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)"
                        : "none",
                    color: active === item.name ? "white" : "#848484",
                    minWidth: "200px",
                  }}
                  className={styles.menu_item}
                  onClick={() => setActive(item.name)}
                >
                  <img
                    src={
                      active === item.name ? item.icon_white : item.icon_grey
                    }
                    loading="lazy"
                    style={{ width: "18px" }}
                  />
                  <span>{item.name}</span>
                  {active === item.name && <div className={styles.dot}></div>}
                </div>
              ))}
            </div>
            <div className={styles.left}>
              <div className={styles.search}>
                <Search size={16} color="#848484" />
                <Input
                  placeholder={t("Search Quotation")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <img
                src={calendar}
                alt="c"
                loading="lazy"
                onClick={handleDatePickerClick}
              />
              {showDatePicker && (
                <div
                  ref={datePickerRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    boxShadow: "0px 0px 3px rgba(0,0,0,0.1)",
                    borderRadius: "10xp",
                    overflow: "hidden",
                    zIndex: 10000000,
                  }}
                >
                  <DateRangePicker
                    maxDate={new Date()}
                    ranges={[dateRange]}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.table_header}>
              <div>{t("Date & Time")}</div>
              <div>{t("Recipient")}</div>
              <div>{t("Amount")}</div>
              <div>{t("Revised Amount")}</div>
              <div>{t("Status")}</div>
              <div>{t("Actions")}</div>
              <div style={{ maxWidth: "15px" }}></div>
            </div>
            <div className={styles.table_body}>
              {isLoading ? (
                <div
                  style={{ height: "300px", width: "300px", margin: "0 auto" }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <>
                  {active === "Received Quotations" && (
                    <>
                      {filteredReceived.length > 0 ? (
                        filteredReceived
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <QuotationReceivedItem
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                  {active === "Sent Quotations" && (
                    <>
                      {filteredSent.length > 0 ? (
                        filteredSent
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <QuotationSentItem
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <div className={styles.table_body_mobile}>
              {isLoading ? (
                <div
                  style={{ height: "300px", width: "300px", margin: "0 auto" }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <>
                  {active === "Received Quotations" && (
                    <>
                      {filteredReceived.length > 0 ? (
                        filteredReceived
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <ReceivedItemMobile
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                  {active === "Sent Quotations" && (
                    <>
                      {filteredSent.length > 0 ? (
                        filteredSent
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((item, index) => {
                            let color;
                            if (
                              item?.status?.toLowerCase() !== "accepted" &&
                              item?.status?.toLowerCase() !== "declined"
                            ) {
                              color = "primary";
                            }
                            if (item?.status?.toLowerCase() === "accepted") {
                              color = "success";
                            }
                            if (item?.status?.toLowerCase() === "declined") {
                              color = "danger";
                            }
                            return (
                              <div
                                style={{
                                  border:
                                    id === item?._id
                                      ? "4px solid #afafaf1e"
                                      : "none",
                                }}
                              >
                                <SentItemMobile
                                  authHeader={authHeader}
                                  userDetails={userDetails}
                                  color={color}
                                  item={item}
                                  key={item._id}
                                  activeItem={activeItem}
                                  setActiveItem={setActiveItem}
                                  index={index}
                                />
                              </div>
                            );
                          })
                      ) : (
                        <span
                          style={{ textAlign: "center", marginTop: "2rem" }}
                        >
                          {t("No Quotations")}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quotations;
