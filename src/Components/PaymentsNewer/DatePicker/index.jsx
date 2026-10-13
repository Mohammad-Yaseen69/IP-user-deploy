// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import "./index.css"

// const CustomDatePicker = ({ setRecStartDate, setShowPicker }) => {
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
//     const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());

//     const handleYearChange = (event) => {
//         const newDate = new Date(selectedDate);
//         newDate.setFullYear(parseInt(event.target.value));
//         setSelectedDate(newDate);
//         setSelectedYear(parseInt(event.target.value));
//     };

//     const handleMonthChange = (event) => {
//         const newDate = new Date(selectedDate);
//         newDate.setMonth(parseInt(event.target.value));
//         setSelectedDate(newDate);
//         setSelectedMonth(parseInt(event.target.value));
//     };

//     const getMonthName = (monthIndex) => {
//         const options = { month: 'long' };
//         return new Intl.DateTimeFormat('en-US', options).format(new Date(0, monthIndex));
//     };

//     const renderMonthDropdown = () => {
//         const months = Array.from({ length: 12 }, (_, i) => i);
//         return (
//             <select value={selectedMonth} onChange={handleMonthChange} style={{ width: "100px" }}>
//                 {months.map((monthIndex) => (
//                     <option key={monthIndex} value={monthIndex}>
//                         {getMonthName(monthIndex)}
//                     </option>
//                 ))}
//             </select>
//         );
//     };

//     const renderYearDropdown = () => {
//         const currentYear = new Date().getFullYear();
//         const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
//         return (
//             <select value={selectedYear} onChange={handleYearChange}>
//                 {years.map((year) => (
//                     <option key={year} value={year}>
//                         {year}
//                     </option>
//                 ))}
//             </select>
//         );
//     };

//     const renderDays = () => {
//         const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
//         const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
//         const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//         const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => '');

//         return (
//             <div className="days">
//                 {[...emptyDays, ...days].map((day, index) => {
//                     const currentDate = new Date(selectedYear, selectedMonth, day);
//                     const isPastDate = currentDate < new Date();
//                     return (
//                         <div
//                             key={index}
//                             className={`day${day === '' || isPastDate ? ' empty' : ''}${selectedYear === selectedDate.getFullYear() && selectedMonth === selectedDate.getMonth() && day === selectedDate.getDate() ? ' active' : ''}`}
//                             onClick={() => {
//                                 if (day !== '' && !isPastDate) {
//                                     setShowPicker(false);
//                                     setRecStartDate(currentDate);
//                                 }
//                             }}
//                         >
//                             {day !== '' && <span>{day}</span>}
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//     const pickerRef = useRef(null)
//     const handleClickOutside = useCallback((event) => {
//         if (pickerRef.current && !pickerRef.current.contains(event.target)) {
//             setShowPicker(false);
//         }
//     }, []);

//     useEffect(() => {
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [handleClickOutside]);

//     return (
//         <div className="custom-datepicker" ref={pickerRef}>
//             <div className="calendar-top">
//                 <div className="calendar-nav">
//                     {renderMonthDropdown()} {renderYearDropdown()}
//                 </div>
//             </div>
//             {renderDays()}
//         </div>
//     );
// };

// export default CustomDatePicker;

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";

const CustomDatePicker = ({ setRecStartDate, setShowPicker }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());

  const handleYearChange = (event) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(event.target.value));
    setSelectedDate(newDate);
    setSelectedYear(parseInt(event.target.value));
  };

  const handleMonthChange = (event) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(event.target.value));
    setSelectedDate(newDate);
    setSelectedMonth(parseInt(event.target.value));
  };

  const getMonthName = (monthIndex) => {
    const options = { month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(0, monthIndex));
  };

  const renderMonthDropdown = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <select value={selectedMonth} onChange={handleMonthChange} style={{ width: "100px" }}>
        {months.map((monthIndex) => (
          <option key={monthIndex} value={monthIndex}>
            {getMonthName(monthIndex)}
          </option>
        ))}
      </select>
    );
  };

  const renderYearDropdown = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    return (
      <select value={selectedYear} onChange={handleYearChange}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  const renderDays = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => "");

    const now = new Date();
    const excludeCurrentDate = now.getHours() >= 23 && now.getMinutes() >= 55;

    return (
      <div className="days">
        {[...emptyDays, ...days].map((day, index) => {
          const currentDate = new Date(selectedYear, selectedMonth, day);
          const isPastDate =
            currentDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isCurrentDate = currentDate.toDateString() === now.toDateString();

          if (excludeCurrentDate && isCurrentDate) {
            return null;
          }

          return (
            <div
              key={index}
              className={`day${day === "" || isPastDate ? " empty" : ""}${selectedYear === selectedDate.getFullYear() && selectedMonth === selectedDate.getMonth() && day === selectedDate.getDate() ? "" : ""}`}
              onClick={() => {
                if (day !== "" && !isPastDate) {
                  setRecStartDate(currentDate);
                  setShowPicker(false);
                }
              }}
            >
              {day !== "" && <span>{day}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const pickerRef = useRef(null);
  const handleClickOutside = useCallback((event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setShowPicker(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="custom-datepicker" ref={pickerRef}>
      <div className="calendar-top">
        <div className="calendar-nav">
          {renderMonthDropdown()} {renderYearDropdown()}
        </div>
      </div>
      {renderDays()}
    </div>
  );
};

const FutureDatePicker = ({ setRecStartDate, setShowPicker }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const getMonthName = (monthIndex) => {
    return new Date(0, monthIndex).toLocaleString("en-US", { month: "long" });
  };

  const renderMonthDropdown = () => (
    <select value={selectedMonth} onChange={handleMonthChange}>
      {Array.from({ length: 12 }, (_, i) => (
        <option key={i} value={i}>
          {getMonthName(i)}
        </option>
      ))}
    </select>
  );

  const renderYearDropdown = () => {
    const currentYear = today.getFullYear();
    return (
      <select value={selectedYear} onChange={handleYearChange}>
        {Array.from({ length: 10 }, (_, i) => currentYear + i).map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  const renderDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const emptyDays = Array(firstDay).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    // Today at midnight (for accurate date-only comparison)
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return (
      <div className="days">
        {[...emptyDays, ...days].map((day, index) => {
          if (!day) {
            return <div key={index} className="day empty"></div>;
          }

          const currentDate = new Date(selectedYear, selectedMonth, day);
          const isPast = currentDate < todayMidnight;

          const isSelected = selectedDate.toDateString() === currentDate.toDateString();

          return (
            <div
              key={index}
              className={`day ${isPast ? "disabled" : ""} ${isSelected ? "active" : ""}`}
              onClick={() => {
                if (isPast) return; // 🔴 past date select nahi hogi

                setSelectedDate(currentDate);
                const formatted = currentDate.toISOString().split("T")[0];
                setRecStartDate(formatted);
                setShowPicker(false);
              }}
            >
              <span>{day}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const pickerRef = useRef(null);
  const handleClickOutside = useCallback(
    (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    },
    [setShowPicker],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="custom-datepicker" ref={pickerRef}>
      <div className="calendar-top">
        <div className="calendar-nav">
          {renderMonthDropdown()}
          {renderYearDropdown()}
        </div>
      </div>
      {renderDays()}
    </div>
  );
};

export { FutureDatePicker };
export default CustomDatePicker;
