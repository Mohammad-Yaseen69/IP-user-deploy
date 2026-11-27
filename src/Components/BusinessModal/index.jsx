import { Button, Modal, ModalBody } from "reactstrap";
import styles from "./index.module.css";
import hbtl from "./hbtl.svg";
import global from "./global.svg";
import ffa from "./ffa.svg";
import security from "./security.svg";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "react-feather";

const data = [
  {
    icon: hbtl,
    name: "Higher Balances & Transaction Limits",
    desc: "Unlock The Freedom To Manage Larger Balances And Process Higher Transaction Volumes, All With The Reliability You Expect From InstaPay.\n",
  },
  {
    icon: global,
    name: "Global Reach",
    desc: "Expand Your Business Without Borders InstaPay Connects You To Customers And Partners Worldwide, Making Global Transactions Easier Than Ever.",
  },
  {
    icon: ffa,
    name: "Full Feature Access",
    desc: "Enjoy The Complete Suite Of InstaPay’s Tools, From Advanced Analytics To Seamless International Payments, Tailored To Meet Your Business Needs.\n",
  },
  {
    icon: security,
    name: "Advanced Security",
    desc: "Expand Your Business Without Borders InstaPay Connects You To Customers And Partners Worldwide, Making Global Transactions Easier Than Ever.",
  },
];

const BusinessModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} className={styles.content}>
      <ModalBody className={styles.body}>
        <div className={styles.top}>
          <div className={styles.left}>
            <h1>{t("Elevate Your Business With InstaPay")}</h1>
            <p>
              {t(
                "Supercharge Your Financial Potential By Upgrading To An InstaPay Business Account Experience The Full Power Of InstaPay With Enhanced Features Designed Specifically For Business Growth.",
              )}
            </p>
          </div>

          <div className={styles.right}>
            {data.map((item) => (
              <div key={item.icon} className={styles.card}>
                <div className={styles.c_top}>
                  <div className={styles.icon} style={{ flexShrink: 0 }}>
                    <img src={item.icon} alt="" />
                  </div>
                  <h3>{t(item.name)}</h3>
                </div>
                <p>{t(item.desc)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.trs} onClick={toggle}>
            {t("Skip")}
            <ChevronRight color={"#828282"} size={16} />
          </button>
          <Button>{t("Business Registration Available Soon\n")}</Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default BusinessModal;
