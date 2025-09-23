import { H4 } from '../../../AbstractElements';
import { Company, AboutMe, FirstName, LastName, Address, EmailAddress, PostalCode, Country, City } from '../../../Constant';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Row, Col, CardHeader, CardBody, CardFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import GradientButton from './GradientButton';
import { UserContext } from '../../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import SuccessModal from '../../AddBeneficiary/SuccessModal';
import CountryDropDown from '../../AddBeneficiary/CountryDropDown';
import { countries } from 'country-list-json';
import { ChevronDown, ChevronUp } from 'react-feather';
import CitiesDropDown from '../../CitiesDropDown';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';

const EditMyProfile = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation()
  const { userDetails, authHeader, setRefresh } = useContext(UserContext);
  const [company, setCompany] = useState('');
  const [username, setUsername] = useState(userDetails?.username);
  const [phone, setPhone] = useState(userDetails?.phone);
  const [email, setEmail] = useState(userDetails?.email);
  const [firstName, setFirstName] = useState(userDetails?.user?.first_name);
  const [lastName, setLastName] = useState(userDetails?.user?.last_name);
  const [gender, setGender] = useState(userDetails?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(userDetails?.date_of_birth ?? "");
  const [address, setAddress] = useState(userDetails?.address);
  const [city, setCity] = useState(userDetails?.city);
  const [postalCode, setPostalCode] = useState(userDetails?.postal_code);
  const [country, setCountry] = useState(userDetails?.country);
  const [aboutMe, setAboutMe] = useState(userDetails?.about_me);
  const [countryCode, setCountryCode] = useState("")
  const [countryIsoCode, setCountryIsoCode] = useState("")

  const [usernameValid, setUsernameValid] = useState(true)

  const [showSuccess, setShowSuccess] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)

  // Calculate the minimum and maximum allowed date values
  const currentDate = new Date();
  const minDate = new Date(currentDate.getFullYear() - 15, currentDate.getMonth(), currentDate.getDate());

  const handleDateChange = (e) => {
    const selected = new Date(e.target.value);

    if (selected <= minDate) {
      setDateOfBirth(e.target.value);
    } else {
      alert('Please select a date at least 15 years ago or earlier.');
    }
  };

  const checkUsername = () => {
    setUsernameValid(false)
    const data = {
      username
    }

    const encrypted = encryptData(data)

    axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/username-check`, {
      data: encrypted
    }, {
      headers: authHeader
    })
      .then(res => {
        const decrypted = decryptData(res.data.data)
        setUsernameValid(decrypted.status)
      })
      .catch(err => {
        const decrypted = decryptData(err.response.data.data)
        if (decrypted.message.toLowerCase().includes("already")) {
          setUsernameValid(decrypted.status)
        }
      })
  }
  // let debounceTimer;
  // useEffect(() => {
  //   clearTimeout(debounceTimer);

  //   debounceTimer = setTimeout(() => {
  //     if (username) {
  //       checkUsername();
  //     }
  //   }, 1000);

  //   return () => {
  //     clearTimeout(debounceTimer);
  //   };
  // }, [username]);

  useEffect(() => {
    setEmail(userDetails?.email)
    setPhone(userDetails?.phone)
    setFirstName(userDetails?.user?.first_name)
    setLastName(userDetails?.user?.last_name)
    setUsername(userDetails?.username)
    setAddress(userDetails?.address)
    setCity(userDetails?.city)
    setPostalCode(userDetails?.postal_code)
    setCountry(userDetails?.country)
    setAboutMe(userDetails?.about_me)
  }, [userDetails, isEditMode])


  const updateUsername = () => {
    if (username) {
      const data = {
        username
      }

      const encrypted = encryptData(data)

      axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-username/${userDetails?._id}`, {
        data: encrypted
      }, {
        headers: authHeader
      })
        .then(res => {
          const decrypted = decryptData(res.data.data)
          // console.log(decrypted)
        })
        .catch(err => {
          // console.log(err.response.data)
        })
    }
  }

  const editProfileHandler = (e) => {
    e.preventDefault()

    updateUsername()

    if (userDetails?.account_type === "individual") {
      const data = {
        first_name: firstName,
        last_name: lastName,
        address,
        city,
        country: country,
        postal_code: postalCode,
        about_me: aboutMe
      }
      const encrypted = encryptData(data)

      axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-individual/${userDetails?._id}`, {
        data: encrypted
      }, {
        headers: authHeader
      })
        .then(res => {
          const decrypted = decryptData(res.data.data)
          if (decrypted.status === true) {
            setShowSuccess(true)
            setIsEditMode(false)
            setRefresh(prev => prev + 1)
          }
        })
        .catch(err => {
          // console.log(err.response.data)
        })
    }
    if (userDetails?.account_type === "business") {
      const data = {
        company_name: company,
        address,
        city,
        country: country,
        postal_code: postalCode,
        about_me: aboutMe
      }

      const encrypted = encryptData(data)

      axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-business/${userDetails?._id}`, {
        data: encrypted
      }, {
        headers: authHeader
      })
        .then(res => {
          const decrypted = decryptData(res.data.data)
          if (decrypted.status === true) {
            setShowSuccess(true)
            setIsEditMode(false)
            setRefresh(prev => prev + 1)
          }
        })
        .catch(err => {
          // console.log(decryptData(err.response.data.data))
        })
    }
  }

  const toggleAccordion = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Fragment>
      <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} message={"Details Updated Successfully"} subMessage={"Profile Updated."} />
      <Form className="card" id='basic'>
        <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
          <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Basic Info")}</H4>
          <div className="card-options">
            {isCollapsed ? <ChevronDown /> : <ChevronUp />}
          </div>
        </CardHeader>
        <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
          <CardBody>
            <Row>
              {
                userDetails?.account_type === "business"
                &&
                <Col md="5">
                  <FormGroup className="mb-3">
                    <Label className="form-label">{t(Company)}</Label>
                    <input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
                  </FormGroup>
                </Col>
              }
              {
                userDetails?.account_type === "individual"
                &&
                <>
                  <Col sm="6" md="6">
                    <FormGroup>
                      <Label className="form-label">{t(FirstName)}</Label>
                      <input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </FormGroup>
                  </Col>
                  <Col sm="6" md="6">
                    <FormGroup>
                      <Label className="form-label">{t(LastName)}</Label>
                      <input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </FormGroup>
                  </Col>
                </>
              }
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t("Username")}</Label>
                  <input className="form-control" type="text" placeholder="Username" value={username} onChange={e => {
                    setUsername(e.target.value.toLowerCase())
                    checkUsername()
                  }} disabled={!isEditMode} readOnly={!isEditMode} style={{
                    borderColor: usernameValid ? "#eeeeee" : "red"
                  }} onBlur={checkUsername} />
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t("Gender")}</Label>
                  <Input type='select' value={gender} onChange={e => setGender(e.target.value)} disabled={!isEditMode} readOnly={!isEditMode}>
                    <option value="">--Select-Gender--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t("Date Of Birth")}</Label>
                  <Input
                    type="date"
                    id="exampleDate"
                    value={dateOfBirth}
                    onChange={handleDateChange}
                    max={minDate.toISOString().split('T')[0]}
                    disabled={!isEditMode} readOnly={!isEditMode}
                  />
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t(EmailAddress)}</Label>
                  <input className="form-control" type="email" placeholder="Email" value={email} onChange={e => e.target.value} readOnly={email} disabled={email} />
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t("Phone Number")}</Label>
                  {/* <input className="form-control" type="tel" placeholder="Phone Number" value={phone} onChange={e => e.target.value} readOnly={email} disabled={email} /> */}
                  <PhoneInput
                    placeholder="Enter Phone number"
                    value={phone}
                    onChange={(e) => e}
                    country={countryCode?.toLowerCase()}
                    inputProps={{
                      id: "mobile_number",
                      name: "mobile_number"
                    }}
                    inputStyle={{
                      width: "100%",
                      flex: 1,
                      minWidth: "250px",
                      padding: "22px 15px 22px 48px",
                      lineHeight: "1.5",
                      border: "1px solid #ced4da"
                    }}
                    readOnly={email} disabled={email}
                  />
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t(PostalCode)}</Label>
                  <Input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="number" placeholder="ZIP Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                </FormGroup>
              </Col>
              <Col sm="6" md="6">
                <FormGroup>
                  <Label className="form-label">{t(City)}</Label>
                  {/* <input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} /> */}
                  <CitiesDropDown country={country} userCity={city} setUserCity={setCity} disabled={!isEditMode} />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">{t(Country)}</Label>
                  {/* <Input type="select" name="select" className="form-control btn-square form-select" value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="Pakistan">Pakistan</option>
                </Input> */}
                  <CountryDropDown onSelect={(selectedCountry) => {
                    const filtered = countries.filter(item => item.name.toLowerCase() === selectedCountry.name.toLowerCase())[0]
                    setCountry(filtered.name)
                    setCountryCode(filtered?.code)
                    setCountryIsoCode(selectedCountry?.alpha3)
                  }} country={countryIsoCode} disabled={true} />
                </FormGroup>
              </Col>
              <Col md="12">
                <FormGroup>
                  <Label className="form-label">{t(Address)}</Label>
                  <input className="form-control" disabled={!isEditMode} readOnly={!isEditMode} type="text" placeholder="Home Address" value={address} onChange={e => setAddress(e.target.value)} />
                </FormGroup>
              </Col>
              <Col md="12">
                <div>
                  <Label className="form-label">{t(AboutMe)}</Label>
                  <Input type="textarea" disabled={!isEditMode} readOnly={!isEditMode} className="form-control" rows="5" placeholder="Enter About your description" value={aboutMe} onChange={e => setAboutMe(e.target.value)} />
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            {
              isEditMode
              &&
              <GradientButton value={t("Cancel")} size="m" attr={{
                onClick: () => {
                  setIsEditMode(false)
                  setUsernameValid(true)
                }
              }} />
            }
            {
              isEditMode
                ?
                <GradientButton value={t("Save")} size="m" attr={{ onClick: editProfileHandler, /*disabled: !firstName || !lastName || !email || !city || !country || !address || !postalCode || !aboutMe || aboutMe.length > 190 || !usernameValid*/ }} />
                :
                <GradientButton value={t("Edit")} size="m" attr={{ onClick: () => setIsEditMode(true) }} />
            }
          </CardFooter>
        </div>
      </Form>
    </Fragment>
  );
};

export default EditMyProfile;