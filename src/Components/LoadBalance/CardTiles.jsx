import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { FaCreditCard, FaMoneyCheckAlt, FaPaypal, FaMobileAlt, FaBitcoin, FaExchangeAlt, FaGooglePay, FaApplePay } from 'react-icons/fa';
import "./tiles.css"

const CardTiles = ({ ssi, scf, setFormHeading }) => {
    function toggleAfterElement(tile) {
        tile.classList.toggle('active_tile');
        if (tile.classList.contains('active_tile')) {
            setTimeout(function () {
                tile.classList.remove('active_tile');
            }, 2000);
        }
    }
    return (
        <Card className='tile__cont'>
            <CardHeader>
                <h5>Please Select A Payment Method</h5>
            </CardHeader>
            <CardBody className='body__card'>
                <div className="payment-tile" onClick={() => ssi(true)}>
                    <FaCreditCard className="payment-icon" />
                    <span>Credit/Debit Card</span>
                </div>
                <div className="payment-tile" onClick={() => {
                    scf("bd")
                    setFormHeading("Bank Transfer")
                }}>
                    <FaMoneyCheckAlt className="payment-icon" />
                    <span>Bank Deposit</span>
                </div>
                <div className="payment-tile" onClick={() => ssi(true)}>
                    <FaPaypal className="payment-icon" />
                    <span>Paypal</span>
                </div>
                <div className="payment-tile blurred_tile" onClick={(e) => toggleAfterElement(e.target)}>
                    <FaMobileAlt className="payment-icon" />
                    <span className='text-center'>Mobile Wallet/Mobile Money</span>
                </div>
                <div className="payment-tile" onClick={() => {
                    scf("cw")
                    setFormHeading("Recharge By Crypto Currency")
                }}>
                    <FaBitcoin className="payment-icon" />
                    <span>Crypto Wallet</span>
                </div>
                {/* <div className="payment-tile">
                    <FaExchangeAlt className="payment-icon" />
                    <span>Card To Card</span>
                </div> */}
                <div className="payment-tile" onClick={() => ssi(true)}>
                    <FaGooglePay className="payment-icon" />
                    <span>Google Pay</span>
                </div>
                <div className="payment-tile" onClick={() => ssi(true)}>
                    <FaApplePay className="payment-icon" />
                    <span>Apple Pay</span>
                </div>
            </CardBody>
        </Card>
    )
}

export default CardTiles;