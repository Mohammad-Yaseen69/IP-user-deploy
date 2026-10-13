import "./styles/Switch.css";

const Switch = ({ checked = false, callback = () => {}, disabled = false }) => {
  return (
    <label style={{ flexShrink: 0 }} className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={callback}
        disabled={disabled}
      />
      <span
        className="slider round"
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      ></span>
    </label>
  );
};

export default Switch;
