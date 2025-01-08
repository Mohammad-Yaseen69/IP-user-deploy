import { CardHeader } from "reactstrap";
import Filters from "./Filters";
import { useCallback, useState, useRef, useEffect } from "react";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTranslation } from "react-i18next";

const TransactionCardHeader = ({ setTransactions, allTransactions }) => {
    const { t } = useTranslation()
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [activeTab, setActiveTab] = useState('1');
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
                <Filters callbackActive={callback} setTransactions={setTransactions} allTransactions={allTransactions} />
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
                <input type="text" className="form-control" placeholder={t('Search transactions')} style={{ margin: 0, width: "100%" }} />
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

export default TransactionCardHeader;