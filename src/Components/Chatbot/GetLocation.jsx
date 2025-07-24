
import React, { useEffect, useState } from 'react'
// import RequestLocation from '../RequestLocation'
import { CustomDatePickerContainer, SuccessImage } from './schedule-calendar'
import { useLocation } from 'react-router'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { Button } from 'reactstrap'
import { MapPin, X } from 'react-feather'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const GetLocation = () => {
    const [coords, setCoords] = useState({})
    const [loading, setLoading] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const location = useLocation()
    const qp = new URLSearchParams(location.search)
    const recipient_id = qp.get("recipient_id")
    const platform = qp.get("platform")

    const sendLocationToBot = async (accept) => {
        setLoading(true)
        try {
            const payload = {
                lat: coords?.latitude ?? "",
                long: coords?.longitude ?? "",
                recipientId: recipient_id,
                accept
            }
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-location-bot${platform === "telegram" ? "-telegram" : ""}`, { data: encryptData(payload) })
            const dec = decryptData(res.data.data)
            console.log(dec)
        }
        catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
        }
        finally {
            setLoading(false)
            setIsDone(true)
        }
    }

    const cancelPayment = () => {
        sendLocationToBot(false)
    }
    const toggle = () => {
        sendLocationToBot(true)
    }
    return (
        isDone
            ?
            <CustomDatePickerContainer>
                <DotLottieReact
                    src="https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
                    backgroundColor="transparent"
                    speed="1"
                    style={{ width: "225px", height: "225px" }}
                    playMode="normal"
                    loop={true}
                    autoplay={true}
                />
                <h5 style={{ padding: "1rem", textAlign: "center" }}>You can now close this webpage and go back to {platform === "telegram" ? "Telegram" : "Instagram"}.</h5>

                <a
                    href={platform === "telegram" ? "https://t.me/Instapay_swiss_bot" : "https://ig.me/m/Instapay_swiss"}
                    style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        borderRadius: "9px",
                        backgroundColor: "#5926f0fe",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        textAlign: "center",
                        textDecoration: "none"
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {platform === "telegram" ? "Go Back to Telegram" : "Go Back to Instagram"}
                </a>
            </CustomDatePickerContainer>
            :
            <RequestLocation
                disabled={loading}
                cancelPayment={cancelPayment}
                coords={coords}
                setCoords={setCoords}
                isOpen={true}
                toggle={toggle}
            />
    )
}

export default GetLocation

const RequestLocation = ({ coords, setCoords, isOpen, toggle, cancelPayment, disabled = false }) => {
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);

    const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationAllowed(true);
                setLocationDenied(false);
            },
            (error) => {
                console.error(error);
                // if (error.code === error.PERMISSION_DENIED) {
                setLocationDenied(true);
                // }
                setLocationAllowed(false);
            },
            {
                timeout: 10000,
            }
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);

    const handleAllowLocation = () => {
        // if (locationDenied) {
        //     alert("Please enable location access in your browser settings to allow InstaPay to get your location.");
        // } else {
        requestLocation();
        // }
    };

    return (
        <div
            style={{
                minHeight: window.innerWidth > 500 ? "100vh" : "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
                justifyContent: locationAllowed ? "flex-start" : "center",
                padding: locationAllowed ? "0" : "2rem"
            }}
        >
            {
                locationDenied
                    ?
                    <>
                        <div style={{
                            height: "100px",
                            width: "100px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "100px",
                            background: "#ee3454"
                        }}>
                            <X
                                size={50}
                                color='white'
                            />
                        </div>
                        <h5 style={{ marginBottom: "1rem", marginTop: "1rem", fontSize: "1.5rem", fontWeight: "700", textAlign: "center" }}>Location Permission Denied</h5>
                        <p style={{ fontSize: '1rem', marginBottom: '1.5rem', textAlign: "center", marginBottom: "2.5rem" }}>
                            Follow the below Instructions to Enable Location Services in Your Browser After Denying Permission Previously.
                        </p>
                        <div style={{ marginBottom: '1.5rem', background: "#4444441e", width: "100%", padding: "1rem", borderRadius: ".5rem" }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Instructions to Open the Link in an External Browser.</h3>
                            <ul style={{ padding: 0, listStyleType: "initial", marginLeft: "1.2rem" }}>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Locate and click the three dots icon in the top-right corner of the interface. </li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>From the dropdown menu, select "Open with".</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Choose your preferred external browser from the available options.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Locate the website in the list or search for it.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>The link will open in the selected browser.</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: "#4444441e", width: "100%", padding: "1rem", borderRadius: ".5rem" }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1: Chrome Browser</h3>
                            <ul style={{ padding: 0, listStyleType: "initial", marginLeft: "1.2rem" }}>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Open the Chrome app.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tap the three-dot menu (top-right corner) and select Settings.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Scroll down to Site Settings {">"} Location.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Locate the website in the list or search for it.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tap the website and select Allow under Location Access.</li>
                            </ul>
                        </div>
                        <div style={{ marginBottom: '1.5rem', background: "#4444441e", width: "100%", padding: "1rem", borderRadius: ".5rem" }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2: Firefox Browser</h3>
                            <ul style={{ padding: 0, listStyleType: "initial", marginLeft: "1.2rem" }}>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Open the Firefox app.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tap the three-line menu (bottom-right corner) and go to Settings.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Select Privacy & Security {">"} Site Permissions {">"} Location.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Find the website in the list and set the permission to Allow.</li>
                            </ul>
                        </div>
                        <div style={{ marginBottom: '1.5rem', background: "#4444441e", width: "100%", padding: "1rem", borderRadius: ".5rem" }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3: Samsung Internet Browser</h3>
                            <ul style={{ padding: 0, listStyleType: "initial", marginLeft: "1.2rem" }}>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Open the Samsung Internet app.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tap the three-line menu (bottom-right corner) and select Settings.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Go to Sites and Downloads {">"} Site Permissions {">"} Location.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Find the website and change the permission to Allow.</li>
                            </ul>
                        </div>
                        <div style={{ marginBottom: '1.5rem', background: "#4444441e", width: "100%", padding: "1rem", borderRadius: ".5rem" }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>4: Safari Browser</h3>
                            <ul style={{ padding: 0, listStyleType: "initial", marginLeft: "1.2rem" }}>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Open the Settings app.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Scroll down and select Safari.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tap Location and set it to Ask Next Time or Allow While Using the App.</li>
                                <li style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Revisit the website, and when prompted, allow location access.</li>
                            </ul>
                        </div>
                        <p style={{ fontSize: '.8rem', }}>
                            <strong>Tip:</strong> If the website does not appear in the browser settings, clear your browser’s cache or history and try again.
                        </p>
                    </>
                    :
                    locationAllowed
                        ?
                        <>
                            <iframe
                                title='google map'
                                src={`//maps.google.com/maps?q=${coords?.latitude},${coords?.longitude}&z=15&output=embed`}
                                style={{
                                    width: "100%",
                                    height: window.innerWidth > 500 ? "100vh" : "80vh",
                                }}
                            ></iframe>
                            {/* <h5 style={{ marginBottom: "1rem", marginTop: "1rem", fontSize: "1.5rem", fontWeight: "700" }}>Is this your Location?</h5> */}
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {/* <Button style={{ borderRadius: "9px" }} color='primary' onClick={handleAllowLocation}>No, Get Location Again</Button> */}
                                <Button disabled={disabled} style={{ borderRadius: "9px", fontSize: "1rem" }} color='primary' onClick={toggle}>Confirm</Button>
                            </div>
                        </>
                        :
                        <>
                            <div style={{
                                height: "140px",
                                width: "140px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "100px",
                                background: "#5926f0fe"
                            }}>
                                <MapPin
                                    size={80}
                                    color='white'
                                />
                            </div>
                            <h5 style={{ marginBottom: "1rem", marginTop: "1rem", fontSize: "1.5rem", fontWeight: "700", textAlign: "center" }}>Allow InstaPay to access your Location</h5>
                            <p style={{ marginBottom: ".2rem", fontSize: ".9rem", color: "#6a6a6a", fontWeight: 500, maxWidth: "70ch", textAlign: "center", whiteSpace: "balance" }}>
                                To send a payment request, please share your location—this helps us boost security and build trust for a smoother experience!
                            </p>

                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                                <Button disabled={disabled} style={{ borderRadius: "9px" }} color='danger' onClick={cancelPayment}>Decline</Button>
                                <Button disabled={disabled} style={{ borderRadius: "9px" }} color='primary' onClick={handleAllowLocation}>Share Location</Button>
                            </div>
                        </>
            }
        </div>
    )
}
