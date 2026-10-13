import React, { useState } from "react";
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import styles from "./styles/doctype.module.css";
import { Info } from "react-feather";
import { useTranslation } from "react-i18next";
const NgosDocs = () => {
  const { t } = useTranslation();
  const [modalOne, setModalOne] = useState(false);
  const [modalTwo, setModalTwo] = useState(false);
  const [modalThree, setModalThree] = useState(false);
  const [modalFour, setModalFour] = useState(false);
  const [modalFive, setModalFive] = useState(false);
  const [modalSix, setModalSix] = useState(false);
  return (
    <div className={styles.container}>
      <h5>{t("Documents Required:")} </h5>
      <div>
        <FormGroup>
          <Label>
            {t("Entity's Registry Extract (Entity'sRegistration/Creation Document)")}{" "}
            <Info className={styles.info_icon} size={16} onClick={() => setModalOne(!modalOne)} />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal isOpen={modalOne} toggle={() => setModalOne(!modalOne)} style={{ minWidth: "60vw" }}>
          <ModalHeader toggle={() => setModalOne(!modalOne)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>{t("This document should be either:")}</p>
              <br />
              <ul>
                <li>
                  {t(
                    "A proof of creation of the entity: This document typically provides the entity's",
                  )}{" "}
                  {t("details, creation date, and purpose.")}
                </li>
                <li>
                  {t("A local registry extract:")}
                  <ul>
                    <li>
                      {t(
                        'Required as per the country\'s regulations, this document serves as the current "identity card" for the entity, indicating its status (active or closed).',
                      )}
                    </li>

                    <li>
                      {t("If a registry extract exists, it must not be older than 3 months.")}
                    </li>
                  </ul>
                </li>
              </ul>
              <br />
              <p>{t("The document must include the following details:")}</p>
              <br />
              <ul>
                <li>{t("Entity name")}</li>
                <li>{t("Full registered address")}</li>
                <li>
                  {t("Registration number (if applicable, based on the country's requirements)")}
                </li>
                <li>{t("Date of creation")}</li>
                <li> {t("Description of the entity's activities or purpose")}</li>
              </ul>
              <br />
              <p>{t("If applicable, the document should also include:")}</p>
              <ul>
                <li>{t("Trading names")}</li>
                <li>{t("Value Added Tax (VAT) number")}</li>
              </ul>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Articles of Association")}{" "}
            <Info className={styles.info_icon} size={16} onClick={() => setModalTwo(!modalTwo)} />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal isOpen={modalTwo} toggle={() => setModalTwo(!modalTwo)} style={{ minWidth: "60vw" }}>
          <ModalHeader toggle={() => setModalTwo(!modalTwo)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "The Articles of Association serve as the constitutional document of the entity outlining its operating rules.",
                )}
              </p>

              <br />
              <p>
                {t(
                  "There is no time constraint on this document, meaning the most recent versi requested. Typically, these types of entities require at least one annual meeting that may result in an updated version of the Articles of Association.",
                )}
              </p>

              <br />
              <p>
                {t(
                  "Examples of changes that could occur include updates to the entity's name, address, purpose, management board, roles, responsibilities, etc.",
                )}
              </p>
              <br />
              <p>{t("The document should contain information about:")}</p>
              <ul>
                <li>
                  {" "}
                  {t(
                    "The entity itself, including its legal name, registered address, and purpose",
                  )}
                </li>
                <li>
                  {" "}
                  {t(
                    "Its internal operating rules, such as the appointment process for management board members, their roles and powers, among other details. This list is not exhaustive.",
                  )}
                </li>
                <li>{t("How the entity is funded")}</li>
              </ul>
              <br />
              <p>
                <strong>
                  {t("* Appointment/Removal/Changes on Board of Management Members:")}
                </strong>
              </p>
              <br />
              <ul>
                <li>
                  {t(
                    "These updates usually occur based on the entity's needs or as stipulated in the Articles of Association. Changes are documented through board of management meeting minutes, which are registered and certified to reflect the updated list of members like the president, vice-president, treasurer, and general secretary.",
                  )}
                </li>
                <li>
                  {t(
                    "The latest board management meeting minutes, including the current list of members, will be required in addition to the Articles of Association, if available.",
                  )}
                </li>
                <li>
                  {t(
                    "Note: If the current list of board management members is not included in the latest Articles of Association and there are no board meeting minutes available, this list must be provided. It should be dated and signed by the most recently appointed legal representative, whose appointment can be verified through related documentation.",
                  )}
                </li>
              </ul>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Proof of Legal Representative's Authority")}{" "}
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
          <ModalHeader toggle={() => setModalThree(!modalThree)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "This document demonstrates an individual's authority to represent the entity. This document could be:",
                )}
              </p>
              <br />

              <ul>
                <li>{t("The latest Articles of Association")}</li>
                <li>
                  {" "}
                  {t(
                    "The current list of board management members (which may be included in the board management meeting minutes)",
                  )}
                </li>
              </ul>
              <br />
              <p>{t("The document should specify:")}</p>
              <ul>
                <li> {t("Full name of the individual(s)")}</li>
                <li>
                  {" "}
                  {t(
                    "Function of the individual(s). This information will be cross-verified with the Articles of Association to ensure that the individual's function permits them to bind the entity. This is particularly important when the applicant is not the president, and other  functions have limited representation authority as stated in the Articles of Association.",
                  )}
                </li>
              </ul>
              <br />
              <p>
                {t(
                  "Additional information about the legal representative that will be collected includes:",
                )}
              </p>
              <ul>
                <li>{t("Date and place of birth")}</li>
                <li>
                  {t("Residential address (at least the country of residence should be stated)")}
                </li>
                <li> {t("Nationality")}</li>
              </ul>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Ownership Structure & Ultimate Beneficial Owners (UBOs)")}{" "}
            <Info className={styles.info_icon} size={16} onClick={() => setModalFour(!modalFour)} />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal
          isOpen={modalFour}
          toggle={() => setModalFour(!modalFour)}
          style={{ minWidth: "60vw" }}
        >
          <ModalHeader toggle={() => setModalFour(!modalFour)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "Typically, these types of entities, given their structure and purpose, do not have beneficial owners. However, board members will be identified and treated as such for screening purposes, ID collection and verification, etc.",
                )}
              </p>
              <br />
              <p>
                {t(
                  "A small number of associations might have beneficial owners, particularly those generating profits. In such instances, this detail will be mentioned in the Articles of Association. These individuals will be easily identified and treated as such, alongside management board members.",
                )}
              </p>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <div>
        <FormGroup>
          <Label>
            {t("Collection of Identification Documents")}{" "}
            <Info className={styles.info_icon} size={16} onClick={() => setModalFive(!modalFive)} />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal
          isOpen={modalFive}
          toggle={() => setModalFive(!modalFive)}
          style={{ minWidth: "60vw" }}
        >
          <ModalHeader toggle={() => setModalFive(!modalFive)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <p>
                {t(
                  "The identification document must be government-issued, bearing a photograph of the individual. All identification documents must be written in the Latin alphabet. If not, a certified translation will be required",
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
                    "Valid Biometric Driving License - This will be accepted as a standalone form of only if it is the latest version that includes a Machine Readable Zone (MRZ) code, enabling security checks.",
                  )}
                </li>
                <li>
                  {t(
                    "Valid Resident Permits - These will be accepted only if issued by a European country.",
                  )}
                </li>
              </ul>
              <br />
              <p>
                {t(
                  "Only legal representatives are subject to the identification document collection process.",
                )}
              </p>
              <br />
              <p>
                {t(
                  "Additional Requirement: Other members of the management board may also be required to provide identification documents for collection and verification, assessed on a case-by-case basis.",
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
            <Info className={styles.info_icon} size={16} onClick={() => setModalSix(!modalSix)} />
          </Label>
          <Input type="file" />
        </FormGroup>
        <Modal isOpen={modalSix} toggle={() => setModalSix(!modalSix)} style={{ minWidth: "60vw" }}>
          <ModalHeader toggle={() => setModalSix(!modalSix)}>{t("Details")}</ModalHeader>
          <ModalBody>
            <div className={styles.content}>
              <ul>
                <li>
                  {t(
                    "Utility Bill (such as gas, electricity, telephone or mobile phone bill); or  A document issued by a government department that shows the End-user’s address and name (ex. Residential Certificate); or",
                  )}
                </li>
                <li>{t("Bank Statement; or")}</li>
                <li>
                  {t(
                    "A document issued by a government department that shows the End-user’s address and name (ex. Residential Certificate) and name (ex. Residential Certificate)",
                  )}
                </li>
              </ul>
              <br />
              <p>
                <strong>{t("Note:")} </strong>{" "}
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

export default NgosDocs;
