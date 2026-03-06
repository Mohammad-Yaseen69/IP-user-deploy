import { useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import SocketsService from '../../../Services/Socket';
import failSvg from '../../QrQuickerPay/faile.svg';
import clockSvg from '../PayWithCrypto/clock.svg';
import successSvg from '../../QrQuickerPay/success.svg';
import { UserContext } from '../../../Context/UserContext';

const MobileWalletStatus = ({
    token,
    transactionId,
    toggle = null,
    buttonLabel = null,
    inGuestPay = true,
    containerStyle = {},
}) => {
    const { t } = useTranslation();
    const { userDetails } = useContext(UserContext)
    const [status, setStatus] = useState('PENDING'); // PENDING, PROCESSING, COMPLETED, FAILED

    const socketConfig = useMemo(() => ({
        url: import.meta.env.VITE_IP_DEV_API,
        transports: ["websocket", "polling", "flashsocket"],
    }), []);

    const socketsService = useMemo(() => new SocketsService(socketConfig, () => { }), [socketConfig]);

    console.log(transactionId)
    useEffect(() => {
        if (transactionId) {
            if (inGuestPay && token) {
                socketsService.connect();
                console.log('[MobileWalletStatus] subscribing:', transactionId, token);
                socketsService.connectToServer(null, true, transactionId, token);
            } else {
                socketsService.connect();
                socketsService.connectToServer(userDetails?._id);
            }

            const eventName = inGuestPay ? 'txn:update' : 'onafriq:transaction';

            if (inGuestPay) {
                socketsService.socket.on(eventName, (data) => {
                    console.log(`[MobileWalletStatus] ${eventName}=`, data);
                    if (data.status && transactionId === data?.transactionId) {
                        setStatus(data.status);
                    }
                });
            } else {
                socketsService.socket.on("onafriq:transaction", (data) => {
                    console.log("onafriq:transaction", data);

                    if (data?.status && transactionId === data?.transactionId) {
                        setStatus(data.status);
                    }
                });
            }



            socketsService.socket.on('txn:subscribed', (data) => {
                console.log('[MobileWalletStatus] txn:subscribed', data);
            });

            socketsService.socket.on('txn:subscribeError', (data) => {
                console.error('[MobileWalletStatus] txn:subscribeError', data);
            });

            return () => {
                if (inGuestPay) {
                    socketsService.disconnect();
                } else {
                    socketsService.socket.off(eventName);
                }
            };
        }
    }, [socketsService, transactionId, token, inGuestPay]);

    const renderContent = () => {
        switch (status) {
            case 'COMPLETED':
            case 'SUCCESS':
                return {
                    icon: successSvg,
                    title: t('Payment Successful'),
                    message: t('Your transaction has been completed successfully.'),
                };
            case 'FAILED':
                return {
                    icon: failSvg,
                    title: t('Payment Failed'),
                    message: t('Unfortunately, your transaction could not be processed. Please try again.'),
                };
            case 'PROCESSING':
                return {
                    icon: clockSvg,
                    title: t('Payment Processing'),
                    message: t('Your payment is being processed. Please wait a moment.'),
                };
            case 'PENDING':
            default:
                return {
                    icon: clockSvg,
                    title: t('Payment Initiated'),
                    message: t('Please open your mobile money app and approve the payment notification you have received to complete and validate this transaction.'),
                };
        }
    };

    const content = renderContent();
    const label = buttonLabel ?? t('Close');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            padding: '2rem',
            gap: '1.5rem',
            background: 'white',
            borderRadius: '16px',
            minHeight: '400px',
            ...containerStyle,
        }}>
            <img
                src={content.icon}
                alt={status}
                style={{ width: '100px', height: '100px', objectFit: 'contain' }}
            />
            <h2 style={{
                color: '#000',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '1.8rem',
                fontWeight: 800,
                margin: 0,
            }}>
                {content.title}
            </h2>
            <p style={{
                color: '#848484',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                lineHeight: '160%',
                maxWidth: '400px',
                margin: 0,
            }}>
                {content.message}
            </p>
            {toggle && (
                <button
                    onClick={toggle}
                    style={{
                        all: 'unset',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        background: status === 'FAILED'
                            ? 'linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)'
                            : '#5926F0',
                        padding: '0.8rem 2.5rem',
                        color: '#FFF',
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '1rem',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        minWidth: '160px',
                        textAlign: 'center',
                    }}
                >
                    {label}
                </button>
            )}
        </div>
    );
};

export default MobileWalletStatus;
