import { Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useState } from "react";
import AccordianComponent from "./AccordionComponent";

const StepOne = () => {
    const [isOpen, setIsOpen] = useState(1);
    const toggle = (id) => (isOpen === id ? setIsOpen(null) : setIsOpen(id));

    const items = [
        {
            id: 1,
            heading: "Official Company Registry Extract",
            options: [
                {
                    value: "entity",
                    name: "Entity's Registration"
                },
                {
                    value: "incorporation",
                    name: "Incorporation Document"
                },
            ]
        },
        {
            id: 2,
            heading: "Proof Of Legal Representative Authority",
            options: [
                {
                    value: "poa",
                    name: "Power Of Attorney"
                },
                {
                    value: "dp",
                    name: "Delegation Of Power"
                },
            ]
        },
        {
            id: 3,
            heading: "Ownership Structure And Beneficial Owners",
            options: [
                {
                    value: "UBO",
                    name: "UBO Document"
                }
            ]
        },
        {
            id: 4,
            heading: "Additional Documents",
            options: [
                {
                    value: "utility bill",
                    name: "Utility Bill"
                },
                {
                    value: "bank statement",
                    name: "Bank Statement"
                },
                {
                    value: "residential",
                    name: "Residential Certificate"
                },
            ]
        },
        {
            id: 5,
            heading: "Collection Of Identification Documents",
            options: [
                {
                    value: "nic",
                    name: "Valid National Identity Card"
                },
                {
                    value: "passport",
                    name: "Valid Passport"
                },
                {
                    value: "license",
                    name: "Valid Biometric Driving License"
                },
                {
                    value: "rp",
                    name: "Valid Resident Permit"
                }
            ]
        }
    ]
    return (
        <div>
            <h3 className="text-center mt-4">Upload The Proof of Your Account Identity</h3>
            <p className="text-center mb-4">Instapay requires a valid government issued documents</p>
            <Form className="mt-4">
                <Row>
                    {
                        items.map(item => <AccordianComponent key={item.id} isOpen={isOpen} toggle={toggle} item={item} />)
                    }
                </Row>
                <FormGroup check style={{ marginBottom: "2rem" }}>
                    <Label check>
                        <Input type="checkbox" />
                        <Label>I confirm, that I uploaded valid government-issued documents.</Label>
                    </Label>
                </FormGroup>
            </Form>
        </div>
    )
}

export default StepOne;