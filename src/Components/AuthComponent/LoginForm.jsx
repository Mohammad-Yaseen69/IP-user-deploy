import axios from 'axios'
import { useState } from 'react'
import { Instagram, Eye, EyeOff } from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import { Form, FormGroup, Input, Label } from 'reactstrap'
import { Btn, H4, H6, P, UL, LI } from '../../AbstractElements'
import { EmailAddress, ForgotPassword, Signinaccount, Password, RememberPassword } from '../../Constant'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'


const LoginForm = ({ silf }) => {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [credentialsError, setCredentialsError] = useState("")
    const [isLogging, setIsLogging] = useState(false)

    const getUserInfo = async () => {
        try {
            const res = await fetch("https://geolocation-db.com/json/")
            const location = await res.json()

            return {
                browser_name: navigator?.userAgentData?.brands[0]?.brand ?? "N/A",
                platform: navigator?.userAgentData?.platform,
                ...location,
                browser_version: navigator?.userAgentData?.brands[0]?.version ?? "N/A",
                is_mobile_user: navigator?.userAgentData?.mobile,
            }
        } catch (error) {
            setIsLogging(false)
            setCredentialsError("Something went wrong. Please try again.")
        }
    }


    const signin = (e) => {
        e.preventDefault()
        setIsLogging(true)
        const credentials = {
            email, password
        }

        const encrypted = encryptData(credentials)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/login`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                localStorage.setItem("login", true)
                localStorage.setItem("token", decrypted.token)
                axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/auth/${decrypted?.token}`)
                    .then(async res => {
                        const decrypted = decryptData(res.data.data)
                        const data = await getUserInfo()
                        const encrypted = encryptData(
                            {
                                accountId: decrypted?._id,
                                ...data
                            }
                        )
                        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/login/create-login-history`, {
                            data: encrypted
                        })
                            .then(res => {
                                const decrypted = decryptData(res.data.data)
                                window.location.href = "/dashboard/default"
                                // console.log(decrypted)
                                setIsLogging(false)
                            })
                            .catch(err => {
                                const decrypted = decryptData(err.response.data.data)
                                // console.log(decrypted)
                            })
                    })
                    .catch(err => {
                        // console.log(decryptData(err.response.data.data))
                    })
            })
            .catch(error => {
                const decrypted = decryptData(error.response.data.data)
                if (decrypted.message === "Account not found!" || decrypted.message === "Incorrect Password!") {
                    setCredentialsError("Invalid Email or Password.")
                }
            })
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
                <FormGroup className='position-relative pass-hide'>
                    <Label>{Password}</Label>
                    <Input className="form-control" type={showPass ? "text" : "Password"} name="login[password]" required="" placeholder="*********" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {
                        showPass
                            ?
                            <EyeOff size={20} style={{
                                position: "absolute",
                                top: "42px",
                                right: "13px",
                                cursor: "pointer"
                            }} onClick={() => setShowPass(!showPass)} />
                            :
                            <Eye size={20} style={{
                                position: "absolute",
                                top: "42px",
                                right: "13px",
                                cursor: "pointer"
                            }} onClick={() => setShowPass(!showPass)} />
                    }
                </FormGroup>
                {
                    credentialsError &&
                    <p style={{ color: "red", fontSize: ".8rem", fontWeight: 600, margin: ".5rem .5rem .5rem", textAlign: "center" }}>{credentialsError}</p>
                }
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
                    <Btn attrBtn={{
                        color: 'primary', className: 'w-100', type: 'submit', style: {
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none"
                        }, disabled: !email || !password || isLogging
                    }} >{isLogging ? "SIGNING IN" : "SIGN IN"} </Btn>
                </FormGroup>

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
                <p className="text-center">Don't have an account?
                    <Link to={"/signup"} onClick={() => silf(false)} style={{
                        color: "var(--theme-default)",
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginLeft: ".3rem"
                    }}>SIGN UP</Link>
                </p>
            </Form>
        </div>
    );
};

export default LoginForm;