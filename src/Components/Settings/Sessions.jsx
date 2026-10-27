import { useContext, useEffect, useRef } from "react";
import { Spinner } from "reactstrap";
import SessionItem from "./SessionItem";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import styles from "./styles/Sessions.module.scss";
import { Warning } from "./Icons";
const LIMIT = 10;

const Sessions = () => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  const observerRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["loginHistory", userDetails?._id],
    queryFn: ({ pageParam = 1 }) =>
      apiWrapper({
        endpoint: `/api/login/get-user-login-history/${userDetails._id}?page=${pageParam}&limit=${LIMIT}`,
        method: "GET",
        isDecrypted: true,
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage ? lastPage?.pagination?.page + 1 : undefined,
    enabled: !!userDetails?._id,
  });

  const sessions = data?.pages?.flatMap((page) => page?.history ?? []) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Devices & sessions")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("Everywhere you've signed in from recently.")}
          </p>
        </div>
        {/* <button type="button" className={`${styles.button} ${styles.buttonSecondary}`}>
          <SignOut />
          {t("Sign out all others")}
        </button> */}
      </div>

      <section className={styles.card}>
        <div className={styles.rows}>
          {isLoading && <p className={styles.listNote}>{t("Loading...")}</p>}

          {sessions.map((session, index) => (
            <SessionItem key={session._id} session={session} index={index} />
          ))}

          <div ref={observerRef} style={{ height: "1px" }} />

          {isFetchingNextPage && (
            <p className={styles.listNote}>
              <Spinner size="sm" />
            </p>
          )}

          {!hasNextPage && sessions.length > 0 && (
            <p className={styles.listNote}>{t("No more sessions")}</p>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className={styles.listNote}>{t("No login history found")}</p>
          )}
        </div>
      </section>

      <div className={styles.note}>
        <Warning color="#6E7687" />
        <p>
          <strong>{t("See a device you don't know?")}</strong>{" "}
          {t("Change your password right away.")}
        </p>
      </div>
    </div>
  );
};

export default Sessions;
