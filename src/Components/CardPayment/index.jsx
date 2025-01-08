import React from 'react'
import { useParams } from 'react-router'

const CardPayment = () => {
    const { status, token } = useParams()

    return (
        <div>{status}{token}</div>
    )
}

export default CardPayment