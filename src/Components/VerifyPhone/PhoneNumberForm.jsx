import { Form, Container, FormGroup, Label } from 'reactstrap'
import { Btn, H4, P } from '../../AbstractElements'
import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const PhoneNumberForm = ({ setPhoneTab }) => {
    const [phone, setPhone] = useState()
    return (
        <Container className="p-0" fluid={true}>
            <div className="login-card">
                <div className='login-main'>
                    <Form className="theme-form login-form">
                        <div className="login-header text-center">
                            <H4>Verify Phone</H4>
                            <P>Enter your phone number to verify</P>
                        </div>
                        <FormGroup style={{
                            marginTop: "2rem"
                        }}>
                            <Label>Phone Number</Label>
                            <PhoneInput
                                placeholder="Enter Phone number"
                                value={phone}
                                onChange={setPhone}
                                country="us"
                                inputStyle={{
                                    width: "100%",
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Btn attrBtn={{ color: "primary", className: "w-100", type: "button", onClick: () => setPhoneTab(false) }}>Verify</Btn>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        </Container>
    )
}

export default PhoneNumberForm