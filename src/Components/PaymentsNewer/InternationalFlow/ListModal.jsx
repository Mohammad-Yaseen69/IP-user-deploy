import { Modal, ModalBody } from "reactstrap";
import styles from "./styles/ModalStyles.module.css";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight } from "react-feather";
import i from "../files/i.svg";
import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";
import InstaPayLoader from "../../Loader";
import Fuse from "fuse.js";
import PayerTransactionTypePills from "./PayerTransactionTypePills";

const ListModal = ({
  isOpen,
  toggle,
  content,
  onSelectHandler,
  searchable = false,
  heading = "Send Money",
  isLoading = false,
}) => {
  const [current, setCurrent] = useState(null);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const fuse = new Fuse(content, {
    keys: ["name"],
    threshold: 0.3,
  });

  const filtered = useMemo(() => {
    if (search.length > 0) {
      const fuseResults = fuse.search(search).map((result) => result.item);
      if (fuseResults.length > 0) {
        return fuseResults;
      } else {
        return content?.list?.filter(
          (item) =>
            t(item?.name)?.toLowerCase()?.includes(search?.toLowerCase()) ||
            item?.name?.toLowerCase()?.includes(search?.toLowerCase()),
        );
      }
    } else {
      return content?.list;
    }
  }, [search]);

  const inputRef = useRef(null);
  useLayoutEffect(() => {
    let timeout;
    if (searchable) {
      timeout = setTimeout(() => inputRef?.current?.focus(), 500);
    }

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (content.list?.length === 1) {
      setCurrent(content?.list[0]);
    }
  }, [content]);
  return (
    <Modal
      isOpen={isOpen}
      style={{ width: "96vw", maxWidth: "850px" }}
      contentClassName={styles.content}
    >
      <ModalBody className={styles.body}>
        <div className={styles.left}>
          <h1>{t(heading)}</h1>
          <h2>{t(content?.heading)}</h2>
        </div>
        <div className={styles.right}>
          {isLoading ? (
            <div style={{ height: "200px", width: "200px", margin: "auto auto" }}>
              <InstaPayLoader />
            </div>
          ) : searchable ? (
            <div className={styles.searchable}>
              <div className={styles.search_con}>
                <BsSearch className={styles.icon} size={18} />
                <input
                  type="text"
                  placeholder={t("Search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  ref={inputRef}
                />
              </div>
              <div className={`${styles.list} ${styles.list_s}`}>
                {filtered?.length > 0 ? (
                  filtered?.map((item) => (
                    <div
                      onClick={() => setCurrent(item)}
                      className={`${styles.list_item} ${current?.name === item?.name && item?.file_url ? styles.active : ""}`}
                      key={item?.id ?? item?.file_url}
                    >
                      {item?.icon && (
                        <div className={styles.grad_icon}>
                          <img src={item?.icon} alt="" />
                        </div>
                      )}
                      {item?.file_url && (
                        <img
                          style={{
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                          }}
                          src={item?.file_url}
                          alt=""
                        />
                      )}
                      <div>
                        <span>{t(item?.name)}</span>
                        <PayerTransactionTypePills item={item} />
                      </div>
                      {item?.icon ? (
                        current?.name === item?.name ? (
                          <Check color="green" size={24} style={{ marginLeft: "auto" }} />
                        ) : (
                          <img
                            src={i}
                            alt="i"
                            style={{
                              height: "35px",
                              width: "35px",
                              objectFit: "contain",
                              marginLeft: "auto",
                            }}
                          />
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      margin: "1rem auto",
                      textAlign: "center",
                    }}
                  >
                    {t("No results")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`${styles.list} ${styles.list_ns}`}>
              {content?.list?.length > 0 ? (
                content?.list?.map((item) => (
                  <div
                    onClick={() => setCurrent(item)}
                    className={styles.list_item}
                    key={item?.name}
                  >
                    {item?.icon && (
                      <div className={styles.grad_icon}>
                        <img src={item?.icon} alt="" />
                      </div>
                    )}
                    <span>{t(service_name_formatter(item?.name))}</span>
                    {current?.name === item?.name ? (
                      <Check color="green" size={24} style={{ marginLeft: "auto" }} />
                    ) : (
                      <img
                        src={i}
                        alt="i"
                        style={{
                          height: "35px",
                          width: "35px",
                          objectFit: "contain",
                          marginLeft: "auto",
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    margin: "1rem auto",
                    textAlign: "center",
                  }}
                >
                  {t("No results")}
                </div>
              )}
            </div>
          )}

          <div className={styles.buttons}>
            <button
              onClick={() => {
                setCurrent(null);
                toggle();
              }}
              className={styles.transparent}
            >
              {t("Cancel")}
            </button>
            <button
              onClick={() => {
                onSelectHandler(current);
                if (window.innerWidth < 1000) {
                  window.scrollTo({
                    top: window.innerHeight * 5,
                    behavior: "smooth",
                  });
                }
                toggle();
              }}
              disabled={!current}
            >
              {t("Confirm")}
              <ChevronRight size={18} color="white" />
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ListModal;
