import axios from "axios";
import { Fragment, useEffect, useRef, useState } from "react";
import { FormGroup, Input, InputGroup, Label, Row, Col } from "reactstrap";
import { Btn, H4, P } from "../../AbstractElements";
import { PrivacyPolicy, YourName } from "../../Constant";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import PhoneInput from "react-phone-input-2";
import signupImg from "./signup.png"
import { Check, Eye, EyeOff, X } from "react-feather";
import { useLocation, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";


const SignupForm = ({ silf }) => {
    const navigate = useNavigate()
    const [showPass, setShowPass] = useState(false)
    const [accountType, setAccountType] = useState("")
    const [first_name, setFirstName] = useState("")
    const [last_name, setLastName] = useState("")
    const [company_name, setCompanyName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [phone, setPhone] = useState()
    const [resendTimer, setResendTimer] = useState(90)
    const [currentFields, setCurrentFields] = useState(0)
    const [country, setCountry] = useState("")
    const [spr, setSpr] = useState(false)
    const [emailError, setEmailError] = useState("")
    const [emailAvailable, setEmailAvailable] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [phoneAvailable, setPhoneAvailable] = useState(false)

    // getting referral code if any
    // const location = useLocation()
    // const queryParams = new URLSearchParams(location.search)
    // const ref_code = queryParams.get("code")

    const { code: ref_code } = useParams()
    const [referralCode, setReferralCode] = useState("")
    const [referralError, setReferralError] = useState("")

    useEffect(() => {
        if (ref_code) {
            setReferralCode(ref_code.toLowerCase())
        }
    }, [ref_code])

    useEffect(() => {
        let debounceTimeout;

        if (referralCode) {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/check-referral-code/${referralCode}`)
                    .then(res => {
                        const decrypted = decryptData(res.data.data);
                        setReferralError("")
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data);
                        if (decrypted.message.toLowerCase().includes("invalid")) {
                            setReferralError("Invalid Referral code.")
                        }
                    });
            }, 1000);
        } else {
            setReferralError("")
        }

        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [referralCode])


    const individualDisable = !first_name || !last_name || !email || !password || !confirmPassword || password !== confirmPassword || password.length < 8 || !emailAvailable || referralError
    const businessDisable = !company_name || !email || !password || !confirmPassword || password !== confirmPassword || password.length < 8 || !emailAvailable || referralError

    const passwordRequirements = [
        {
            label: "Password must contain at least 8 characters",
            isValid: password.length >= 8,
        },
        {
            label: "Password must contain at least one capital letter",
            isValid: /[A-Z]/.test(password),
        },
        {
            label: "Password must contain at least one small letter",
            isValid: /[a-z]/.test(password),
        },
        {
            label: "Password must contain at least one digit",
            isValid: /[0-9]/.test(password),
        },
        {
            label: "Password must contain at least one special character",
            isValid: /[^A-Za-z0-9]/.test(password),
        },
    ];


    const signup = (e) => {
        e.preventDefault()
        if (referralCode) {
            const credentials = {
                type: accountType === "individual" ? "individualAccount" : "businessAccount",
                email, phone, first_name, last_name, password
            }


            // console.log(credentials)
            const encrypted = encryptData(credentials)

            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-link-signup/${referralCode}`, {
                data: encrypted
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)

                    if (decrypted.status) {
                        const data = {
                            username: referralCode,
                            userId: decrypted?.accountData?._id ?? "",
                            type: decrypted?.accountData?.account_type === "individual" ? "individualAccount" : "businessAccount",
                        }
                        // console.log(data)
                        const encrypted = encryptData(data)

                        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/ref-user-update`, {
                            data: encrypted
                        })
                            .then(res => {
                                const decrypted = decryptData(res.data.data)
                                // console.log(decrypted)
                                if (decrypted.status === true) {
                                    silf(true)
                                    navigate("/login")
                                }
                            })
                            .catch(error => {
                                const decrypted = decryptData(error?.response?.data?.data)
                                // console.log(decrypted)
                            })
                    }
                })
                .catch(error => {
                    const decrypted = decryptData(error?.response?.data?.data)
                    // console.log(decrypted)
                })
        } else {
            if (accountType === "business") {

                const credentials = {
                    email, company_name, password
                }
                // console.log(credentials)

                const encrypted = encryptData(credentials)
                // console.log(encrypted)

                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/registration/business`, {
                    data: encrypted
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        if (decrypted.status === true) {
                            silf(true)
                            navigate("/login")
                        }
                    })
                    .catch(error => {
                        const decrypted = decryptData(error?.response?.data?.data)
                        if (decrypted.message === "Email already exist!") {
                            setEmailError("Email Taken.")
                        }
                    })
            }
            if (accountType === "individual") {
                const credentials = {
                    email, phone, first_name, last_name, password
                }


                // console.log(credentials)
                const encrypted = encryptData(credentials)
                // console.log(encrypted)

                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/registration/individual`, {
                    data: encrypted
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        if (decrypted.status === true) {
                            silf(true)
                            navigate("/login")
                        }
                    })
                    .catch(error => {
                        const decrypted = decryptData(error?.response?.data?.data)
                        if (decrypted.message === "Email already exist!") {
                            setCurrentFields(0)
                            setEmailError("Email Taken.")
                        }
                    })
            }
        }
    }

    const checkEmail = (e) => {
        const data = { email: e }
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/business`, {
            data: encrypted
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    setEmailError("")
                    setEmailAvailable(true)
                }
            })
            .catch(error => {
                const decrypted = decryptData(error?.response?.data?.data)
                if (decrypted.message === "Email already exist!") {
                    setEmailError("Email already exist!")
                    setEmailAvailable(false)
                } else if (decrypted.message === "Account not found!") {
                    setEmailError("")
                    setEmailAvailable(true)
                }
            })
    }

    const checkPhone = (e) => {
        const data = { email, phone: e }
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/individual`, {
            data: encrypted
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    setPhoneError("")
                    setPhoneAvailable(true)
                }
            })
            .catch(error => {
                const decrypted = decryptData(error?.response?.data?.data)
                if (decrypted.message === "Phone number already exist!") {
                    setPhoneError("Phone number is in use.")
                    setPhoneAvailable(false)
                } else if (decrypted.message === "Account not found!") {
                    setPhoneError("")
                    setPhoneAvailable(true)
                }
            })
    }


    const [inputValues, setInputValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([])

    const handleKeyUp = (index, e) => {
        const value = e.target.value;
        const newInputValues = [...inputValues];
        newInputValues[index] = value;
        setInputValues(newInputValues);

        if (value && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
        if (!value && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };


    useEffect(() => {
        if (currentFields === 3 && resendTimer > 0) {
            setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000);
        }
    }, [resendTimer, currentFields])


    const getIPAddress = async () => {
        const res = await fetch("https://geolocation-db.com/json/")
        const data = await res.json()
        setCountry(data.country_code)
    }

    useEffect(() => {
        function getUserCountryCode() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        const geocodingApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

                        fetch(geocodingApiUrl)
                            .then(response => response.json())
                            .then(data => {
                                const countryCode = data.countryCode;
                                setCountry(countryCode)
                            })
                            .catch(error => {
                                // console.log('Error:', error);
                            });
                    },
                    function (error) {
                        getIPAddress()
                    }
                );
            } else {
                getIPAddress()
            }
        }

        getUserCountryCode();
    }, []);

    return (
        <div className="login-main">
            <div className="theme-form login-form">
                {
                    currentFields === 0
                    &&
                    <>
                        <div className="login-header text-center">
                            <H4 attrH4={{ style: { fontSize: "1.2rem" } }}>Experience Seamless Payments</H4>
                            <P>Start Your InstaPay Journey Today!</P>
                        </div>
                        <form method="POST" onSubmit={e => {
                            e.preventDefault()
                            if (password !== confirmPassword) {
                                setConfirmPasswordError("Password doesn't match.")
                                setTimeout(() => {
                                    setConfirmPasswordError("")
                                }, 3000);
                            }
                        }}>
                            <FormGroup className="position-realtive form-group pass-hide">
                                <Label>Account Type</Label>
                                <select required className="form-control" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                                    <option value="">--Select-Account-Type--</option>
                                    <option value="individual">Individual Account</option>
                                    <option value="business">Business Account</option>
                                </select>
                            </FormGroup>
                            {
                                !accountType
                                &&
                                <img src={signupImg} className="sign_img" />
                            }
                            {
                                accountType
                                &&
                                <>
                                    {
                                        accountType !== "individual"
                                            ?
                                            <FormGroup>
                                                <Label>Company Name</Label>
                                                <Input required className="form-control" type="text" placeholder="Company Name" value={company_name} onChange={(e) => setCompanyName(e.target.value)} />
                                            </FormGroup>
                                            :
                                            <FormGroup>
                                                <Label>{YourName}</Label>
                                                <Row>
                                                    <Col sm="6">
                                                        <Input required className="form-control" type="text" placeholder="Fist Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} />
                                                    </Col>
                                                    <Col sm="6">
                                                        <Input required className="form-control" type="text" placeholder="Last Name" value={last_name} onChange={(e) => setLastName(e.target.value)} />
                                                    </Col>
                                                </Row>
                                            </FormGroup>
                                    }
                                    <FormGroup>
                                        <Label>Email Address</Label>
                                        <InputGroup>
                                            <Input required className="form-control" type="email" placeholder="abc@xyz.com" value={email} onChange={(e) => {
                                                setEmail(e.target.value)
                                                checkEmail(e.target.value)
                                            }} />
                                        </InputGroup>
                                        {
                                            emailError &&
                                            <p style={{ color: "red", fontSize: ".8rem", fontWeight: 600, margin: ".5rem .5rem 0" }}>{emailError}</p>
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Password</Label>
                                        <Row>
                                            <Col sm="6">
                                                <Input required className="form-control" type={showPass ? "text" : "Password"} placeholder="Password" value={password} onChange={(e) => {
                                                    setPassword(e.target.value)
                                                    setSpr(true)
                                                }} style={{
                                                    paddingRight: "45px"
                                                }} />
                                                {
                                                    showPass
                                                        ?
                                                        <EyeOff size={20} style={{
                                                            position: "absolute",
                                                            top: "16px",
                                                            right: "24px",
                                                            cursor: "pointer"
                                                        }} onClick={() => setShowPass(!showPass)} />
                                                        :
                                                        <Eye size={20} style={{
                                                            position: "absolute",
                                                            top: "16px",
                                                            right: "24px",
                                                            cursor: "pointer"
                                                        }} onClick={() => setShowPass(!showPass)} />
                                                }
                                            </Col>
                                            <Col sm="6">
                                                <Input required className="form-control" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    {
                                        spr
                                        &&
                                        <div className="mt-2 mb-4">
                                            <h5>Password Requirements</h5>
                                            {
                                                passwordRequirements.map(item => (
                                                    <p style={{ marginBottom: 0, color: item.isValid ? "green" : "red", fontSize: ".7rem", display: "flex", alignItems: "center", gap: ".4rem" }}>{item.isValid ? <Check size={16} /> : <X size={16} />}{item.label}</p>
                                                ))
                                            }
                                            <p style={{ marginBottom: 0, color: password === confirmPassword && password.length ? "green" : "red", fontSize: ".7rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
                                                {password === confirmPassword && password.length ? <Check size={16} /> : <X size={16} />}
                                                {password === confirmPassword && password.length ? "Password matched." : "Password doesn't match."}
                                            </p>
                                        </div>
                                    }
                                    <FormGroup>
                                        <Label>Referral Code</Label>
                                        <span style={{ fontSize: ".5rem", fontWeight: 500, transform: "translateY(-2px)", marginLeft: "4px" }}>(It will be autofilled, if you're signing up with invitation link.)</span>
                                        <InputGroup>
                                            <Input required className="form-control" type="text" placeholder="Enter the referral code here" value={referralCode} onChange={(e) => {
                                                setReferralCode(e.target.value.toLowerCase())
                                            }} />
                                        </InputGroup>
                                        {
                                            referralError &&
                                            <p style={{ color: "red", fontSize: ".8rem", fontWeight: 600, margin: ".5rem .5rem 0" }}>{referralError}</p>
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <div className="checkbox">
                                            <Input required id="checkbox1" type="checkbox" />
                                            <Label className="text-muted" for="checkbox1">
                                                Agree with
                                                <a className="ms-2" href="#javascript">Terms & Conditions</a>
                                            </Label>
                                        </div>
                                        <div className="checkbox">
                                            <Input required id="checkbox2" type="checkbox" />
                                            <Label className="text-muted" for="checkbox2">
                                                Agree with
                                                <a className="ms-2" href="#javascript">{PrivacyPolicy}</a>
                                            </Label>
                                        </div>
                                    </FormGroup>
                                    <Btn attrBtn={{
                                        color: "primary", className: "w-100", type: "submit", style: {
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none"
                                        }, disabled: accountType === "individual" ? individualDisable : businessDisable,
                                        onClick: () => {
                                            if (accountType === "individual") {
                                                setCurrentFields(2)
                                            }
                                            if (accountType === "business") {
                                                setCurrentFields(3)
                                            }
                                        }
                                    }}>Proceed</Btn>
                                </>
                            }
                        </form>
                    </>
                }

                {
                    currentFields === 2
                    &&
                    <>
                        <div className="login-header text-center">
                            <H4>Phone Number</H4>
                            <P>Please enter your phone number.</P>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault()
                            if (!phone) return;
                            setCurrentFields(3)
                        }}>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label">Mobile Number</Label>
                                <PhoneInput
                                    placeholder="Enter Phone number"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e)
                                        if (e.length >= 10) {
                                            checkPhone(e)
                                        }
                                    }}
                                    country={country.toLowerCase() || "us"}
                                    inputStyle={{
                                        width: "100%",
                                        flex: 1,
                                        minWidth: "250px",
                                        padding: "22px 15px 22px 48px",
                                        lineHeight: "1.5",
                                        border: "1px solid #ced4da"
                                    }}
                                    inputProps={{
                                        required: true
                                    }}
                                />
                            </FormGroup>
                            {
                                phoneError &&
                                <p style={{ color: "red", fontSize: ".8rem", fontWeight: 600, margin: "0rem .5rem .5rem", textAlign: "center" }}>{phoneError}</p>
                            }
                            <FormGroup>
                                <Btn attrBtn={{
                                    color: "primary", className: "w-100", type: "submit", style: {
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none"
                                    }, disabled: phone?.length < 11 || !phoneAvailable,
                                }}>Verify</Btn>
                            </FormGroup>
                        </form>
                    </>
                }

                {
                    currentFields === 3
                    &&
                    <>
                        <div className="login-header text-center">
                            <H4>OTP Verification</H4>
                            <P>Enter the OTP that you received {accountType !== "individual" && "on your email."}.</P>
                        </div>
                        <form onSubmit={signup}>
                            <div className="mb-4 text-center">
                                <span>Code has been sent to {accountType === "individual" ? phone : "your email."}</span>
                                <div style={{
                                    display: "flex",
                                    gap: ".5rem",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    {[...Array(6)].map((_, index) => (
                                        <Fragment key={index}>
                                            <input
                                                required
                                                type="text"
                                                placeholder='X'
                                                maxLength={1}
                                                ref={(ref) => inputRefs.current[index] = ref}
                                                value={inputValues[index]}
                                                onChange={(e) => handleKeyUp(index, e)}
                                                style={{
                                                    height: "40px",
                                                    width: "40px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    fontSize: "20px",
                                                    padding: 0,
                                                    textAlign: "center",
                                                    margin: "10px 0",
                                                    border: "1px solid rgba(128,128,128,.5)",
                                                    outline: "none",
                                                    borderRadius: "5px"
                                                }}
                                            />
                                            {index !== 5 && <span>-</span>}
                                        </Fragment>
                                    ))}
                                </div>
                                <span>
                                    {
                                        resendTimer > 0
                                            ?
                                            `Resend will be available in ${resendTimer} seconds.`
                                            :
                                            <>
                                                Didn't receive code yet? <span style={{ fontWeight: 700, cursor: "pointer" }} onClick={_ => setResendTimer(90)}>Resend</span>
                                            </>
                                    }
                                </span>
                            </div>
                            <FormGroup>
                                <Btn attrBtn={{
                                    color: "primary", className: "w-100", type: "submit", style: {
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none"
                                    }, disabled: inputValues.some(item => item === "")
                                }}>Proceed To Login</Btn>
                            </FormGroup>
                        </form>
                    </>
                }
                <p className="text-center">Already have an account?
                    <Link to={"/login"} onClick={() => silf(true)} style={{
                        color: "var(--theme-default)",
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginLeft: ".3rem"
                    }}>SIGN IN</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupForm;