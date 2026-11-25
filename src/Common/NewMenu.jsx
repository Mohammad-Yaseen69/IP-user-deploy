import bgImg from "../assets/images/logo/Vector.png";
import { useProducts } from "./ProductSwitcher/useProducts";

const containerStyle = {
  padding: "5px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  borderRadius: "12px",
  background: `url(${bgImg}), #000`,
  boxShadow: "0 4px 15.9px 0 rgba(89, 38, 240, 0.38)",
  position: "fixed",
  left: "8px",
  top: "18px",
  zIndex: 10,
};

const itemStyle = {
  width: "36px",
  height: "36px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "var(--RADIUS-radius-1, 4px)",
  cursor: "pointer",
  transition: "all .3s ease",
  border: "0.25px solid rgba(255, 255, 255, 0.28)",
  background: "#4c29b5",
  backdropFilter: "blur(0.65px)",
};

const activeStyle = {
  ...itemStyle,
  background: "#fff",
  boxShadow: "0 4px 15.1px 0 rgba(0, 0, 0, 0.50)",
};

const NewMenu = () => {
  const { products, activeKey } = useProducts();

  return (
    <div style={containerStyle}>
      {products.map((product) => {
        const isActive = product.key === activeKey;
        return (
          <div
            key={product.key}
            style={isActive ? activeStyle : itemStyle}
            onClick={product.onSelect}
          >
            {isActive ? product.activeIcon : product.icon}
          </div>
        );
      })}
    </div>
  );
};

export default NewMenu;
