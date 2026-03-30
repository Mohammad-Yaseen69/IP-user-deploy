import React, { useState } from 'react';
import StepZilla from 'react-stepzilla';
import { markups } from './GuidesMarkup';
import StepOne from './UserVerificationStepOne';
import StepThree from './UserVerificationStepThree';
import { Button, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import AccordianComponent from './AccordionComponent';
import { useTranslation } from 'react-i18next';

const InitialStep = () => {
    const [businessType, setBusinessType] = useState("")
    const { t } = useTranslation()
    const createMarkup = () => {
        return { __html: markups[businessType] }
    }
    console.log(t("Publicly Listed Companies"))
    return (
        <>
            <FormGroup style={{ marginTop: "3rem" }}>
                <Label>{t("Account Type")}</Label>
                <select required className="form-control" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                    <option value="">--Select-Business-Type--</option>
                    <option value="private_comp">{t("Private Limited Companies or equivalent")}</option>
                    <option value="public_comp">{t("Publicly Listed Companies")}</option>
                    <option value="ngos">{t("Associations, Non-Governmental Organizations (NGOs), and Charitable Entities")}</option>
                    <option value="sole_prop">{t("Sole Proprietorships")}</option>
                </select>
            </FormGroup>
            {
                businessType
                &&
                <div className='card' style={{ padding: "1.5rem" }}>
                    <h4 className='text-center mb-4'>{t("Document Submission Guideline")}</h4>
                    <div dangerouslySetInnerHTML={createMarkup()}></div>
                </div>
            }
        </>
    )
}

const KYC = () => {
    const { t } = useTranslation()

    const [isOpen, setIsOpen] = useState(1)
    const toggle = (id) => (isOpen === id ? setIsOpen(null) : setIsOpen(id));
    const items = [
        {
            id: 2,
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
        },
        {
            id: 1,
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
        }
    ]
    return (
        <div>
            <h3 className="text-center mt-4">{t("Upload The Proof of Your Identity")}</h3>
            <p className="text-center mb-4">{t("Instapay requires a valid government issued documents.")}</p>
            <Form className='mt-4'>
                <Row>
                    {
                        items.map(item => <AccordianComponent key={item.id} isOpen={isOpen} toggle={toggle} item={item} />)
                    }
                </Row>
                <FormGroup check style={{ marginBottom: "2rem" }}>
                    <Label check>
                        <Input type="checkbox" />
                        <Label>{t("I confirm, that I uploaded valid government-issued documents.")}</Label>
                    </Label>
                </FormGroup>
            </Form>
        </div>
    )
}

const UserVerification = ({ ssi }) => {
    const [showKyc, setShowKyc] = useState(false)

    const steps = [
        { name: 'Step 1', component: <InitialStep /> },
        { name: 'Step 2', component: <StepOne /> },
        { name: 'Step 3', component: <StepThree ssi={ssi} /> },
    ];

    const KYCsteps = [
        { name: "Step 1", component: <KYC /> },
        { name: "Step 2", component: <StepThree ssi={ssi} /> }
    ]



    return (
        <div className='card' style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: "right", marginBottom: ".5rem" }}>
                <Button color='primary' outline={!showKyc} onClick={() => setShowKyc(!showKyc)}>{showKyc ? "KYB" : "KYC"}</Button>
            </div>
            {
                showKyc
                    ?
                    <div className='step-timeline'>
                        <StepZilla
                            steps={KYCsteps}
                            showSteps={true}
                            showNavigation={true}
                            stepsNavigation={true}
                            prevBtnOnLastStep={false}
                            dontValidate={true}
                        />
                    </div>
                    :
                    <div className='step-timeline'>
                        <StepZilla
                            steps={steps}
                            showSteps={true}
                            showNavigation={true}
                            stepsNavigation={true}
                            prevBtnOnLastStep={false}
                            dontValidate={true}
                        />
                    </div>
            }
        </div>
    )
};

export default UserVerification;