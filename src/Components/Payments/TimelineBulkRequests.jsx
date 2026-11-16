import { useState } from "react";
import { Table } from "reactstrap";
import TBRItem from "./TBRItem";
import { useTranslation } from "react-i18next";

const TimelineBulkRequests = ({ mobileView, setStepNumber, beneficiaries, srr }) => {
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState(beneficiaries);
  const [editRowIndex, setEditRowIndex] = useState(-1);
  const [editedData, setEditedData] = useState([...data]);
  const { t } = useTranslation();
  const handleEdit = (index) => {
    setEditRowIndex(index);
    setEditedData([...data]);
  };

  const handleSave = () => {
    const updatedData = [...editedData];
    updatedData[editRowIndex] = { ...updatedData[editRowIndex], Moded: "Yes" };
    setData(updatedData);
    setEditedData(updatedData);
    if (srr) srr(updatedData);
    setEditRowIndex(-1);
  };

  const handleDelete = (index) => {
    setEditRowIndex(-1);
    const updatedData = data.filter((_, ind) => index !== ind);
    setData(updatedData);
    if (srr) srr(updatedData);
  };

  const handleInputChange = (e, index, field) => {
    const updatedData = [...editedData];
    updatedData[index] = { ...updatedData[index], [field]: e.target.value };
    setEditedData(updatedData);
  };

  return (
    // <VerticalTimelineElement
    //     className="vertical-timeline-element--work"
    //     animate={true}
    //     icon={
    //         <div
    //             style={{
    //                 borderRadius: "100%",
    //                 height: "100%",
    //                 width: "100%",
    //             }}
    //         >
    //             {completed && <Check />}
    //         </div>
    //     }
    //     iconStyle={{
    //         boxShadow: "none",
    //         padding: "5px",
    //         background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
    //     }}
    //     contentStyle={{
    //         background: "transparent",
    //         padding: "1rem 1rem 0 1rem",
    //         height: "fit-content",
    //         transform: completed && "translateY(-11px)",
    //         marginLeft: mobileView ? "45px" : "60px",
    //     }}
    // >
    //     {completed ? (
    //         <div
    //             style={{
    //                 display: "flex",
    //                 alignItems: "center",
    //                 gap: "1rem",
    //             }}
    //         >
    //             <p style={{ margin: 0, padding: 0 }}>
    //                 You request money from {"{recipient name}"}.
    //             </p>
    //             <span
    //                 style={{
    //                     cursor: "pointer",
    //                     padding: 0,
    //                     margin: 0,
    //                 }}
    //                 onClick={() => setCompleted(false)}
    //             >
    //                 <Edit />
    //             </span>
    //         </div>
    //     ) : (
    //         <div>
    //             <div>
    //                 <h3>Recipients</h3>
    <>
      <div style={{ overflowX: "auto" }}>
        <Table responsive>
          <thead>
            <tr>
              <th>{t("Recipients")}</th>
              <th>{t("Amount")}</th>
              <th>{t("Currency")}</th>
              <th>{t("Recipient Currency")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <TBRItem
                item={item}
                index={index}
                key={index}
                editRowIndex={editRowIndex}
                editedData={editedData}
                handleInputChange={handleInputChange}
                setTempAmount={() => {}}
                setTempCurrency={() => {}}
                handleEdit={handleEdit}
                handleSave={handleSave}
                handleDelete={handleDelete}
                cancelEdit={() => setEditRowIndex(-1)}
              />
            ))}
          </tbody>
        </Table>
      </div>
      {/* <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "1rem",
                }}
            >
                <Button
                    style={{
                        border: "none",
                        outline: "none",
                        background:
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                    }}
                    onClick={() => {
                        setStepNumber(4);
                        setCompleted(true);
                    }}
                    disabled={beneficiaries.some((item) => !item.Amount || !item.Currency)}
                >
                    Send Requests
                </Button>
            </div> */}
    </>
    //     </div>
    // </div>
    //     )}
    // </VerticalTimelineElement>
  );
};

export default TimelineBulkRequests;
