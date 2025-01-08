import React from 'react'
import { useLocation } from 'react-router'

const ShowLocation = () => {
    const location = useLocation()
    const qp = new URLSearchParams(location.search)
    const longitude = qp.get("longitude")
    const latitude = qp.get("latitude")
    console.log(longitude, latitude)
    return (
        <iframe
            src={`//maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            style={{
                height: "100vh",
                width: "100vw"
            }}
        ></iframe>
    )
}

export default ShowLocation