import { useTranslation } from "react-i18next";
import i from "../../PaymentsNewer/files/i.svg";
import { Card, CardBody } from "reactstrap";
import { Check } from "react-feather";

// Wallets come from SriPay's consultPayment, via the /api/collection/rate quote.
const SriPayWalletPicker = ({ options = [], selected, setSelected, channelIcon }) => {
  const { t } = useTranslation();

  if (!options.length) {
    return (
      <p style={{ textAlign: "center", color: "#848484" }}>
        {t("No mobile wallets are available at the moment.")}
      </p>
    );
  }

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
      {options.map((item) => (
        <Card
          key={item.payment_method_type}
          style={{ marginBottom: 0, borderRadius: "12px" }}
          onClick={() => setSelected(item)}
        >
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              padding: "15px",
              justifyContent: "space-between",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  height: "35px",
                  width: "35px",
                  background: item.logo
                    ? "#fff"
                    : "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item.logo || channelIcon}
                  draggable="false"
                  alt={item.name?.[0]}
                  style={{
                    width: item.logo ? "100%" : "19px",
                    objectFit: "contain",
                    aspectRatio: 1,
                  }}
                />
              </div>
              <div>
                <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{item.name}</h5>
                {item.region && <small style={{ color: "#848484" }}>{item.region}</small>}
              </div>
            </div>
            {selected?.payment_method_type === item.payment_method_type ? (
              <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
            ) : (
              <img
                src={i}
                alt="i"
                style={{ objectFit: "cover", position: "absolute", right: "14px", top: "19px" }}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default SriPayWalletPicker;
