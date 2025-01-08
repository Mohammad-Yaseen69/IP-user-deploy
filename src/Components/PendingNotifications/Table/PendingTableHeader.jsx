import { useCallback, useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import { CardHeader } from "reactstrap";
import ActiveTab from "./ActiveTab";
import { useTranslation } from "react-i18next";


const PendingCardHeader = ({ searchInput, setSearchInput, setActiveTab, setAllData, pendings }) => {
    const { t } = useTranslation()
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    const callback = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <CardHeader className="pb-0" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            position: "relative"
        }}>
            <div style={{ flex: 1 }}>
                <ActiveTab callbackActive={callback} setAllData={setAllData} pendings={pendings} />
            </div>
            <form style={{
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "flex-end",
                flex: 1,
                minWidth: "250px"
            }}>
                <input type="text" className="form-control" placeholder={t('Search Pendings')} style={{ margin: 0, width: "100%", maxWidth: "350px" }}
                    onChange={e => {
                        const filtered = pendings.filter(item => item.name.toLowerCase().split(" ").join("").includes(e.target.value))
                        setAllData(filtered)
                    }}
                />
                <i className="fa fa-calendar-o" style={{
                    fontSize: "1.3rem",
                    cursor: "pointer",
                    color: "rgba(0,0,0,0.4)"
                }} onClick={handleDatePickerClick}></i>
                {showDatePicker && (
                    <div ref={datePickerRef} style={{ position: "absolute", top: "100%", right: 0, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10xp", overflow: "hidden" }}>
                        <DateRangePicker maxDate={new Date()}
                            ranges={[dateRange]}
                            onChange={(item) => setDateRange(item.selection)}
                        />
                    </div>
                )}
            </form>
        </CardHeader>
    );
};

export default PendingCardHeader;