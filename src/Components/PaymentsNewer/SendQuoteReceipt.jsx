import { Badge, Card, CardBody } from "reactstrap";
import w from "./files/where.png";
import countries from "./CountriesData.json";
import { useTranslation } from "react-i18next";
import { FaRegFilePdf, FaRegFileVideo } from "react-icons/fa";
import { Link } from "react-router-dom";
import { takeScreenshot } from "../../Helper/takeScreenshot";
import download from "../Profile/files/download.svg";
import { useState } from "react";

const SendQuoteReceipt = ({
  beneficiary,
  amount,
  currency,
  title,
  description,
  files,
}) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  // console.log(beneficiary)
  return (
    <Card
      className=""
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        gap: "1.3rem",
        maxHeight: "540px",
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          padding: "0",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", padding: "14px" }}
          className="conf_cont transaction-receipt"
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>
              {t("You are Quoting")}
            </span>
            <h4 style={{ fontSize: "2rem" }}>
              {currency}{" "}
              {Number(amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
          {/* recipient */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
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
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: ".5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".2rem",
                    alignItems: "center",
                  }}
                >
                  {beneficiary[0]?.profileImage?.url ||
                  beneficiary[0]?.profileImage ? (
                    <img
                      src={
                        beneficiary[0]?.profileImage?.url ??
                        beneficiary[0]?.profileImage
                      }
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
                      {beneficiary?.beneficiary_type
                        ? beneficiary[0]?.beneficiary_type === "individual"
                          ? beneficiary[0]?.first_name?.[0]
                          : beneficiary[0]?.company_name?.[0]
                        : beneficiary[0]?.user
                          ? beneficiary[0]?.account_type === "individual"
                            ? beneficiary[0]?.user?.first_name?.[0]
                            : beneficiary[0]?.company?.company_name?.[0]
                          : beneficiary[0]?.account_type === "individual"
                            ? beneficiary[0]?.first_name?.[0]
                            : beneficiary[0]?.company_name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: ".3rem",
                      alignItems: "center",
                    }}
                  >
                    <h5 className="mb-0" style={{ fontSize: ".9rem" }}>
                      {beneficiary?.beneficiary_type
                        ? beneficiary[0]?.beneficiary_type === "individual"
                          ? `${beneficiary[0]?.first_name} ${beneficiary[0]?.last_name}`
                          : `${beneficiary[0]?.company_name}`
                        : beneficiary[0]?.user
                          ? beneficiary[0]?.account_type === "individual"
                            ? `${beneficiary[0]?.user?.first_name} ${beneficiary[0]?.user?.last_name}`
                            : `${beneficiary[0]?.company?.company_name}`
                          : beneficiary[0]?.account_type === "individual"
                            ? `${beneficiary[0]?.first_name} ${beneficiary[0]?.last_name}`
                            : `${beneficiary[0]?.company_name}`}
                    </h5>
                    <Badge
                      style={{
                        background:
                          "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        border: "none",
                        outline: "none",
                        fontSize: ".55rem",
                      }}
                    >
                      {`${beneficiary[0]?.beneficiary_type ?? beneficiary[0]?.account_type}`?.toUpperCase()}
                    </Badge>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      marginTop: ".4rem",
                    }}
                  >
                    <img
                      src={
                        countries.filter(
                          (it) =>
                            it.name.toLowerCase() ===
                            beneficiary[0]?.country_name?.toLowerCase(),
                        )[0]?.file_url
                      }
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
                      {
                        countries.filter(
                          (it) =>
                            it.name.toLowerCase() ===
                            beneficiary[0]?.country_name?.toLowerCase(),
                        )[0]?.name
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Title`)}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
            >
              <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                {title}
              </span>
            </div>
          </div>
          {/* desciption */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Description`)}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
            >
              <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                {description}
              </span>
            </div>
          </div>
          {/* files */}
          {files?.length > 0 && (
            <div
              style={{
                background: "rgba(89, 38, 240, 0.08)",
                borderRadius: "16px",
                height: "fit-content",
              }}
              className="i_t_selected"
            >
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Attachments`)}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  overflowX: "auto",
                  marginTop: ".5rem",
                }}
              >
                {files.map((file, index) => {
                  const previewURL = URL.createObjectURL(file);
                  return (
                    <div
                      key={index}
                      title={file?.name}
                      style={{
                        height: "50px",
                        width: "50px",
                        borderRadius: "5px",
                        boxShadow: "0 0 3px #1111113e",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {file?.type?.toLowerCase()?.includes("image") && (
                        <img
                          key={previewURL}
                          src={previewURL}
                          alt="img"
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {file?.type?.toLowerCase()?.includes("video") && (
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <FaRegFileVideo size={30} color="white" />
                        </div>
                      )}
                      {file?.type
                        ?.toLowerCase()
                        ?.includes("application/pdf") && (
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <FaRegFilePdf size={30} color="white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            justifyContent: "center ",
            marginTop: "1rem",
            padding: "14px",
          }}
        >
          <Link
            to={`/quotations?current-index=1&tab=sent`}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: "50px",
              padding: "10px",
              gap: ".3rem",
              cursor: "pointer",
            }}
          >
            <img
              src={w}
              alt="w"
              style={{ height: "25px", width: "25px", objectFit: "contain" }}
            />
            <span style={{ fontWeight: "600", color: "black" }}>
              {t("Where Is My Payment?")}
            </span>
          </Link>
          {downloading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" color="primary" role="status">
                <span className="sr-only">{t("Loading...")}</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: "50px",
                padding: "10px",
                gap: ".3rem",
                cursor: "pointer",
              }}
              onClick={() => {
                takeScreenshot("transaction-receipt", setDownloading);
              }}
            >
              <img
                src={download}
                alt="s"
                style={{ height: "20px", width: "20px", objectFit: "contain" }}
              />
              <span style={{ fontWeight: "600" }}>{t("Download")}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default SendQuoteReceipt;
