import { Form, Container, FormGroup, Input, InputGroup, Label } from 'reactstrap'
import { Btn, H4, P } from '../../AbstractElements'
import { useState } from 'react'

const OtpForm = () => {
    const [otp, setOtp] = useState("")
    return (
        <Container className="p-0" fluid={true}>
            <div className="login-card">
                <div className='login-main'>
                    <Form className="theme-form login-form">
                        <div className="login-header text-center">
                            <H4>OTP Confirmation</H4>
                            <P>Enter the OTP code from your phone</P>
                        </div>
                        <FormGroup style={{
                            marginTop: "2rem"
                        }}>
                            <Label>OTP Code</Label>
                            <InputGroup>
                                <Input className="form-control" type="text" required="" value={otp} onChange={(e) => setOtp(e.target.value)} style={{
                                    appearance: "none"
                                }} />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Btn attrBtn={{ color: "primary", className: "w-100", type: "button" }}>Continue</Btn>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        </Container>
    )
}

export default OtpForm