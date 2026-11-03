import { Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { useTranslation } from "react-i18next";
import OTPConfirmation from "../../Common/Component/OtpVerification";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { preventEdgeSpaces } from "../../hooks/useTrimInput";
import styles from "./styles/SecurityQuestion.module.scss";
import { CaretDown, LockSimpleSmall, WarningCircle } from "./Icons";

const Hint = ({ children }) => (
  <div className={styles.hint}>
    <WarningCircle />
    <span>{children}</span>
  </div>
);

const MASKED_ANSWER = "**********";

const SecurityQuestions = () => {
  const {
    userSecurityQues,
    authHeader,
    userDetails,
    verifyToken,
    getSecurityQuestions,
    setProfileLockTime,
    profileCompletedPercentage,
    setUserDetails,
  } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (userDetails) {
      getSecurityQuestions();
    }
  }, [userDetails]);

  const { t } = useTranslation();

  const [isEditable, setIsEditable] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showOtp, setShowOtp] = useState(false);

  const [selectedQuesOne, setSelectedQuesOne] = useState("");
  const [selectedQuesTwo, setSelectedQuesTwo] = useState("");
  const [selectedQuesThree, setSelectedQuesThree] = useState("");
  const [answerOne, setAnswerOne] = useState("");
  const [prevAnswers, setPrevAnswers] = useState({ ans1: "", ans2: "", ans3: "" });
  const [answerTwo, setAnswerTwo] = useState("");
  const [answerThree, setAnswerThree] = useState("");
  const [saving, setSaving] = useState("");
  const [token, setToken] = useState("");
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);
  const can = usePermission();
  const isEdit = can("settings.security-questions.update");
  useEffect(() => {
    setCodeType(
      userDetails?.tfa
        ? "authenticator"
        : userDetails?.email_verification
          ? "email"
          : userDetails?.whatsapp_verification
            ? "whatsapp"
            : "sms",
    );
  }, [userDetails]);

  const sendOtp = async (method) => {
    if (
      !selectedQuesOne ||
      !answerOne ||
      !answerTwo ||
      !selectedQuesTwo ||
      !selectedQuesThree ||
      !answerThree
    ) {
      toast.error(t("Please fill all the required fields!"));
      return;
    }
    setSaving(true);
    const ans1 = answerOne?.trim();
    const ans2 = answerTwo?.trim();
    const ans3 = answerThree?.trim();
    const data = {
      data: {
        question1: selectedQuesOne,
        answer1: ans1 === MASKED_ANSWER ? prevAnswers.ans1 : ans1,
        question2: selectedQuesTwo,
        answer2: ans2 === MASKED_ANSWER ? prevAnswers.ans2 : ans2,
        question3: selectedQuesThree,
        answer3: ans3 === MASKED_ANSWER ? prevAnswers.ans3 : ans3,
      },
      type: typeof method === "string" ? method : codeType,
    };

    if (
      userDetails?.user
        ? userDetails.user.question1 || userDetails.user.question2 || userDetails.user.question3
        : userDetails?.company?.answer1 ||
          userDetails?.company?.answer2 ||
          userDetails?.company?.answer3
    ) {
      try {
        const encrypted = encryptData(data);
        const res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
          {
            data: encrypted,
          },
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data.data);
        setToken(dec?.token);
        setOtpMethods(dec);
        if (!showOtp) setCodeType(dec?.otp_sent_on || "sms");
        setShowOtp(true);
      } catch (error) {
        toast.error("Something went wrong while sending otp!");
      } finally {
        setSaving(false);
      }
    } else {
      axios
        .post(
          `${import.meta.env.VITE_IP_DEV_API}/api/user/set-security-question-no-otp/${userDetails._id}`,
          data,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          if (decrypted.status === true) {
            setUserDetails((prev) => ({
              ...prev,
              user: decrypted.account.user,
            }));
            setShowSuccess(true);
            setIsEditable(false);
          }
        })
        .catch((err) => {
          const decrypted = err?.response?.data?.data ? decryptData(err.response.data.data) : null;
          toast.error(decrypted?.message ?? "Something went wrong while adding questions!");
        })
        .finally(() => setSaving(false));
    }
  };

  useEffect(() => {
    if (!isEditable && userDetails) {
      setSelectedQuesOne(userDetails?.user?.question1 ?? userDetails?.company?.question1 ?? "");
      setSelectedQuesTwo(userDetails?.user?.question2 ?? userDetails?.company?.question2 ?? "");
      setSelectedQuesThree(userDetails?.user?.question3 ?? userDetails?.company?.question3 ?? "");
      const ans1 = userDetails?.user?.answer1 ?? userDetails?.company?.answer1;
      const ans2 = userDetails?.user?.answer2 ?? userDetails?.company?.answer2;
      const ans3 = userDetails?.user?.answer3 ?? userDetails?.company?.answer3;
      setAnswerOne(ans1 ? MASKED_ANSWER : "");
      setAnswerTwo(ans2 ? MASKED_ANSWER : "");
      setAnswerThree(ans3 ? MASKED_ANSWER : "");
      setPrevAnswers({
        ans1: ans1 ?? "",
        ans2: ans2 ?? "",
        ans3: ans3 ?? "",
      });
    }
  }, [userDetails, isEditable]);

  const UpdateQuestionHandler = (setter, type, otp, error) => {
    setSaving(true);
    const data = {
      token,
      otp,
      type: codeType,
    };
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/user/set-security-question/${userDetails._id}`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        if (decrypted.status === true) {
          setIsEditable(false);
          setter(true);
          verifyToken();
          setShowSuccess(true);
        }
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
          const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
          const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
          setProfileLockTime(timeInSec);
          const coun = localStorage.getItem("ip_country");
          localStorage.clear();
          localStorage.setItem("ip_country", coun);
          navigate("/login");
        }
        error("We cannot process your request at the moment, please try again later.");
      })
      .finally(() => setSaving(false));
  };

  const isValidAnswer = () => {
    if (answerOne === MASKED_ANSWER && answerTwo === MASKED_ANSWER && answerThree === MASKED_ANSWER)
      return false;
    return true;
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editmode = queryParams.get("editmode");

  useEffect(() => {
    setIsEditable(editmode);
  }, [editmode]);

  const questionRows = [
    {
      number: 1,
      question: selectedQuesOne,
      setQuestion: setSelectedQuesOne,
      answer: answerOne,
      setAnswer: setAnswerOne,
      takenByOthers: [selectedQuesThree, selectedQuesTwo],
    },
    {
      number: 2,
      question: selectedQuesTwo,
      setQuestion: setSelectedQuesTwo,
      answer: answerTwo,
      setAnswer: setAnswerTwo,
      takenByOthers: [selectedQuesOne, selectedQuesThree],
    },
    {
      number: 3,
      question: selectedQuesThree,
      setQuestion: setSelectedQuesThree,
      answer: answerThree,
      setAnswer: setAnswerThree,
      takenByOthers: [selectedQuesOne, selectedQuesTwo],
    },
  ];

  const questionText = (id) =>
    userSecurityQues?.find((que) => que._id === id)?.question ?? t("Loading...");

  return (
    <Form className={styles.container} id="security">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Recovery questions")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("We ask these if you're locked out and can't receive a code.")}
          </p>
        </div>
        {!isEditable && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => setIsEditable(true)}
            disabled={!isEdit}
          >
            {t("Edit")}
          </button>
        )}
      </div>

      <section className={styles.card}>
        <div className={styles.rows}>
          {questionRows.map((row) => {
            const isMissing = !row.answer || !row.question;
            return (
              <div key={row.number} className={styles.questionBlock}>
                <div className={styles.row}>
                  <div className={styles.tile}>{row.number}</div>
                  <p className={`${styles.rowTitle} ${!row.question ? styles.rowTitleEmpty : ""}`}>
                    {row.question ? questionText(row.question) : t("Not set")}
                    {isMissing && isEditable && (
                      <span className={styles.required}>{t("(Required)")}</span>
                    )}
                  </p>
                </div>

                {isEditable && (
                  <div className={styles.editor}>
                    <div className={styles.grid}>
                      <FormGroup className={styles.field}>
                        <Label className={styles.label}>{t("Question")}</Label>
                        <div className={`${styles.control} ${styles.withTrailingIcon}`}>
                          <Input
                            disabled={!isEditable}
                            type="select"
                            value={row.question}
                            onChange={(e) => {
                              row.setQuestion(e.target.value);
                              row.setAnswer("");
                            }}
                          >
                            <option value="">{t("Select your question")}</option>
                            {userSecurityQues.map((que) => (
                              <option
                                value={que._id}
                                key={que._id}
                                disabled={row.takenByOthers.includes(que._id)}
                              >
                                {que.question}
                              </option>
                            ))}
                          </Input>
                          <span className={styles.trailingIcon}>
                            <CaretDown />
                          </span>
                        </div>
                      </FormGroup>
                      <FormGroup className={styles.field}>
                        <Label className={styles.label}>{t("New answer")}</Label>
                        <Input
                          disabled={!isEditable}
                          className="form-control"
                          type="text"
                          placeholder={t("Type your answer")}
                          value={row.answer}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 50);
                            row.setAnswer(value);
                          }}
                          onKeyDown={preventEdgeSpaces}
                          maxLength={50}
                        />
                        <Hint>{row.answer?.length || 0}/50</Hint>
                      </FormGroup>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isEditable && (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonTertiary}`}
              onClick={() => setIsEditable(false)}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => sendOtp()}
              disabled={
                !selectedQuesOne ||
                !answerOne ||
                !answerTwo ||
                !selectedQuesTwo ||
                !selectedQuesThree ||
                !answerThree ||
                !isValidAnswer(answerOne) ||
                !isValidAnswer(answerTwo) ||
                !isValidAnswer(answerThree) ||
                saving
              }
            >
              {t("Save")}
            </button>
          </div>
        )}
      </section>

      <div className={styles.note}>
        <LockSimpleSmall />
        <p>
          {t(
            "Answers aren't case-sensitive. Pick ones you'll remember but others can't look up online.",
          )}
        </p>
      </div>

      <div style={{ position: "absolute", width: 0, height: 0 }}>
        <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
          <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
          <ModalBody>
            <OTPConfirmation
              variant="card"
              callback={UpdateQuestionHandler}
              setter={setShowSuccess}
              setterValue={true}
              hideOtp={() => setShowOtp(false)}
              processing={saving}
              resendHandler={sendOtp}
              authType={codeType}
              setAuthType={setCodeType}
              methods={otpMethods}
            />
          </ModalBody>
        </Modal>
        <SuccessModal
          isOpen={showSuccess}
          message={"Security Questions Updated"}
          subMessage={"Security questions updated successfully!"}
          toggle={() => {
            setShowSuccess(false);
            if (profileCompletedPercentage != 100) {
              navigate("/settings?tab=social&ft=true");
            }
          }}
        />
      </div>
    </Form>
  );
};

export default SecurityQuestions;
