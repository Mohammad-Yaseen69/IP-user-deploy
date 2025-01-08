import { Col, Row, Form, FormGroup, Label, Input, Card, CardBody } from 'reactstrap';
import Dropzone from 'react-dropzone-uploader';
import { AccountTypeData } from './AccountTypeData';
import { useState } from 'react';
import { countries } from 'country-list-json';

const StepTwo = () => {
    const [accountType, setAccountType] = useState("")
    const getUploadParams = () => {
        return { url: 'https://httpbin.org/post' };
    };
    const handleChangeStatus = ({ meta, file }, status) => {
    };

    const createMarkup = (content) => {
        return { __html: content }
    }
    return (
        <div>
            <h4 style={{ margin: "3rem 0 1rem", textAlign: "center" }}>Upload a proof of your company</h4>
            <p className='text-center' style={{ marginBottom: "3rem" }}>InstaPay requires a valid government company documents.</p>
            <Form>
                <Row style={{ marginBottom: "2rem" }}>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="country">Country</Label>
                            <Input type="select" name="country" id="country">
                                <option value="">--Select-Country--</option>
                                {
                                    countries.map((country) => <option value={country.code} key={country.code}>{country.name}</option>)
                                }
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="documentType">Document Type</Label>
                            <Input type="select" name="documentType" id="documentType" value={accountType} onChange={e => setAccountType(e.target.value)}>
                                <option value="">--Select-Document-Type--</option>
                                {
                                    AccountTypeData.private.map(item => (
                                        <option value={item.value}>{item.name}</option>
                                    ))
                                }
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
                {
                    accountType
                    &&
                    <Row>
                        <Col lg="12" dangerouslySetInnerHTML={createMarkup(AccountTypeData.private.filter(item => item.value === accountType)[0].description)}></Col>
                    </Row>
                }
                <Row>
                    <Col lg="6">
                        <Card>
                            <h5 style={{ padding: "1.5rem 1.5rem 0", textAlign: "center" }}>Upload the front of your document.</h5>
                            <CardBody>
                                <Form>
                                    <div className="dz-message needsclick">
                                        <Dropzone
                                            getUploadParams={getUploadParams}
                                            onChangeStatus={handleChangeStatus}
                                            maxFiles={1}
                                            multiple={false}
                                            canCancel={false}
                                            inputContent="Drop A File"
                                            styles={{
                                                dropzone: { height: 200 },
                                                dropzoneActive: { borderColor: "green" },
                                            }}
                                        />
                                    </div>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col lg="6">
                        <Card>
                            <h5 style={{ padding: "1.5rem 1.5rem 0", textAlign: "center" }}>Upload the back of your document.</h5>
                            <CardBody>
                                <Form>
                                    <div className="dz-message needsclick">
                                        <Dropzone
                                            getUploadParams={getUploadParams}
                                            onChangeStatus={handleChangeStatus}
                                            maxFiles={1}
                                            multiple={false}
                                            canCancel={false}
                                            inputContent="Drop A File"
                                            styles={{
                                                dropzone: { height: 200 },
                                                dropzoneActive: { borderColor: "green" },
                                            }}
                                        />
                                    </div>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <FormGroup check style={{ marginBottom: "2rem" }}>
                    <Label check>
                        <Input type="checkbox" />
                        <Label>I confirm, that I uploaded valid government-issued photo ID. This ID include my picture, signature, name, Date Of Birth, and address.</Label>
                    </Label>
                </FormGroup>
            </Form>
        </div>
    )
}

export default StepTwo