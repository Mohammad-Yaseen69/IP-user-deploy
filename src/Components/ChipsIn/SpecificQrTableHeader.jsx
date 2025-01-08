import { CardHeader } from "reactstrap";
import { Btn } from "../../AbstractElements";
import { useTranslation } from "react-i18next";

const SpecificQrTableHeader = ({ setShowForm, showForm }) => {
    const { t } = useTranslation()
    return (
        <CardHeader className="pb-0" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            position: "relative"
        }}>
            <h4>{t("My Specfic Qrs")}</h4>
            <form style={{
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "flex-end",
                flexDirection: "column",
                gap: "1rem",
                flex: 1,
                minWidth: "150px",
                maxWidth: "300px"
            }}>
                <input type="text" className="form-control" placeholder={t('Search items')} style={{ margin: 0, width: "100%" }} />
                <Btn
                    attrBtn={{
                        color: "primary",
                        type: "button",
                        style: {
                            borderRadius: "10px",
                            marginLeft: "10px",
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            outline: "none",
                            border: "none",
                        },
                        onClick: () => {
                            showForm ? setShowForm(false) : setShowForm(true)
                        }
                    }}
                >
                    {showForm ? t("Go Back") : t("Create Request")}
                </Btn>
            </form>
        </CardHeader>
    )
}

export default SpecificQrTableHeader