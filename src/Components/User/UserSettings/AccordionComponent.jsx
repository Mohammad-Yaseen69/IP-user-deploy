import { ChevronDown, ChevronUp, Trash2 } from "react-feather"
import { Accordion, Card, CardBody, CardHeader, Col, Collapse, Input } from "reactstrap";
import { useState } from "react";
import { Btn, H5 } from "../../../AbstractElements";


const AccordianComponent = ({ item, isOpen, toggle }) => {
    const [file, setFile] = useState("")
    return (
        <Col lg="12">
            <Accordion defaultActiveKey="0">
                <Card>
                    <div className="default-according" id="accordion">
                        <Card>
                            <CardHeader className={"bg-primary"}>
                                <H5 attrH5={{ className: "mb-0" }}>
                                    <Btn
                                        attrBtn={{
                                            className: "btn btn-link ps-0",
                                            color: "default",
                                            onClick: () => toggle(item.id),
                                            style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%"
                                            }
                                        }}
                                    >
                                        {item.heading}
                                        {
                                            isOpen === item.id ? <ChevronUp /> : <ChevronDown />
                                        }
                                    </Btn>
                                </H5>
                            </CardHeader>
                            <Collapse isOpen={isOpen === item.id}>
                                <CardBody>
                                    {
                                        item.options.length > 1
                                            ?
                                            <Input type="select" className="mb-4" required>
                                                {
                                                    item.options.map(sub_item => <option value={sub_item.value}>{sub_item.name}</option>)
                                                }
                                            </Input>
                                            :
                                            <Input type="text" value={item.options[0].name} readOnly className="mb-4" />
                                    }
                                    <Input type="file" className="mb-4" value={file} onChange={e => setFile(e.target.value)} required />
                                    {
                                        file
                                        &&
                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <button type="button" style={{ color: "red", cursor: "pointer", border: "none", outline: "none", background: "transparent" }} onClick={() => {
                                                setFile("")
                                            }}>
                                                <Trash2 />
                                            </button>
                                        </div>
                                    }
                                </CardBody>
                            </Collapse>
                        </Card>
                    </div>
                </Card>
            </Accordion>
        </Col>
    )
}

export default AccordianComponent