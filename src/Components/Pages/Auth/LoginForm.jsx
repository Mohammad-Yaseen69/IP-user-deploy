import axios from 'axios';
import { useState } from 'react';
import { Instagram } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { Btn, H4, H6, P, UL, LI } from '../../../AbstractElements';
import { CreateAccount, EmailAddress, ForgotPassword, Signinaccount, Password, RememberPassword } from '../../../Constant';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';


const LoginForm = () => {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassField, setShowPassField] = useState(false)

    const navigate = useNavigate()

    const signin = (e) => {
        e.preventDefault()

        // const credentials = {
        //     email, password
        // }

        // const encrypted = encryptData(credentials)


        // axios.post(`${process.env.REACT_APP_API_URL}/api/user/login`, {
        //     data: encrypted
        // })
        //     .then((res) => {
        //         const decrypted = decryptData(res.data.data)
        //         localStorage.setItem("login", true)
        //         localStorage.setItem("token", decrypted.token)
        //         navigate('/dashboard/default')
        //     })
        //     .catch(err => "a") // console.log(err))

        localStorage.setItem("login", true)
        localStorage.setItem("token", "abc")
        navigate("/dashboard/default")
    }

    return (
        <div className="login-main">
            <Form className="theme-form login-form" onSubmit={signin}>
                <div className="login-header text-center">
                    <H4>{Signinaccount}</H4>
                    <P>Enter your email & password to login</P>
                </div>
                <FormGroup>
                    <Label>{EmailAddress}</Label>
                    <div className="input-group">
                        <Input type="email" required="" placeholder="Test@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </FormGroup>
                {
                    !showPassField
                    &&
                    <FormGroup>
                        <Btn attrBtn={{ color: 'primary', className: 'w-100', type: 'button', onClick: () => setShowPassField(true) }} >NEXT</Btn>
                    </FormGroup>
                }


                {/* //////////////////////////////////////////////////////////////////////// */}
                {
                    showPassField
                    &&
                    <>
                        <FormGroup className='position-relative pass-hide'>
                            <Label>{Password}</Label>
                            <Input className="form-control" type={showPass ? "text" : "Password"} name="login[password]" required="" placeholder="*********" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <div className="show-hide">
                                <span className="show" onClick={() => { setShowPass(!showPass) }}>
                                </span>
                            </div>
                        </FormGroup>
                        <FormGroup className='position-relative'>
                            <div className="checkbox">
                                <Input id="checkbox1" type="checkbox" />
                                <Label className="text-muted" for="checkbox1">{RememberPassword}</Label>
                            </div>
                            <Link to={`${process.env.PUBLIC_URL}/authentication/forget-pwd`} className="link">
                                {ForgotPassword}?
                            </Link>
                        </FormGroup>
                        <FormGroup>
                            <Btn attrBtn={{ color: 'primary', className: 'w-100', type: 'submit' }} >SIGN IN </Btn>
                        </FormGroup>
                    </>
                }
                {/* ////////////////////////////////////////////////////////////////////// */}


                <div className="login-social-title">
                    <H6>Or Sign in with</H6>
                </div>
                <FormGroup>
                    <UL attrUL={{ className: 'simple-list login-social flex-row' }}>
                        <LI>
                            <a href="https://www.instagram.com/">
                                <Instagram />
                            </a>
                        </LI>
                    </UL>
                </FormGroup>
                <P attrPara={{ className: 'text-center mt-4 mb-0' }}>Don't have account?
                    <Link to={`${process.env.PUBLIC_URL}/signup`} className="ms-2">
                        {CreateAccount}
                    </Link>
                </P>
            </Form>
        </div>
    );
};

export default LoginForm;