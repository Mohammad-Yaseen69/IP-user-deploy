import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormGroup, Input, InputGroup, Label, Row, Col } from "reactstrap";
import { Btn, H4, P } from "../../../AbstractElements";
import { CreateAccount, Password, PrivacyPolicy, SignIn, YourName } from "../../../Constant";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";

const RegisterFrom = () => {
  const navigate = useNavigate()
  // const [user_name, setUsername] = useState("")
  // const [phone, setPhone] = useState("")
  const [accountType, setAccountType] = useState("")
  // const [dob, setDob] = useState("")
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("");
  const [showPass, setShowPass] = useState(false)

  const signup = (e) => {
    e.preventDefault()

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    // // Test the password against the regular expression
    if (!regex.test(password)) {
      setErrorMessage("Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.");
      return;
    }

    const credentials = {
      first_name, last_name, email, password,
    }


    const encrypted = encryptData(credentials)


    axios.post(`${process.env.REACT_APP_API_URL}/api/user`, {
      data: encrypted
    })
      .then(res => {
        const decrypted = decryptData(res.data.data)
        // console.log(decrypted)
      })
      .catch(error => {
        // console.log(error)
      })

    // localStorage.setItem('login', true)
    // navigate('/verify-phone')
  }


  return (
    <div className="login-main">
      <Form className="theme-form login-form" onSubmit={signup}>
        <div className="login-header text-center">
          <H4>Create your account</H4>
          <P>Enter your personal details to create account</P>
        </div>
        <FormGroup>
          <Label>{YourName}</Label>
          <Row>
            <Col sm="6">
              <Input className="form-control" type="text" required="" placeholder="Fist Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} />
            </Col>
            <Col sm="6">
              <Input className="form-control" type="text" required="" placeholder="Last Name" value={last_name} onChange={(e) => setLastName(e.target.value)} />
            </Col>
          </Row>
        </FormGroup>
        {/* <FormGroup>
          <Label>Username</Label>
          <InputGroup>
            <Input className="form-control" type="text" required="" placeholder="imtiaz0307" value={user_name} onChange={(e) => setUsername(e.target.value)} />
          </InputGroup>
        </FormGroup> */}
        <FormGroup>
          <Label>Email Address</Label>
          <InputGroup>
            <Input className="form-control" type="email" required="" placeholder="abc@xyz.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </InputGroup>
        </FormGroup>
        {/* <FormGroup>
          <Label>Phone Number</Label>
          <InputGroup>
            <Input className="form-control" type="number" required="" placeholder="+92310234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </InputGroup>
        </FormGroup> */}
        <FormGroup className="position-realtive form-group pass-hide">
          <Label>{Password}</Label>
          <Input className="form-control" type={showPass ? "text" : "password"} name="login[password]" required="" placeholder="*********" value={password} onChange={(e) => {
            setPassword(e.target.value)
            setErrorMessage("");
          }} />
          <div className="show-hide" onClick={() => setShowPass(!showPass)}>
            <span className="show"></span>
          </div>
        </FormGroup>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <FormGroup className="position-realtive form-group pass-hide">
          <Label>Confirm Password</Label>
          <Input className="form-control" type="password" name="login[confirmpassword]" required="" placeholder="*********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </FormGroup>
        <FormGroup className="position-realtive form-group pass-hide">
          <Label>Account Type</Label>
          <select required className="form-control" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
            <option value="">--Select-Account-Type--</option>
            <option value="individual">Individual Account</option>
            <option value="business">Business Account</option>
          </select>
        </FormGroup>
        {/* <FormGroup>
          <Row>
            <Col sm="6">
            </Col>
            <Col sm="6">
              <Label>Date Of Birth</Label>
              <Input className="form-control" type="date" required="" value={dob} onChange={(e) => setDob(e.target.value)} />
            </Col>
          </Row>
        </FormGroup> */}
        <FormGroup>
          <div className="checkbox">
            <Input id="checkbox1" type="checkbox" />
            <Label className="text-muted" for="checkbox1">
              Agree with
              <a className="ms-2" href="#javascript">{PrivacyPolicy}</a>
            </Label>
          </div>
        </FormGroup>
        <FormGroup>
          <Btn attrBtn={{ color: "primary", className: "w-100", type: "submit" }}>{CreateAccount}</Btn>
        </FormGroup>
        <P attrPara={{ className: "mt-4 mb-0 text-center" }}>
          Already have an account?
          <Link to={`${process.env.PUBLIC_URL}/login`} className="ms-2">
            {SignIn}
          </Link>
        </P>
      </Form>
    </div>
  );
};

export default RegisterFrom;
