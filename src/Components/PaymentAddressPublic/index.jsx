import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TopRight from '../topRight'
import PaymentAddressComponent from './PaymentAddressComponent'
import { Card, CardBody, CardText, Modal, ModalBody } from 'reactstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styles from "./styles/index.module.css"
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useContext } from 'react'
import { UserContext } from '../../Context/UserContext'
import { ChevronLeft } from 'react-feather'
import Success from '../AddFunds/ResponseModals/Success'
import Error from '../AddFunds/ResponseModals/Error'
import Abort from '../AddFunds/ResponseModals/Abort'
import Receipt from '../PaymentsNewer/InternationalFlow/Receipt'
import FailedTransaction from '../PaymentsNewer/InternationalFlow/FailedTransaction'
import InstaPayLoader from '../Loader'
import NotFound from '../NotFound'

const PaymentAddressPublic = () => {
    const { t } = useTranslation()
    const { user_name } = useParams()
    const [userDetails, setUserDetails] = useState(null)
    const { userDetails: currentUser, verifyToken } = useContext(UserContext)
    const [loading, setLoading] = useState(true)
    const [userVideos, setUserVideos] = useState([])

    useEffect(() => {

        const getVideos = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-documents/${user_name}/0/0/address`)
                const dec = decryptData(res.data.data)
                console.log(dec)
                setUserVideos(dec.result)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
            }
        }

        const getUserDetails = () => {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-details/${user_name}`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserDetails(decrypted?.userProfileInfo)
                    getVideos()
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    // console.log(decrypted)
                })

                .finally(() => setLoading(false))
        }

        if (user_name) {
            getUserDetails()
        }

    }, [user_name])

    // useEffect(() => {
    //     const token = localStorage.getItem("token")
    //     if (userDetails?.first_name && (token ? currentUser?._id : true)) {
    //         setLoading(false)
    //     }
    // }, [userDetails, currentUser])

    const [currenctModal, setCurrentModal] = useState("")
    useEffect(() => {
        const { pathname } = window.location;
        if (pathname.includes("success")) {
            setCurrentModal("success")
        }
        if (pathname.includes("failed") || pathname.includes("error")) {
            setCurrentModal("error")
        }
        if (pathname.includes("aborted")) {
            setCurrentModal("abort")
        }
    }, [])

    const navigate = useNavigate()
    return (
        <>
            {
                currenctModal === "success"
                &&
                <Modal style={{ width: "96vw", maxWidth: "1200px" }} isOpen={currenctModal === "success"}>
                    <ModalBody style={{ padding: 0 }}>
                        <Receipt
                            data={{
                                beneficiary: {
                                    first_name: userDetails?.first_name,
                                    last_name: userDetails?.last_name,
                                }
                            }}
                            backHandler={() => {
                                setCurrentModal("")
                                navigate(`/pay/${user_name}`)
                            }}
                            showBack={true}
                            showTrxBtn={false}
                        />
                    </ModalBody>
                </Modal>
            }
            {
                currenctModal === "error"
                &&
                <Modal style={{ width: "96vw", maxWidth: "1200px" }} isOpen={currenctModal === "error"}>
                    <ModalBody style={{ padding: 0 }}>
                        <FailedTransaction
                            showBack={true}
                            backHandler={() => {
                                setCurrentModal("")
                                navigate(`/pay/${user_name}`)
                            }}
                        />
                    </ModalBody>
                </Modal>
            }
            {
                currenctModal === "abort"
                &&
                <Modal style={{ width: "96vw", maxWidth: "1200px" }} isOpen={currenctModal === "abort"}>
                    <ModalBody style={{ padding: 0 }}>
                        <FailedTransaction
                            showBack={true}
                            backHandler={() => {
                                setCurrentModal("")
                                navigate(`/pay/${user_name}`)
                            }}
                        />
                    </ModalBody>
                </Modal>

            }
            {
                window.innerWidth > 1000
                    ?
                    <div style={{ padding: 0 }} className={styles.container}>
                        <div className={styles.overlay} />
                        <div style={{ position: "relative", zIndex: 100, display: "none", flexDirection: "column", justifyContent: "space-between", height: "80vh" }}>
                            {/* <div className={styles.go_back} onClick={() => window.history.back()}>
                                <ChevronLeft size={18} color='white' />
                                <span>
                                    {t("Go back (Cancel Payment)")}
                                </span>
                            </div> */}
                            {/* <Link to={"/"}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="191" height="54" viewBox="0 0 191 54" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M35.761 18.1588C35.761 18.7527 35.7317 19.3407 35.6751 19.9209C35.6751 19.9248 35.6751 19.9287 35.6731 19.9326C35.6594 20.0752 35.6438 20.2159 35.6262 20.3565C35.6086 20.503 35.5891 20.6476 35.5676 20.7922C35.5461 20.9367 35.5227 21.0793 35.4973 21.2239C35.4719 21.3665 35.4445 21.5111 35.4172 21.6537C35.3723 21.8764 35.3234 22.0991 35.2707 22.3198C35.2316 22.4839 35.1867 22.646 35.1437 22.8082C35.13 22.859 35.1164 22.9098 35.1027 22.9625C35.0499 23.152 34.9933 23.3415 34.9327 23.531C34.9288 23.5427 34.9249 23.5544 34.921 23.5681C32.6315 30.7863 25.8801 36.0198 17.9 36.0198V53.7012L8.97053 45.0294L0.0390625 35.9905V17.9068H17.9L0.0703187 0.327154H16.8881C17.2241 0.307619 17.5601 0.297852 17.9 0.297852C25.8743 0.297852 32.6237 5.5235 34.9171 12.7378C34.9249 12.7593 34.9308 12.7808 34.9386 12.8023C34.9952 12.984 35.0499 13.1656 35.1007 13.3493C35.1183 13.4079 35.132 13.4665 35.1476 13.527C35.1906 13.6814 35.2316 13.8377 35.2687 13.9959C35.3234 14.2166 35.3723 14.4393 35.4172 14.664C35.4445 14.8066 35.4719 14.9512 35.4973 15.0938C35.5227 15.2383 35.5461 15.3809 35.5676 15.5255C35.5891 15.67 35.6086 15.8146 35.6262 15.9611C35.6438 16.1018 35.6594 16.2424 35.6731 16.385C35.6751 16.3889 35.6751 16.3928 35.6751 16.3968C35.7317 16.9769 35.761 17.565 35.761 18.1588Z" fill="white" />
                                    <path d="M48.9844 36.4491H53.384V12.1218H48.9844V36.4491Z" fill="white" />
                                    <path d="M56.7054 36.4491H60.8462V27.6129C60.8462 23.62 63.1384 21.4387 66.7616 21.4387C70.0521 21.4387 71.6788 23.0654 71.6788 25.9492V36.4491H75.8196V25.0249C75.8196 20.5144 72.9728 17.8894 68.3514 17.8894C64.0997 17.8894 61.7335 19.7749 60.7353 23.0654H60.6983L60.8462 18.1852H56.7054V36.4491Z" fill="white" />
                                    <path d="M86.4683 36.7449C92.3098 36.7449 95.4154 34.5635 95.4154 30.8664C95.4154 29.3875 94.713 27.9826 93.4929 27.3171C92.1989 26.5777 90.72 26.3189 88.132 26.0601C85.9137 25.8383 84.1761 25.6534 83.2887 25.3576C82.2166 24.9879 82.0317 24.2485 82.0317 23.4721C82.0317 21.9193 83.6585 20.8841 86.5422 20.8841C89.5739 20.8841 90.8679 22.0302 90.9049 24.3964H94.639C94.639 20.2556 92.1249 17.8894 86.4313 17.8894C81.4771 17.8894 77.9279 20.1077 77.9279 23.7679C77.9279 25.1728 78.5194 26.5037 79.5177 27.2432C80.6268 28.0566 82.5493 28.4263 85.3961 28.6851C87.4296 28.8699 89.1672 29.0548 90.0545 29.3875C91.0158 29.7203 91.2746 30.3488 91.2746 31.0513C91.2746 32.715 89.7957 33.7502 86.4313 33.7502C82.8821 33.7502 81.662 32.4562 81.662 30.3488H77.9279C77.9279 33.935 80.1831 36.7449 86.4683 36.7449Z" fill="white" />
                                    <path d="M105.83 36.6709C107.346 36.6709 108.603 36.4121 109.157 36.2273V32.9368C108.64 33.0847 107.457 33.2695 106.421 33.2695C103.907 33.2695 103.02 32.0865 103.02 29.7203V21.5496H109.305V18.1852H103.02V14.0443H99.5816L99.3968 16.7802C99.2859 17.8154 99.0271 18.1852 98.3246 18.1852H95.9954V21.5496H98.8792V29.9421C98.8792 33.972 100.839 36.6709 105.83 36.6709Z" fill="white" />
                                    <path d="M117.241 36.7449C121.271 36.7449 123.452 35.1181 124.044 32.4192H124.081C124.081 33.8981 123.97 35.5618 123.896 36.4491H128.037V25.3207C128.037 20.5144 124.783 17.8894 119.237 17.8894C114.025 17.8894 110.845 20.0707 110.845 23.7309C110.845 24.0636 110.882 24.5443 110.919 24.8031H114.727C114.69 24.5073 114.69 24.2115 114.69 24.1006C114.69 22.0672 116.28 20.995 119.09 20.995C122.306 20.995 123.896 22.2151 123.896 24.9509V26.2449H117.13C112.25 26.2449 110.29 28.4263 110.29 31.1991C110.29 34.7484 113.063 36.7449 117.241 36.7449ZM118.091 33.6393C115.577 33.6393 114.098 32.678 114.098 31.0143C114.098 29.5724 115.134 28.759 117.5 28.759H123.896V29.0918C123.896 31.9016 121.678 33.6393 118.091 33.6393Z" fill="white" />
                                    <path d="M131.003 36.4491H135.44V28.9069H141.614C147.456 28.9069 150.635 25.8752 150.635 20.5883C150.635 15.1535 147.086 12.1218 141.06 12.1218H131.003V36.4491ZM135.44 25.7643V15.819H140.912C144.461 15.819 146.421 17.5936 146.421 20.8101C146.421 24.1376 144.572 25.7643 141.355 25.7643H135.44Z" fill="white" />
                                    <path d="M159.243 36.7449C163.273 36.7449 165.454 35.1181 166.045 32.4192H166.082C166.082 33.8981 165.972 35.5618 165.898 36.4491H170.038V25.3207C170.038 20.5144 166.785 17.8894 161.239 17.8894C156.026 17.8894 152.847 20.0707 152.847 23.7309C152.847 24.0636 152.884 24.5443 152.921 24.8031H156.729C156.692 24.5073 156.692 24.2115 156.692 24.1006C156.692 22.0672 158.281 20.995 161.091 20.995C164.308 20.995 165.898 22.2151 165.898 24.9509V26.2449H159.132C154.252 26.2449 152.292 28.4263 152.292 31.1991C152.292 34.7484 155.065 36.7449 159.243 36.7449ZM160.093 33.6393C157.579 33.6393 156.1 32.678 156.1 31.0143C156.1 29.5724 157.135 28.759 159.502 28.759H165.898V29.0918C165.898 31.9016 163.679 33.6393 160.093 33.6393Z" fill="white" />
                                    <path d="M175.876 44.1761C179.499 44.1761 181.274 42.2906 183.307 36.8188L190.258 18.1852H186.191L181.052 32.2713H180.978L175.174 18.1852H170.404L178.316 36.4491H179.315C177.947 39.8505 177.059 40.8117 175.137 40.8117C174.212 40.8117 173.362 40.5899 172.844 40.442V43.6955C173.362 43.8804 174.471 44.1761 175.876 44.1761Z" fill="white" />
                                </svg>
                            </Link> */}
                        </div>
                        {
                            loading
                                ?
                                <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "100vw" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                currentUser
                                    ?
                                    (
                                        currentUser?.level?.payment_address?.send
                                            ?
                                            (
                                                userDetails
                                                    ?
                                                    <PaymentAddressComponent userVideos={userVideos} userDetails={userDetails} />
                                                    :
                                                    <NotFound type='Page' />
                                                // <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                                //     <CardBody>
                                                //         <CardText>Page Unavailable.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                                //     </CardBody>
                                                // </Card>
                                            )
                                            :
                                            <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                                <CardBody>
                                                    <CardText>Sending to a payment address is not available on this level.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                                </CardBody>
                                            </Card>
                                    )
                                    :
                                    (
                                        userDetails
                                            ?
                                            <PaymentAddressComponent userVideos={userVideos} userDetails={userDetails} />
                                            :
                                            <NotFound type='Page' />
                                        // <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                        //     <CardBody>
                                        //         <CardText>Page Unavailable.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                        //     </CardBody>
                                        // </Card>
                                    )
                        }
                    </div>
                    :
                    <div className={styles.mobile}>
                        {
                            loading
                                ?
                                <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "100vw" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                currentUser
                                    ?
                                    (
                                        currentUser?.level?.payment_address?.send
                                            ?
                                            (
                                                userDetails
                                                    ?
                                                    <>
                                                        {/* <div className={styles.go_back} style={{marginBottom: "12px"}} onClick={() => window.history.back()}>
                                                            <ChevronLeft size={18} color='white' />
                                                            <span>
                                                                {t("Go back (Cancel Payment)")}
                                                            </span>
                                                        </div> */}

                                                        <PaymentAddressComponent userVideos={userVideos} userDetails={userDetails} />
                                                    </>
                                                    :
                                                    <NotFound type='Page' />
                                                // <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                                //     <CardBody>
                                                //         <CardText>Page Unavailable.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                                //     </CardBody>
                                                // </Card>
                                            )
                                            :
                                            <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                                <CardBody>
                                                    <CardText>Sending to a payment address is not available on this level.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                                </CardBody>
                                            </Card>
                                    )
                                    :
                                    (
                                        userDetails
                                            ?
                                            <PaymentAddressComponent userVideos={userVideos} userDetails={userDetails} />
                                            :
                                            <NotFound type='Page' />
                                        // <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                        //     <CardBody>
                                        //         <CardText>Page Unavailable.<Link onClick={verifyToken} to={"/"} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Home.</Link></CardText>
                                        //     </CardBody>
                                        // </Card>
                                    )
                        }
                    </div>
            }
        </>
    )
}

export default PaymentAddressPublic