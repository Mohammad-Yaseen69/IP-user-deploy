import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "reactstrap";
import { useDetectAdBlock } from "adblock-detect-react";
import { AlertCircle } from "react-feather";
import { useTranslation } from "react-i18next";

const detectBrave = async () => {
  try {
    return !!(navigator.brave && await navigator.brave.isBrave());
  } catch {
    return false;
  }
};

const detectSentryBlocked = async () => {
  try {
    const res = await fetch("https://o4509485673349120.ingest.us.sentry.io/api/4509485675118592/envelope/?sentry_version=7&sentry_key=448eafaae4776c67a2f5831cf64a23e5&sentry_client=sentry.javascript.react%2F9.41.0", {
      method: "POST",
      body: JSON.stringify({
        event_id: "123",
        message: "test",
        level: "error",
        release: "test",
        environment: "test",
        platform: "javascript",
        sdk: {
          name: "sentry.javascript.react",
          version: "9.41.0"
        }
      })
    });
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
      if (adBlockDetected) {
        setShow(true);
        return;
      }

      const isBrave = await detectBrave();
      const isSentryBlocked = await detectSentryBlocked();
      if (isBrave && isSentryBlocked) {
        setShow(true);
        return;
      }
    };

    runChecks();
  }, [adBlockDetected]);

  return (
    <Modal isOpen={show} centered backdrop="static" keyboard={false}>
      <ModalHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle color="#ff4c4c" size={24} />
          <span style={{ fontWeight: 600 }}>{t("Ad Blocker Detected")}</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div style={{ fontSize: "15px", lineHeight: "1.5", color: "#333" }}>
          <p>
            {t("It looks like you are using an ad blocker or privacy shield (e.g. Brave Shields). Please disable it to continue using our platform.")}
          </p>
          <p>
            <strong>{t("Why do we ask this?")}</strong>
            <br />
            {t("Ad blockers and browser shields interfere with our crash reporting tool (Sentry), preventing us from detecting, tracking, and fixing bugs effectively.")}
          </p>
          <p style={{ marginBottom: 0 }}>
            {t("We value your experience and promise that")}{" "}
            <strong>{t("we do not show any ads")}</strong>{" "}
            {t("on our platform.")}
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={() => window.location.reload()}
          style={{ width: "100%", fontWeight: "600", padding: "10px" }}
        >
          {t("I have disabled my ad blocker (Reload Page)")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdBlockCheck;