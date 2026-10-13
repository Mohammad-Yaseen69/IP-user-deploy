import React, { useState } from "react";
import {
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import styles from "./styles/doctype.module.css";
import { Info } from "react-feather";
import { useTranslation } from "react-i18next";

const SoleTradedDocs = () => {
  const [modalOne, setModalOne] = useState(false);
  const [modalTwo, setModalTwo] = useState(false);
  const [modalThree, setModalThree] = useState(false);
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <h5>{t("Documents Required:")}</h5>
      <div>
        <FormGroup>
          <Label>
            {t(
              "Sole Trader's Registry Extract (Entity's Registration/Creation Document)",
            )}
            <Info
              className={styles.info_icon}
              size={16}
              onClick={() => setModalOne(!modalOne)}
            />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal
          isOpen={modalOne}
          toggle={() => setModalOne(!modalOne)}
          style={{ minWidth: "60vw" }}
        >
          <ModalHeader toggle={() => setModalOne(!modalOne)}>
            {t("Details")}
          </ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "This document serves as a local registry for sole traders, required in countries where such registration is mandatory. The document verifies that the individual is engaged in a professional activity as a sole trader. The name of this document varies from country to country.",
                )}
              </p>
              <br />
              <p>
                {t(
                  "Where applicable, the document should not be older than 3 months.",
                )}
              </p>
              <br />
              <p>{t("The document must contain:")}</p>
              <br />
              <ul>
                <li>{t("Individual's name")}</li>
                <li>{t("Date and place of birth")}</li>
                <li>{t("Residential address")}</li>
                <li>{t("Nationality")}</li>
                <li>{t("Registration number")}</li>
              </ul>
              <br />
              <p>{t("If applicable, the document should also include:")}</p>
              <br />
              <ul>
                <li>{t("Brand or trading names")}</li>
                <li>{t("Value Added Tax (VAT) number")}</li>
              </ul>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Collection of Identification Documents")}{" "}
            <Info
              className={styles.info_icon}
              size={16}
              onClick={() => setModalTwo(!modalTwo)}
            />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal
          isOpen={modalTwo}
          toggle={() => setModalTwo(!modalTwo)}
          style={{ minWidth: "60vw" }}
        >
          <ModalHeader toggle={() => setModalTwo(!modalTwo)}>
            {t("Details")}
          </ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "The identification document should be a government-issued document with a photograph of the individual. All identification documents must be written in the Latin alphabet. If this is not the case, a certified translation will be required.",
                )}
              </p>
              <br />
              <p>{t("The following documents are accepted:")}</p>
              <br />
              <ul>
                <li>{t("Valid National Identity Card")}</li>
                <li>{t("Valid Passport")}</li>
                <li>
                  {t(
                    "Valid Resident Permits (only if issued by a European country)",
                  )}
                </li>
              </ul>
              <br />
              <p>
                {t(
                  "The sole trader is the only individual subject to the identification document collection process.",
                )}
              </p>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Additional Documents")}{" "}
            <Info
              className={styles.info_icon}
              size={16}
              onClick={() => setModalThree(!modalThree)}
            />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal
          isOpen={modalThree}
          toggle={() => setModalThree(!modalThree)}
          style={{ minWidth: "60vw" }}
        >
          <ModalHeader toggle={() => setModalThree(!modalThree)}>
            {t("Details")}
          </ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <ul>
                <li>
                  {t(
                    "Utility Bill (such as gas, electricity, telephone or mobile phone bill); or A document issued by a government department that shows the End-user’s address and name (ex. Residential Certificate); or",
                  )}
                </li>
                <li>{t("Bank Statement; or")}</li>
                <li>
                  {t(
                    "A document issued by a government department that shows the End-user’s address and name (ex. Residential Certificate)",
                  )}
                </li>
              </ul>
              <br />
              <p>
                <strong>{t("Note: ")}</strong>{" "}
                {t(
                  "Kemit Kingdom retains the right to request any additional documents or further information necessary for conducting thorough verifications, in line with its legal obligations.",
                )}
              </p>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default SoleTradedDocs;
