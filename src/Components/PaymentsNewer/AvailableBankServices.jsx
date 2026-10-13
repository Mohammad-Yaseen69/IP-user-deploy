import { ChevronRight, HelpCircle, Search } from "react-feather";
import { Button, Card, CardBody, Input } from "reactstrap";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import bd from "./files/bd.png";
import InstaPayLoader from "../Loader";
import { useLocation } from "react-router";

const AvailableBankServices = ({
  subServices,
  subService,
  setSubService,
  setSubStep,
  placeHolder,
}) => {
  const { t } = useTranslation();

  const [filtered, setFiltered] = useState(subServices);

  useEffect(() => {
    setFiltered(subServices);
  }, [subServices]);

  const searchCountry = (e) => {
    const filt = subServices.filter((item) =>
      item.name.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    setFiltered(filt);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const url_service = queryParams.get("payer_id");

  useLayoutEffect(() => {
    if (subServices.length > 0 && url_service) {
      const chan = subServices.find((item) => item?.id == url_service);

      setSubService(chan);
      setSubStep((prev) => prev + 1);
    }
  }, [url_service, subServices]);

  return (
    <div
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        gap: "1.3rem",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,.03)",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "14px",
          gap: "14px",
          paddingBottom: "1rem",
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <Card style={{ margin: 0, borderRadius: "12px" }}>
          <CardBody
            style={{
              display: "flex",
              alignItems: "center",
              padding: ".5rem .75rem",
            }}
          >
            <Search color="#a0a0a0" size={18} />
            <Input
              type="text"
              placeholder={
                placeHolder === "bank"
                  ? t("Search Bank")
                  : "" || placeHolder === "mobile"
                    ? t("Search Mobile Wallet")
                    : "" || placeHolder === "cash"
                      ? t("Cash Point")
                      : ""
              }
              style={{ border: "none", outline: "none", fontSize: "1rem" }}
              onChange={searchCountry}
              className="i_t_c_search"
            />
          </CardBody>
        </Card>
        <Card
          style={{
            margin: 0,
            overflowX: "hidden",
            overflowY: "auto",
            minWidth: "200px",
            flex: "1",
            padding: ".5rem",
            borderRadius: "10px",
            scrollbarWidth: "none",
            maxHeight: "100%",
          }}
        >
          <CardBody
            style={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            className="coun_card_con"
          >
            {
              filtered.length > 0 ? (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: ".5rem",
                      cursor: "pointer",
                      background:
                        item.name === subService.name &&
                        "linear-gradient(to left, #e64067, #5926f0, #4828a0)",
                      color: item.name === subService.name && "white",
                      borderRadius: "10px",
                    }}
                    onClick={() => setSubService(item)}
                  >
                    <div
                      style={{
                        height: "35px",
                        width: "35px",
                        minWidth: "35px",
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
                        src={bd}
                        draggable="false"
                        alt={item.name[0]}
                        style={{
                          width: "19px",
                          objectFit: "contain",
                          aspectRatio: 1,
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                  </div>
                ))
              ) : (
                <div style={{ margin: "1rem auto", textAlign: "center" }}>
                  {t("No services found.")}
                </div>
              )
              // <div style={{ height: "100px", width: "100px" }}>
              //     <InstaPayLoader />
              // </div>
            }
          </CardBody>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
        <a
          href="https://insta-pay.ch/faq"
          style={{
            fontSize: ".7vw",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            color: "#2b2b2b",
          }}
        >
          <HelpCircle size={12} />
          <span>{t("Trouble Sending Money?")}</span>
        </a>
        <Button
          size="sm"
          style={{
            border: "none",
            outline: "none",
            background:
              " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
            backgroundBlendMode: "overlay, normal",
            boxShadow:
              "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
          className="i_t_button"
          onClick={() => setSubStep((prev) => prev + 1)}
          disabled={!subService}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default AvailableBankServices;
