import { H4 } from "../../AbstractElements";
import { useForm } from "react-hook-form";
import {
  Row,
  Col,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import GradientButton from "./GradientButton";
import { useTranslation } from "react-i18next";

const Password = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onEditSubmit = (data) => {
    alert("Submitted");
  };

  return (
    <Form className="card" id="password" onSubmit={handleSubmit(onEditSubmit)}>
      <CardHeader className={`pb-0 expanded`}>
        <H4 attrH4={{ className: "card-title mb-0" }}>
          {t("Change Password")}
        </H4>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          <Row>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">{t("Current Password")}</Label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Current Password"
                  {...register("company", { required: true })}
                />
                <span style={{ color: "red" }}>
                  {errors.company && "Password is required"}{" "}
                </span>
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">{t("New Password")}</Label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Current Password"
                  {...register("company", { required: true })}
                />
                <span style={{ color: "red" }}>
                  {errors.company && "Password is required"}{" "}
                </span>
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup className="mb-3">
                <Label className="form-label">
                  {t("Re-enter New Password")}
                </Label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Current Password"
                  {...register("company", { required: true })}
                />
                <span style={{ color: "red" }}>
                  {errors.company && "Password is required"}{" "}
                </span>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
            padding: "1.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
              }}
            >
              {t("Password Requirements")}
            </h2>
            <p>{t("Please follow this guide for a strong password")}</p>
            <ul
              style={{
                listStyleType: "disc",
                fontSize: ".8rem",
                paddingLeft: "1rem",
              }}
            >
              <li>{t("One special characters")}</li>
              <li>{t("Min 8 characters")}</li>
              <li>{t("One number (2 are recommended)")}</li>
              <li>{t("Change it often")}</li>
            </ul>
          </div>
          <GradientButton value={t("Update Profile")} size="m" />
        </div>
      </div>
    </Form>
  );
};

export default Password;
