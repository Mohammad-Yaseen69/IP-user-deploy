import SidebarLogo from "./SbNLogo";

const SidebarIconNew = () => {
  return (
    <div
      className="logo-wrapper"
      style={{
        position: "relative",
        zIndex: 10000,
        padding: "0 21px",
      }}
    >
      <SidebarLogo />
    </div>
  );
};

export default SidebarIconNew;
