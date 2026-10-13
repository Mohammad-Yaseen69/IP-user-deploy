import { useTranslation } from "react-i18next";
import { Badge } from "reactstrap";
import countries from "./CountriesData.json";
import { useMemo } from "react";

const SelectedRecipient = ({
  user,
  setSubStep,
  index,
  size,
  payoutChannel = "",
  step = 6,
  setBeneficiary,
}) => {
  const { t } = useTranslation();
  // console.log(user)
  const country = useMemo(
    () =>
      countries.filter((it) =>
        it?.name?.toLowerCase()?.includes(user?.country_name?.toLowerCase()),
      )[0],
    [user],
  );

  return (
    <div
      style={{ background: "rgba(89, 38, 240, 0.08)", borderRadius: "16px" }}
      className="i_t_selected"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: ".5rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: ".2rem",
              alignItems: "center",
            }}
          >
            {user?.profileImage?.url || user?.profileImage ? (
              <img
                src={user?.profileImage?.url ?? user?.profileImage}
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 800,
                }}
              >
                {user?.beneficiary_type
                  ? user?.beneficiary_type === "individual"
                    ? user?.first_name?.[0]
                    : user?.company_name?.[0]
                  : user?.user
                    ? user?.account_type === "individual"
                      ? user?.user?.first_name?.[0]
                      : (user?.company?.company_name?.[0] ?? "")
                    : user?.account_type === "individual"
                      ? user?.first_name?.[0]
                      : (user?.company_name?.[0] ?? "")}
              </div>
            )}
          </div>
          <div>
            <div
              style={{ display: "flex", gap: ".3rem", alignItems: "center" }}
            >
              <h5
                className="mb-0"
                style={{
                  fontSize: ".9rem",
                  maxWidth: "15ch",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.beneficiary_type
                  ? user?.beneficiary_type === "individual"
                    ? (`${user?.first_name} ${user?.last_name}` ?? "")
                    : (`${user?.company_name}` ?? "")
                  : user?.user
                    ? user?.account_type === "individual"
                      ? (`${user?.user?.first_name} ${user?.user?.last_name}` ??
                        "")
                      : (`${user?.company?.company_name}` ?? "")
                    : user?.account_type === "individual"
                      ? (`${user?.first_name} ${user?.last_name}` ?? "")
                      : `${user?.company_name}`}
              </h5>
              {window.innerWidth > 1000 && (
                <Badge
                  style={{
                    background:
                      "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                    border: "none",
                    outline: "none",
                    fontSize: ".55rem",
                  }}
                >
                  {`${user?.beneficiary_type ?? user?.account_type}`?.toUpperCase()}
                </Badge>
              )}
            </div>
            {/* <span style={{ fontSize: ".7rem" }}> {
                            payoutChannel &&
                            payoutChannel === "bank"
                            &&
                            `IBAN: ${user?.bank_iban}`
                        }
                            {
                                payoutChannel &&
                                payoutChannel === "mobile"
                                &&
                                `IBAN: ${user?.mobile_wallet_account_number}`
                            }</span> */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                marginTop: ".4rem",
              }}
            >
              <img
                src={country?.file_url}
                alt="flag"
                style={{
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(0,0,0,.3)",
                  width: "30px",
                  height: "20px",
                  objectFit: "cover",
                }}
                draggable="false"
              />
              <span style={{ fontSize: ".6rem", fontWeight: "700" }}>
                {country?.name}
              </span>
            </div>
            {/* <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".4rem" }}>
                            <img src={countries.filter(it => user?.country ? it.name.toLowerCase().includes(user?.country_name?.toLowerCase()) : it.name.toLowerCase().includes(user?.country?.toLowerCase()))[0]?.file_url} alt="flag" style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", width: "30px", height: "20px", objectFit: "cover" }} draggable="false" />
                            <span style={{ fontSize: ".6rem", fontWeight: "700" }}>{countries.filter(it => it.name.toLowerCase() === user?.country_name?.toLowerCase())[0]?.name}</span>
                        </div> */}
          </div>
        </div>
        <span
          style={{
            background: "white",
            boxShadow:
              "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
            borderRadius: "30px",
            fontSize: ".6rem",
            padding: "3px 7px",
            cursor: "pointer",
            width: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: ".3rem",
          }}
          onClick={(_) => {
            setSubStep(step);
            setBeneficiary([]);
          }}
        >
          {t("edit")}
        </span>
      </div>
    </div>
  );
};

export default SelectedRecipient;
