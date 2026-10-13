import { Link } from "react-router-dom";
import * as classes from "./AgentSidebar.module.css";

const NavSegment = ({
  icon: Icon,
  text,
  to,
  active = false,
  collapsed = false,
}) => {
  return (
    <Link
      to={to}
      title={collapsed ? text : undefined}
      className={`${classes.navSegment} ${active ? classes.navSegmentActive : ""} ${collapsed ? classes.navSegmentCollapsed : ""}`}
    >
      <Icon className={classes.icon16} />
      {!collapsed && <span className={classes.navSegmentText}>{text}</span>}
    </Link>
  );
};

export default NavSegment;
