import { H4 } from "../../AbstractElements";
import {
  Row,
  Col,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import GradientButton from "./GradientButton";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import SuccessModal from "./SuccessModal";
import OtpVerification from "../../Common/Component/OtpVerification";
import { useTranslation } from "react-i18next";

const SecurityQuestions = () => {
  const {
    userSecurityQues,
    authHeader,
    userDetails,
    setUserRefresh,
    getSecurityQuestions,
  } = useContext(UserContext);
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
  const [answerTwo, setAnswerTwo] = useState("");
  const [answerThree, setAnswerThree] = useState("");

  useEffect(() => {
    setSelectedQuesOne(userDetails?.user?.question1);
    setSelectedQuesTwo(userDetails?.user?.question2);
    setSelectedQuesThree(userDetails?.user?.question3);
    setAnswerOne(userDetails?.user?.answer1 ? "**************" : "");
    setAnswerTwo(userDetails?.user?.answer2 ? "**************" : "");
    setAnswerThree(userDetails?.user?.answer3 ? "**************" : "");
  }, [userDetails, isEditable]);

  const UpdateQuestionHandler = (setter) => {
    const data = {
      question1: selectedQuesOne,
      answer1: answerOne,
      question2: selectedQuesTwo,
      answer2: answerTwo,
      question3: selectedQuesThree,
      answer3: answerThree,
    };

    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/user/set-security-question/${userDetails._id}`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        if (decrypted.status === true) {
          setIsEditable(false);
          setter(true);
          setUserRefresh((prev) => prev + 1);
        }
      })
      .catch((err) => {
        // console.log(err.response.data)
      });
  };

  const isValidAnswer = (answer) =>
    !answer?.startsWith(" ") && !answer?.endsWith(" ");

  return (
    <Form className="card" id="security">
      <SuccessModal
        isOpen={showSuccess}
        toggle={() => setShowSuccess(!showSuccess)}
      />
      <CardHeader className={`pb-0 expanded`}>
        <H4 attrH4={{ className: "card-title mb-0" }}>
          {t("Security Questions")}
        </H4>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          <Row>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">{t("Securtiy Question")} 1</Label>
                <Input
                  disabled={!isEditable}
                  type="select"
                  value={selectedQuesOne}
                  onChange={(e) => setSelectedQuesOne(e.target.value)}
                >
                  <option value="">{t("Select your question")}</option>
                  {userSecurityQues.map((que) => (
                    <option
                      value={que._id}
                      key={que._id}
                      disabled={
                        selectedQuesThree === que._id ||
                        selectedQuesTwo === que._id
                      }
                    >
                      {que.question}
                    </option>
                  ))}
                </Input>
                <Input
                  disabled={!isEditable}
                  className="form-control mt-2"
                  type="text"
                  placeholder={t("Answer To The Question")}
                  value={answerOne}
                  onChange={(e) => setAnswerOne(e.target.value)}
                  style={{
                    borderColor: isValidAnswer(answerOne) ? "#eeeeee" : "red",
                  }}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">{t("Securtiy Question")} 2</Label>
                <Input
                  disabled={!isEditable}
                  type="select"
                  value={selectedQuesTwo}
                  onChange={(e) => setSelectedQuesTwo(e.target.value)}
                >
                  <option value="">{t("Select your question")}</option>
                  {userSecurityQues.map((que) => (
                    <option
                      value={que._id}
                      key={que._id}
                      disabled={
                        selectedQuesOne === que._id ||
                        selectedQuesThree === que._id
                      }
                    >
                      {que.question}
                    </option>
                  ))}
                </Input>
                <Input
                  disabled={!isEditable}
                  className="form-control mt-2"
                  type="text"
                  placeholder={t("Answer To The Question")}
                  value={answerTwo}
                  onChange={(e) => setAnswerTwo(e.target.value)}
                  style={{
                    borderColor: isValidAnswer(answerTwo) ? "#eeeeee" : "red",
                  }}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">{t("Securtiy Question")} 3</Label>
                <Input
                  disabled={!isEditable}
                  type="select"
                  value={selectedQuesThree}
                  onChange={(e) => setSelectedQuesThree(e.target.value)}
                >
                  <option value="">{t("Select your question")}</option>
                  {userSecurityQues.map((que) => (
                    <option
                      value={que._id}
                      key={que._id}
                      disabled={
                        selectedQuesOne === que._id ||
                        selectedQuesTwo === que._id
                      }
                    >
                      {que.question}
                    </option>
                  ))}
                </Input>
                <Input
                  disabled={!isEditable}
                  className="form-control mt-2"
                  type="text"
                  placeholder={t("Answer To The Question")}
                  value={answerThree}
                  onChange={(e) => setAnswerThree(e.target.value)}
                  style={{
                    borderColor: isValidAnswer(answerThree) ? "#eeeeee" : "red",
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
            padding: "1.5rem",
          }}
        >
          {isEditable && (
            <GradientButton
              value={t("Cancel")}
              size="m"
              attr={{ onClick: () => setIsEditable(false), type: "button" }}
            />
          )}
          {isEditable ? (
            <GradientButton
              value={t("Save")}
              size="m"
              attr={{
                disabled:
                  ((!selectedQuesOne || !answerOne) &&
                    (!answerTwo || !selectedQuesTwo) &&
                    (!selectedQuesThree || !answerThree)) ||
                  !isValidAnswer(answerOne) ||
                  !isValidAnswer(answerTwo) ||
                  !isValidAnswer(answerThree),
                type: "button",
                onClick: () => setShowOtp(true),
              }}
            />
          ) : (
            <GradientButton
              value={t("Edit")}
              size="m"
              attr={{ onClick: () => setIsEditable(true), type: "button" }}
            />
          )}
          <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
            <ModalHeader toggle={() => setShowOtp(!showOtp)}>
              {t("Confirm")}
            </ModalHeader>
            <ModalBody>
              <OtpVerification
                variant="card"
                hideTfaSwitch
                callback={(setter) => UpdateQuestionHandler(setter)}
                setter={setShowSuccess}
                setterValue={true}
                hideOtp={() => setShowOtp(false)}
              />
            </ModalBody>
          </Modal>
        </div>
      </div>
    </Form>
  );
};

export default SecurityQuestions;
