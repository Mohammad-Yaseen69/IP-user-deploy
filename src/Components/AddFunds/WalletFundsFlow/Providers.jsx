import { useTranslation } from "react-i18next";
import i from "../../PaymentsNewer/files/i.svg";
import { Badge, Card, CardBody } from "reactstrap";
import { Check } from "react-feather";

const Providers = ({ providers, channel, setProvider, provider }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxHeight: "550px",
        overflowY: "auto",
      }}
    >
      {providers.map((item) => (
        <Card
          key={item?.name}
          style={{ marginBottom: 0, borderRadius: "12px" }}
          onClick={() => {
            if (!item?.active) return;
            setProvider(item);
          }}
        >
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              padding: "15px",
              justifyContent: "space-between",
              cursor: !item?.active ? "not-allowed" : "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  height: "35px",
                  width: "35px",
                  background:
                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                }}
              >
                <img
                  src={channel?.icon}
                  draggable="false"
                  alt={item?.name?.[0]}
                  style={{
                    width: "19px",
                    objectFit: "contain",
                    aspectRatio: 1,
                  }}
                />
              </div>
              <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{t(item?.name)}</h5>
            </div>
            {!item?.active ? (
              <Badge color="primary">{t("Coming Soon")}</Badge>
            ) : provider?.name === item?.name ? (
              <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
            ) : (
              <img
                src={i}
                alt="i"
                style={{
                  objectFit: "cover",
                  position: "absolute",
                  right: "14px",
                  top: "19px",
                }}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default Providers;
