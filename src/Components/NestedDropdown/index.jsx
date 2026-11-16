import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";

const NestedDropdown = ({
  value = "",
  setter = () => {},
  parent = {},
  child = {},
  subKey = "",
  disabled = false,
  defaultValue = "",
  style,
}) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  return (
    <div
      disabled={disabled}
      className={styles.dropdown}
      style={{
        pointerEvents: disabled ? "none" : "all",
        opacity: disabled ? 0.8 : 1,
        background: disabled && "#e9ecef",
        ...style,
      }}
    >
      <div className={styles.value} onClick={() => setShowDropdown(!showDropdown)}>
        {t(parent?.[current] ?? child?.[current]) ||
          t(defaultValue || "Relationship With Beneficiary")}
      </div>
      {showDropdown && (
        <div className={styles.dd_menu}>
          {Object.keys(parent).map((item) => (
            <div
              key={item}
              onClick={() => {
                if (parent?.[item] === subKey) {
                  setShowSub(!showSub);
                } else {
                  setCurrent(item);
                  setter(item);
                  setShowDropdown(false);
                }
              }}
            >
              <div className={styles.dd_item}>
                <span>{t(parent?.[item])}</span>
                {parent?.[item] === subKey && (showSub ? <ChevronUp /> : <ChevronDown />)}
              </div>
              {parent?.[item] === subKey && showSub
                ? Object.keys(child).map((it) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrent(it);
                        setter(it);
                        setShowDropdown(false);
                      }}
                      key={it}
                      className={`${styles.dd_item}`}
                      style={{ paddingLeft: "2.25rem" }}
                    >
                      <span>{t(child?.[it])}</span>
                    </div>
                  ))
                : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NestedDropdown;
