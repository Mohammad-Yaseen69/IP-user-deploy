import React, { useEffect, useState } from 'react'
import { MapPin, X } from 'react-feather'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'

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
                if (error.code === error.PERMISSION_DENIED || error.code == 1) {
                    setLocationDenied(true);
                }
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
        <Modal isOpen={isOpen}>
            {
                locationDenied
                &&
                <ModalHeader toggle={cancelPayment}></ModalHeader>
            }
            <ModalBody
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "250ms"
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
                                    src={`//maps.google.com/maps?q=${coords?.latitude},${coords?.longitude}&z=15&output=embed`}
                                    style={{
                                        height: "300px",
                                        width: "100%",
                                        maxWidth: "550px",
                                    }}
                                ></iframe>
                                <h5 style={{ marginBottom: "1rem", marginTop: "1rem", fontSize: "1.5rem", fontWeight: "700" }}>Is this your Location?</h5>
                                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                                    {/* <Button style={{ borderRadius: "9px" }} color='primary' onClick={handleAllowLocation}>No, Get Location Again</Button> */}
                                    <Button disabled={disabled} style={{ borderRadius: "9px" }} color='primary' onClick={toggle}>Yes</Button>
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
            </ModalBody>
        </Modal>
    )
}

export default RequestLocation