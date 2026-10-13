import { useTranslation } from "react-i18next";
import "./ErrorBoundary.css";
import png from "./assets/tabImg.png";

const BroadcastPage = () => {
  const { t } = useTranslation();
  return (
    <div className="broadcast-container">
      <div className="broadcast-div">
        <img src={png} alt="" loading="lazy" />
        <div className="text-cont">
          <div>
            <h1>{t("InstaPay is open on another tab/window.")}</h1>
            <p>{t("Please close this tab, or click the button below")}</p>
          </div>

          <button onClick={() => window.location.reload()}>
            {t("Open here")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPage;
