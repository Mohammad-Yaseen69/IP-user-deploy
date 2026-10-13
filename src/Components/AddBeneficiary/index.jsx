import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IndividualAccount from "./IndividualAccount";
import BusinessAccount from "./BusinessAccount";
import { CardHeader, Form } from "reactstrap";
import { H4 } from "../../AbstractElements";
import SuccessModal from "./SuccessModal";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";

const AddBeneficiary = ({
  inInternationalModal,
  toggleHandler,
  errorOnInvalid = true,
  error = false,
}) => {
  const { t } = useTranslation();
  const [mobileView, setMobileView] = useState(window?.innerWidth < 600);
  const [isIndividual, setIsIndividual] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { allowedCountries } = useContext(UserContext);
  const nameRegex = /^[A-Za-z\s]+$/;
  const toggleSuccess = (benData) => {
    if (toggleHandler) {
      toggleHandler(benData);
    } else {
      showSuccess ? navigate("/beneficiaries") : setShowSuccess(true);
    }
  };

  const setWidth = () => {
    setMobileView(window.innerWidth < 600);
  };

  useEffect(() => {
    window.addEventListener("resize", setWidth);

    return () => window.removeEventListener("resize", setWidth);
  }, []);

  const handleChangeAlpha = (event) => {
    const charCode = event.charCode;
    if (!/[a-zA-Z]/.test(String.fromCharCode(charCode))) {
      event.preventDefault();
    }
  };

  const handleChangeNumber = (event) => {
    const charCode = event.charCode;
    if (!/\d/.test(String.fromCharCode(charCode))) {
      event.preventDefault();
    }
  };

  const [filteringCountries, setFilteringCountries] = useState([]);

  // useEffect(() => {
  //     const getReceivingCountries = async () => {
  //         try {
  //             const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/country/get-all-receiving-country`, {
  //                 headers: authHeader
  //             })

  //             const decrypted = decryptData(res.data.data)
  //             setFilteringCountries(decrypted?.Countries)
  //         } catch (error) {
  //             // console.log(decryptData(error?.response?.data?.data))
  //         }
  //     }

  //     getReceivingCountries()
  // }, [])

  useEffect(() => {
    setFilteringCountries(allowedCountries);
  }, [allowedCountries]);

  return (
    <div
      style={{
        margin: !inInternationalModal ? "1rem 0 1rem 1rem" : "2rem 0 0 0",
      }}
    >
      <Form
        className="card"
        style={{
          // border: "2px solid rgba(128,128,128,.5)"
          minHeight: `calc(${100}vh - ${2}rem)`,
          marginBottom: "0",
        }}
      >
        <div style={{}}>
          {!inInternationalModal && (
            <button
              onClick={() => navigate(-1)}
              style={{
                all: "unset",
                color: "var(--theme-default)",
                fontSize: "1rem",
                marginTop: "1rem",
                marginLeft: "1rem",
                paddingLeft: ".5rem",
                cursor: "pointer",
              }}
            >
              &larr; &nbsp;
            </button>
          )}
          <CardHeader
            className="pb-0 pt-0"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Add")} {isIndividual ? t("Individual") : t("Business")} {t("Account")}</H4> */}
            <H4 attrH4={{ className: "card-title mb-0" }}>
              {isIndividual
                ? t("Add Individual Account")
                : t("Add Business Account")}{" "}
            </H4>
            <div style={{ display: "flex" }}>
              <button
                style={{
                  all: "unset",
                  padding: "1rem",
                  boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                  flex: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  type: "button",
                  borderRadius: "10px",
                  background: isIndividual
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                  color: isIndividual ? "white" : "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  justifyContent: "center",
                  transition: "250ms",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsIndividual(true);
                }}
              >
                {t("Individual")}
              </button>
              <button
                style={{
                  all: "unset",
                  padding: "1rem",
                  boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                  flex: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  type: "button",
                  borderRadius: "10px",
                  background: !isIndividual
                    ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
                    : "transparent",
                  color: !isIndividual ? "white" : "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  justifyContent: "center",
                  transition: "250ms",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsIndividual(false);
                }}
              >
                {t("Business")}
              </button>
            </div>
          </CardHeader>
        </div>
        {isIndividual ? (
          // <LocalizationProvider dateAdapter={AdapterDayjs}>
          <IndividualAccount
            nameRegex={nameRegex}
            mobileView={mobileView}
            handleChangeAlpha={handleChangeAlpha}
            handleChangeNumber={handleChangeNumber}
            sii={setIsIndividual}
            toggleSuccess={toggleSuccess}
            filteringCountries={filteringCountries}
            inInternationalModal={inInternationalModal}
            errorOnInvalid={errorOnInvalid}
            error={error}
          />
        ) : (
          // </LocalizationProvider>
          <BusinessAccount
            nameRegex={nameRegex}
            toggleHandler={toggleHandler}
            isInternational={inInternationalModal}
            mobileView={mobileView}
            handleChangeAlpha={handleChangeAlpha}
            handleChangeNumber={handleChangeNumber}
            sii={setIsIndividual}
            toggleSuccess={toggleSuccess}
            filteringCountries={filteringCountries}
            errorOnInvalid={errorOnInvalid}
            error={error}
          />
        )}
      </Form>
      <SuccessModal
        isOpen={showSuccess}
        toggle={toggleSuccess}
        message={t("Beneficiary has been successfully added.")}
        subMessage={t("Beneficiary Updated.")}
      />
    </div>
  );
};

export default AddBeneficiary;
