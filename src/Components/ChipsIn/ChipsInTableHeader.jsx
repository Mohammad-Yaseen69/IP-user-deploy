import { CardHeader } from "reactstrap";
import Filters from "./Filters";
import { useCallback } from "react";
// import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const ChipsInTableHeader = ({ activeTab, setActiveTab, stb }) => {

    const callback = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    return (
        <CardHeader className="pb-0" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
            position: "relative"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                margin: 0,
                padding: 0,
                flex: 4,
                minWidth: 300
            }}>
                <Filters callbackActive={callback} stb={stb} />
            </div>
            <form style={{
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "space-between",
                flex: 1,
                minWidth: "150px"
            }}>
                <input type="text" className="form-control" placeholder='Search Requests' style={{ margin: 0, width: "100%" }} hidden={activeTab != 1} />
            </form>
        </CardHeader>
    );
};

export default ChipsInTableHeader;