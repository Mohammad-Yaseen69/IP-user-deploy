import TopRight from "../../Components/topRight";
import styles from "./PageHeader.module.scss";

const PageHeader = ({ title, subtitle, children }) => (
  <header className={styles.header}>
    <div className={styles.text}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className={styles.right}>
      {children}
      <TopRight position="static" withMenu />
    </div>
  </header>
);

export default PageHeader;
