import { useDetectAdBlock } from "adblock-detect-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoWarning } from "react-icons/io5";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import style from "./AdBlockCheck.module.css";
const detectBrave = async () => {
  try {
    return !!(navigator.brave && (await navigator.brave.isBrave()));
  } catch {
    return false;
  }
};

const detectSentryBlocked = async () => {
  try {
    const res = await fetch(
      "https://o4509485673349120.ingest.us.sentry.io/api/4509485675118592/envelope/?sentry_version=7&sentry_key=448eafaae4776c67a2f5831cf64a23e5&sentry_client=sentry.javascript.react%2F9.41.0",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          event_id: "123",
          message: "test",
          level: "error",
          release: "test",
          environment: "test",
          platform: "javascript",
          sdk: {
            name: "sentry.javascript.react",
            version: "9.41.0",
          },
        }),
      },
    );
    return false;
  } catch {
    return true;
  }
};

const AdBlockCheck = () => {
  const { t } = useTranslation();
  const adBlockDetected = useDetectAdBlock();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      const isBrave = await detectBrave();

      if (adBlockDetected && isBrave) {
        setShow(true);
        return;
      }

      if (isBrave) {
        const isSentryBlocked = await detectSentryBlocked();
        if (isSentryBlocked) {
          setShow(true);
          return;
        }
      }
    };

    runChecks();
  }, [adBlockDetected]);

  return (
    <Modal
      isOpen={show}
      centered
      backdrop="static"
      keyboard={false}
      className={style.modalMain}
    >
      <ModalHeader className={style["modal-header"]}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className={style["alert-circle"]}>
            <IoWarning color="#fff" size={30} />
          </div>
          <span className={style["modal-title"]}>
            {t("Ad Blocker Detected")}
          </span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className={style["modal-content"]}>
          <p className={style["modal-message"]}>
            {t(
              "It looks like you are using an ad blocker or privacy shield (e.g.Brave Shields).Please disable it to continue using our platform.",
            )}
          </p>
          <p className={style["why-ask"]}>
            <strong>{t("Why do we ask this?")}</strong>
            <br />
            {t(
              "Ad blockers and browser shields interfere with our crash reporting tool(Sentry), preventing us from detecting, tracking, and fixing bugs effectively.",
            )}
          </p>
          <p className={style["no-ads"]}>
            {t("We value your experience and promise that")}
            <span>{t("we do not show any ads")}</span>{" "}
            {t("on our payment platform.")}
          </p>
        </div>
      </ModalBody>
      <ModalFooter className={style["modal-footer"]}>
        <Button
          onClick={() => window.location.reload()}
          className={style["reload-button"]}
        >
          {t("I've disabled it - reload page")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdBlockCheck;
