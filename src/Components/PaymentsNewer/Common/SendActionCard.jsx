import { useEffect, useState } from "react";
import styles from "../styles/SendActionCard.module.scss";

const SendActionCard = ({
  bg,
  title,
  icon,
  desc,
  setter,
  setterValue,
  showDesc,
  active,
  sendPaymentType,
  right = "-20%",
  shrinkWidth,
}) => {
  const [winWidth, setWinWidth] = useState(window.innerWidth);

  const windowResizeHandler = () => {
    setWinWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", windowResizeHandler);
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, []);

  return (
    <div
      style={
        sendPaymentType
          ? {
              width: shrinkWidth
                ? "230px"
                : active
                  ? winWidth > 1500
                    ? "fit-content"
                    : "300px"
                  : winWidth > 1500
                    ? "150px"
                    : "120px",
              aspectRatio: active ? "339/541" : "170/541",
              height: "100%",
              minWidth: shrinkWidth ? "230px" : active ? "300px" : "unset",
            }
          : {
              aspectRatio: "339/541",
            }
      }
      className={styles.container}
      onClick={() => {
        setter(setterValue);
      }}
    >
      <img src={bg} alt={title} className={styles.bg} style={{ right: right }} />
      <div
        className={styles.item_dets}
        style={
          sendPaymentType
            ? {
                background: showDesc ? "#2910705e" : "transparent",
                justifyContent: showDesc ? "space-between" : "flex-end",
                transition: ".5s",
              }
            : { justifyContent: showDesc ? "space-between" : "flex-end" }
        }
      >
        <div
          style={
            sendPaymentType
              ? {
                  alignItems: showDesc ? "flex-start" : "center",
                  justifyContent: showDesc ? "initial" : "space-between",
                  height: showDesc ? "fit-content" : "100%",
                }
              : {}
          }
        >
          <img src={icon} alt={title} />
          <h5
            style={
              sendPaymentType
                ? {
                    writingMode: showDesc ? "horizontal-tb" : "vertical-rl",
                    rotate: showDesc ? "0deg" : "-180deg",
                    transition: ".5s",
                    height: showDesc ? "fit-content" : "270px",
                    fontSize: winWidth < 1500 ? "1.6rem" : "2rem",
                  }
                : {
                    fontSize: winWidth < 1500 ? "1.6rem" : "2rem",
                  }
            }
          >
            {title}
          </h5>
        </div>
        <p
          style={
            sendPaymentType
              ? {
                  height: showDesc ? "fit-content" : "0px",
                  display: showDesc ? "inherit" : "none",
                  transition: ".5s",
                }
              : {}
          }
        >
          {desc}
        </p>
      </div>
    </div>
  );
};

export default SendActionCard;
