import { Link } from "react-router-dom";
import * as classes from "./AgentSidebar.module.css";

const NavSegment = ({ icon: Icon, text, to, active = false }) => {
    return (
        <Link
            to={to}
            className={`${classes.navSegment} ${active ? classes.navSegmentActive : ""}`}
        >
            <Icon className={classes.icon16} />
            <span className={classes.navSegmentText}>{text}</span>
        </Link>
    );
};

export default NavSegment;