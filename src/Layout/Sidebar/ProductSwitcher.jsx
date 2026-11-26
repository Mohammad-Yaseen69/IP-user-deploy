import { useTranslation } from "react-i18next";
import { useProducts } from "../../Common/ProductSwitcher/useProducts";
import styles from "./Sidebar.module.scss";

const ProductSwitcher = ({ showNames }) => {
  const { t } = useTranslation();
  const { products, activeKey } = useProducts();

  return (
    <div className={`${styles.switcher} ${showNames ? styles.switcherNamed : ""}`}>
      {products.map((product) => {
        const isActive = product.key === activeKey;
        const label = t(product.label);
        return (
          <button
            key={product.key}
            type="button"
            className={`${styles.product} ${isActive ? styles.productActive : ""}`}
            onClick={product.onSelect}
            title={showNames ? undefined : label}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.productIcon}>
              {isActive ? product.activeIcon : product.icon}
            </span>
            {showNames && <span className={styles.productLabel}>{label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ProductSwitcher;
