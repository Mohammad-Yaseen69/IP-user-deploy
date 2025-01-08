import { useState } from "react";
import GuideItem from "./GuideItem";
import styles from "./styles/ReferGuidance.module.scss"
import { Accordion, Card, CardBody, CardHeader, Col, Collapse } from "reactstrap";
import { Btn, H5 } from "../../AbstractElements";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";

const ReferGuidance = () => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    return (
        <>
            <Col style={{ margin: "auto", width: "90%" }}>
                <Accordion defaultActiveKey="0">
                    <Card>
                        <div className="default-according" id="accordion">
                            <Card>
                                <CardHeader>
                                    <H5 attrH5={{ className: "mb-0" }}>
                                        <Btn
                                            attrBtn={{
                                                className: "btn btn-link ps-0",
                                                color: "default",
                                                onClick: toggle,
                                                style: {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    width: "100%"
                                                }
                                            }}
                                        >
                                            {t("How do I refer my friend?")}
                                            {
                                                isOpen ? <ChevronUp /> : <ChevronDown />
                                            }
                                        </Btn>
                                    </H5>
                                </CardHeader>
                                <Collapse isOpen={isOpen}>
                                    <CardBody>
                                        <div className={styles.items__container} style={{
                                            display: "flex",
                                            gap: "1rem",
                                            justifyContent: "center",
                                            flexWrap: "wrap"
                                        }}>
                                            <GuideItem count={1} description="This is a dummy text, but will be replaced by the original text." />
                                            <GuideItem count={2} description="This is a dummy text, but will be replaced by the original text. This is a dummy text, but will be replaced by the original text." />
                                            <GuideItem count={3} description="This is a dummy text, but will be replaced by the original text. This is a dummy text, but will be replaced by the original text. This is a dummy text, but will be replaced by the original text." />
                                        </div>
                                    </CardBody>
                                </Collapse>
                            </Card>
                        </div>
                    </Card>
                </Accordion>
            </Col>
        </>
    )
}

export default ReferGuidance;