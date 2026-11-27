import { Tooltip } from "reactstrap";

const ToolTip = (props) => <Tooltip {...props.attrToolTip}>{props.children}</Tooltip>;

export default ToolTip;
