import { FaRegCompass } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { startProductTour, useTourAvailable } from "./start";
import styles from "./TourButton.module.css";

const TourButton = ({ hideShadow = false }) => {
  const { t } = useTranslation();
  if (!useTourAvailable()) return null;

  return (
    <button
      type="button"
      className={`${styles.button} ${hideShadow ? styles.flat : ""}`}
      onClick={(e) => {
        // The dashboard opens the profile-completion modal on any click that reaches its wrapper.
        e.stopPropagation();
        startProductTour();
      }}
      aria-label={t("Take a tour")}
      title={t("Take a tour")}
      data-tour="tour-button"
    >
      <FaRegCompass size={23} aria-hidden="true" />
    </button>
  );
};

export default TourButton;
