import { Search } from "react-feather";
import { Badge, Card, CardBody, Col, Input } from "reactstrap";
import notf from "./files/notf.svg";
import msg from "./files/msg.svg";
import { useTranslation } from "react-i18next";
import LanguagePicker from "../LanguagePicker";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { Link } from "react-router-dom";
import InstaPayLoader from "../Loader";
import Notifications from "../Notifications";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const SearchComponent = ({ showS = false, showOthers = true }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchInFocus, setSearchInFocus] = useState(false);
  const { authHeader } = useContext(UserContext);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const can = usePermission();

  useEffect(() => {
    setIsLoading(true);
    const searchUser = async () => {
      const query = search.startsWith("@") ? search.slice(1) : search;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/search-users/${query}`,
          {
            headers: authHeader,
          },
        );
        const data = await decryptData(response.data.data);
        // console.log(data)
        setUsers(data?.users);
        setIsLoading(false);
      } catch (error) {
        // console.log(decryptData(error?.response?.data?.data));
        setIsLoading(false);
      }
    };

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (search.length > 0) {
      const timeoutId = setTimeout(() => {
        searchUser();
      }, 1500);

      setDebounceTimeout(timeoutId);
    }
  }, [search, authHeader]);

  const [showSearch, setShowSearch] = useState(showS);
  const searchRef = useRef(null);

  return (
    <div
      style={{
        padding: "0px",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        justifyContent: "space-between",
      }}
    >
      {showSearch ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#FFF",
            boxShadow: "0px 4.32752px 35.70205px 0px rgba(0, 0, 0, 0.06)",
            padding: ".5rem 1rem",
            borderRadius: "20px",
            height: "50px",
            flex: 1,
            position: "relative",
          }}
        >
          <Search />
          <input
            ref={searchRef}
            onFocus={() => setSearchInFocus(true)}
            onBlur={() =>
              setTimeout(() => {
                if (!showS) {
                  setShowSearch(false);
                }
                setSearchInFocus(false);
              }, 300)
            }
            type="search"
            placeholder={t("Search for users, services, and more on InstaPay")}
            style={{
              padding: ".5rem 1rem",
              border: "none",
              outline: "none",
              width: "100%",
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchInFocus && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                height: "fit-content",
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                borderRadius: "10px",
                background: "white",
                gap: ".5rem",
                boxShadow: "0px 0px 3px #1111113e",
                minWidth: "300px",
              }}
            >
              {!search ? (
                <div
                  style={{
                    padding: "1rem 3.5rem",
                    background: "white",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  {t("Search users here")}
                </div>
              ) : (
                <>
                  {isLoading ? (
                    <InstaPayLoader />
                  ) : (
                    <>
                      {users?.length > 0 ? (
                        users.map((user) => (
                          <Link
                            to={`/profile/${user?.username}`}
                            key={user?._id}
                            style={{
                              padding: ".5rem 1rem",
                              fontSize: "15px",
                              fontWeight: "600",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: ".5rem",
                            }}
                          >
                            {user?.profileImage ? (
                              <img
                                src={user?.profileImage}
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  objectFit: "cover",
                                  borderRadius: "25px",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "25px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background:
                                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                  color: "white",
                                  fontSize: "1rem",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  lineHeight: "0",
                                  flexShrink: 0,
                                }}
                              >
                                {user?.first_name?.[0] ?? user?.company_name?.[0]}
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#111",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontWeight: 600,
                                }}
                              >
                                {user?.account_type === "individual"
                                  ? `${user?.first_name} ${user?.last_name}`
                                  : user?.company_name}
                              </span>
                              <Badge
                                color="success"
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "3px",
                                  fontSize: ".45rem",
                                  width: "fit-content",
                                  textTransform: "uppercase",
                                }}
                              >
                                {user?.account_type ?? "Individual"}
                                {t("Account")}
                              </Badge>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "1rem 3.5rem",
                            background: "white",
                            fontSize: "15px",
                            fontWeight: "600",
                          }}
                        >
                          {t("No User Found")}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <Col
            xs="auto"
            style={{
              padding: ".5rem",
              boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "10px",
              border: "1.11414px solid rgba(0, 0, 0, 0.08)",
              cursor: "pointer",
              position: "relative",
              background: "white",
            }}
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => searchRef?.current?.focus(), 100);
            }}
          >
            <Search />
          </Col>
          {showOthers && (
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              {/* <Col xs="auto" style={{
                                padding: ".5rem",
                                boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                                justifyContent: "center",
                                display: window.innerWidth > 1650 ? "flex" : "none",
                                alignItems: "center",
                                borderRadius: "10px",
                                border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                                cursor: "pointer"
                            }}>
                                <img src={msg} alt="" />
                            </Col> */}
              {can("notifications.view") && <Notifications />}
              <LanguagePicker />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchComponent;
