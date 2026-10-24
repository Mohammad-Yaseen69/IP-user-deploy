import React, { useContext, useEffect, useState } from "react";
import styles from "./styles/FinancialInfo.module.scss";
import CitiesData from "../CitiesDropDown/CitiesData.json";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import Select, { components } from "react-select";
import {
  CaretDown,
  CaretRightSmall,
  Check,
  Info,
  MagnifyingGlassSmall,
  PencilSimple,
} from "./Icons";
import {
  sourceOfFunds,
  sourceOfWealth,
  volume,
  limitVolume,
  professions,
} from "../FinancialInfoModal/data.js";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { usePermission } from "../../hooks/GeneralUse/usePermission.jsx";

const questionsArray = [
  {
    question: "What keeps you busy these days?",
    info: "Whether you're running a business, freelancing, creating, or simply managing your personal finances — we'd love to hear about you!",
    answers: "",
    question_key: "keeps_busy",
  },
  {
    question: "What best describes your profession?",
    info: "Choose one or more from our full industry list!",
    answers: [],
    question_key: "profession",
  },
  {
    question: "Expected Monthly Transaction Volume?",
    info: "Estimate how many transactions will come into your account each month.",
    answers: "",
    question_key: "volume",
  },
  {
    question: "Expected Number of Transactions per Month?",
    info: "Estimate how many transactions will come into your account each month.",
    answers: "",
    question_key: "transaction_limit",
  },
  {
    question: "In Which Countries Will You Send Funds?",
    info: "Select all that apply or search country.",
    answers: [],
    question_key: "country",
  },
  {
    question: "Source of Funds",
    info: "Where does your money come from?",
    answers: "",
    question_key: "source_of_funds",
  },
  {
    question: "Source of Wealth",
    info: "How was your wealth accumulated?",
    answers: "",
    question_key: "source_of_wealth",
  },
  {
    question: "Are you a crypto user?",
    info: "Do you use crypto currency to send or receive your money?",
    question_key: "crypto",
    answers: null,
  },
];
const LAST_REVIEWED = "Last reviewed 12 Mar 2026";
const TIER_LABEL = "Tier 1 limits";

const selectStyles = {
  container: (base) => ({ ...base, width: "100%", outline: "none" }),
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    borderColor: state.isFocused ? "#5926F0" : "#EFF1F6",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(89, 38, 240, 0.12)"
      : "0px 1px 1.5px 0px rgba(27, 31, 42, 0.04)",
    "&:hover": { borderColor: state.isFocused ? "#5926F0" : "#D1D6E0" },
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: "-0.42px",
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 12px", gap: 4 }),
  placeholder: (base) => ({ ...base, color: "#9AA3B2" }),
  singleValue: (base) => ({ ...base, color: "#1B1F2A" }),
  input: (base) => ({ ...base, color: "#1B1F2A" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, padding: "0 16px 0 8px" }),
  clearIndicator: (base) => ({ ...base, color: "#9AA3B2", padding: "0 4px" }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    overflow: "hidden",
    border: "1px solid #EFF1F6",
    borderRadius: 10,
    boxShadow: "0px 12px 32px -8px rgba(27, 31, 42, 0.18)",
  }),
  option: (base, state) => ({
    ...base,
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    letterSpacing: "-0.42px",
    color: "#1B1F2A",
    backgroundColor: state.isSelected ? "#F2EEFF" : state.isFocused ? "#F8F9FC" : "#FFFFFF",
    cursor: "pointer",
  }),
  multiValue: (base) => ({ ...base, margin: 0, borderRadius: 100, backgroundColor: "#F2EEFF" }),
  multiValueLabel: (base) => ({
    ...base,
    padding: "2px 4px 2px 10px",
    fontSize: 12,
    fontWeight: 500,
    color: "#3B17A8",
  }),
  multiValueRemove: (base) => ({
    ...base,
    borderRadius: 100,
    color: "#3B17A8",
    ":hover": { backgroundColor: "#E4DBFF", color: "#22106B" },
  }),
};

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <CaretDown />
  </components.DropdownIndicator>
);

const FinancialInfo = () => {
  const [questions, setQuestions] = useState(questionsArray);
  const [countriesWithRegion, setCountriesWithRegion] = useState({});
  const [filteredCountriesWithRegion, setFilteredCountriesWithRegion] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(1);
  const [search, setSearch] = useState();
  const { userDetails, allowedCountries, authHeader } = useContext(UserContext);
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [apiQuestions, setApiQuestions] = useState(questionsArray);
  const [loading, setLoading] = useState(false);
  const can = usePermission();
  const isEdit = can("settings.financial-info.update");

  useEffect(() => {
    const countryFilteration = () => {
      const countryAnswers = questions.find((q) => q?.question_key === "country");
      const filteredCountries = editMode
        ? CitiesData.filter((cont) =>
            allowedCountries?.find((c) => c.country_iso_code === cont.iso3),
          )
        : CitiesData.filter((cont) => countryAnswers?.answers?.includes(cont?.iso3));
      const regionCountries = filteredCountries?.reduce((acc, country) => {
        const region = country?.region;
        if (!acc[region]) {
          acc[region] = [];
        }
        acc[region].push(country);
        return acc;
      }, {});

      setCountriesWithRegion(regionCountries);
    };

    countryFilteration();
  }, [CitiesData, questions, editMode]);

  useEffect(() => {
    if (search?.trim()) {
      const filteredRegions = Object.entries(countriesWithRegion)?.reduce(
        (acc, [region, countries]) => {
          const filteredCountries = countries?.filter((country) =>
            country?.name?.toLowerCase().includes(search?.toLowerCase()),
          );

          if (filteredCountries?.length > 0) {
            acc[region] = filteredCountries;
          }
          return acc;
        },
        {},
      );

      setFilteredCountriesWithRegion(filteredRegions);
    } else {
      setFilteredCountriesWithRegion(countriesWithRegion);
    }
  }, [search, countriesWithRegion]);

  useEffect(() => {
    if (userDetails) {
      let filterations = questionsArray
        .filter((q) =>
          userDetails?.user?.financial_answers?.some((a) => a?.question_key === q?.question_key),
        )
        ?.map((answers) => {
          const userAnswer = userDetails?.user?.financial_answers?.find(
            (a) => a?.question_key === answers?.question_key,
          );
          return userAnswer ? { ...answers, answers: userAnswer?.answers } : answers;
        });

      filterations = filterations.map((q) =>
        q.question_key === "crypto"
          ? { ...q, answers: q.answers[0] === "false" ? false : true }
          : q,
      );
      setQuestions(filterations);
      setApiQuestions(filterations);

      console.log(userDetails?.user);
    }
  }, [userDetails]);

  const updateData = (field, value) => {
    if (field === "country") {
      setQuestions(
        questions.map((q) =>
          q.question_key === field ? { ...q, answers: [...q.answers, value] } : q,
        ),
      );
    } else {
      setQuestions(questions.map((q) => (q.question_key === field ? { ...q, answers: value } : q)));
    }
  };

  const selectOptions = {
    source_of_funds: sourceOfFunds.map((opt) => ({ label: opt, value: opt })),
    source_of_wealth: sourceOfWealth.map((opt) => ({ label: opt, value: opt })),
    volume: volume.map((opt) => ({ label: opt, value: opt })),
    transaction_limit: limitVolume.map((opt) => ({ label: opt, value: opt })),
    profession: professions.map((opt) => ({ label: opt, value: opt })),
  };

  const saveHandler = async () => {
    setLoading(true);
    try {
      const data = {
        answers: questions,
        account_id: userDetails?._id,
      };

      console.log(data);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/user/update-financial-answers`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setEditMode(false);
      setApiQuestions(questions);
      console.log(dec);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      toast.error(
        dec?.message ||
          "We couldn't edit your financial info at the moment please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const answerText = (question) => {
    switch (question?.question_key) {
      case "keeps_busy":
        return question?.answers;
      case "profession":
        return Array.isArray(question.answers)
          ? question.answers.map((item) => t(item)).join(", ")
          : "";
      case "country":
        return CitiesData.filter((cont) => question?.answers?.includes(cont?.iso3))
          .map((cont) => t(cont?.name))
          .join(", ");
      case "crypto":
        return question.answers === true ? t("Yes") : question.answers === false ? t("No") : "";
      default:
        return t(question?.answers);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Financial profile")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("Answers that set your account limits. We review changes before they apply.")}
          </p>
        </div>
        {!editMode && (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            disabled={!isEdit}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <PencilSimple />
            {t("Edit answers")}
          </button>
        )}
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <h4 className={styles.cardTitle}>{t("Your answers")}</h4>
            <p className={styles.cardSubtitle}>{t(LAST_REVIEWED)}</p>
          </div>
          <span className={styles.pill}>{t(TIER_LABEL)}</span>
        </div>

        {!editMode ? (
          <div className={styles.answers}>
            {questions?.map((question, idx) => (
              <div
                key={idx}
                className={`${styles.answer} ${
                  question?.question_key === "keeps_busy" ? styles.answerFull : ""
                }`}
              >
                <p className={styles.answerLabel}>{t(question?.question)}</p>
                <p className={styles.answerValue}>{answerText(question)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.form}>
            {questions?.map((question, idx) => (
              <div key={idx} className={styles.field}>
                <span className={styles.label}>{t(question?.question)}</span>

                {question?.question_key !== "profession" &&
                  question?.question_key !== "country" &&
                  question?.question_key !== "keeps_busy" &&
                  question?.question_key !== "crypto" &&
                  Select && (
                    <Select
                      options={selectOptions[question.question_key]}
                      value={
                        selectOptions[question.question_key]?.find(
                          (opt) => opt.value === question.answers,
                        ) ||
                        (question.answers &&
                        typeof question.answers === "string" &&
                        selectOptions[question.question_key]?.some(
                          (opt) => opt.value === question.answers,
                        ) === false
                          ? { label: question.answers, value: question.answers }
                          : null)
                      }
                      styles={selectStyles}
                      components={{ DropdownIndicator }}
                      onChange={(option) =>
                        updateData(question.question_key, option ? option.value : "")
                      }
                    />
                  )}

                {question?.question_key === "keeps_busy" && (
                  <>
                    <textarea
                      className="form-control"
                      onChange={(e) =>
                        editMode ? updateData("keeps_busy", e.target.value) : e.preventDefault()
                      }
                      value={question?.answers}
                      placeholder={t("Type your answer")}
                      maxLength={250}
                      rows={4}
                    />
                    <span className={styles.counter}>
                      {questions.find((q) => q.question_key === "keeps_busy").answers?.length}
                      {" / 250"}
                    </span>
                  </>
                )}

                {question?.question_key === "profession" && Select && (
                  <Select
                    options={selectOptions.profession}
                    value={selectOptions.profession.filter(
                      (opt) =>
                        Array.isArray(question.answers) && question.answers.includes(opt.value),
                    )}
                    onChange={(options) =>
                      updateData("profession", options ? options.map((opt) => opt.value) : [])
                    }
                    isMulti
                    styles={selectStyles}
                    components={{ DropdownIndicator }}
                  />
                )}

                {question?.question_key === "country" && (
                  <div className={styles.countryPicker}>
                    <div className={`${styles.control} ${styles.withLeadingIcon}`}>
                      <span className={styles.leadingIcon}>
                        <MagnifyingGlassSmall />
                      </span>
                      <input
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        question_key="text"
                        placeholder={t("Search...")}
                      />
                    </div>

                    <div className={styles.regions}>
                      {Object.entries(filteredCountriesWithRegion)?.map(
                        ([region, countries], idx) => (
                          <div key={`${idx}-${region}`} className={styles.region}>
                            <button
                              type="button"
                              className={styles.regionHead}
                              aria-expanded={activeDropdown === idx + 1}
                              onClick={() =>
                                setActiveDropdown(activeDropdown === idx + 1 ? null : idx + 1)
                              }
                            >
                              <span>{t(region)}</span>
                              <span
                                className={`${styles.regionCaret} ${
                                  activeDropdown === idx + 1 ? styles.regionCaretOpen : ""
                                }`}
                              >
                                <CaretRightSmall />
                              </span>
                            </button>
                            {activeDropdown === idx + 1 && (
                              <div className={styles.countries}>
                                {countries?.map((cont, i) => (
                                  <button
                                    type="button"
                                    onClick={() => updateData("country", cont.iso3)}
                                    key={i}
                                    className={`${styles.country} ${
                                      question.answers.includes(cont.iso3) ? styles.countryOn : ""
                                    }`}
                                  >
                                    <span>{t(cont?.name)}</span>
                                    {question.answers.includes(cont.iso3) && (
                                      <Check color="#5926F0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {question?.question_key === "crypto" && (
                  <div className={styles.choices} role="radiogroup">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={question.answers === true}
                      onClick={() => updateData("crypto", true)}
                      className={`${styles.choice} ${
                        question.answers === true ? styles.choiceOn : ""
                      }`}
                    >
                      <span className={styles.radio}>{question.answers === true && <span />}</span>
                      {t("Yes")}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={question.answers === false}
                      onClick={() => updateData("crypto", false)}
                      className={`${styles.choice} ${
                        question.answers === false ? styles.choiceOn : ""
                      }`}
                    >
                      <span className={styles.radio}>{question.answers === false && <span />}</span>
                      {t("No")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {editMode && (
          <div className={styles.cardFooter}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => {
                setEditMode(false);
                setQuestions(apiQuestions);
              }}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={saveHandler}
              disabled={
                questions.some(
                  (q) =>
                    q.answers === "" ||
                    q.answers === undefined ||
                    q.answers === null ||
                    q.answers.length === 0,
                ) || loading
              }
            >
              {t("Save")}
            </button>
          </div>
        )}
      </section>

      <div className={styles.note}>
        <Info />
        <p>
          <strong>{t("Why we ask.")}</strong>{" "}
          {t(
            "Swiss financial regulation requires us to understand how you'll use your account. Your answers are never shared with people you pay.",
          )}
        </p>
      </div>
    </div>
  );
};

export default FinancialInfo;
