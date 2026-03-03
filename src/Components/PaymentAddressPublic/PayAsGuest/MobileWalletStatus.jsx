import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SocketsService from '../../../Services/Socket';
import styles from './styles/index.module.css';
import failSvg from '../../QrQuickerPay/faile.svg';
import clockSvg from '../PayWithCrypto/clock.svg';
import successSvg from '../../QrQuickerPay/success.svg';

const MobileWalletStatus = ({ token, transactionId, toggle }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState('PENDING'); // PENDING, PROCESSING, COMPLETED, FAILED

    const socketConfig = useMemo(() => ({
        url: import.meta.env.VITE_IP_DEV_API,
        transports: ["websocket", "polling", "flashsocket"],
    }), []);

    const socketsService = useMemo(() => new SocketsService(socketConfig, () => { }), [socketConfig]);

    useEffect(() => {
        if (transactionId && token) {
            socketsService.connect();
            console.log(transactionId, token)
            socketsService.connectToServer(null, true, transactionId, token);

            socketsService.socket.on("txn:update", (data) => {
                console.log("MobileWalletStatus: txn:update", data);
                if (data.status) {
                    setStatus(data.status);
                }
            });

            socketsService.socket.on("txn:subscribed", (data) => {
                console.log("MobileWalletStatus: txn:subscribed", data);
            });

            socketsService.socket.on("txn:subscribeError", (data) => {
                console.error("MobileWalletStatus: txn:subscribeError", data);
            });

            return () => {
                socketsService.disconnect();
            };
        }
    }, [socketsService, transactionId, token]);

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

    return (
        <div className={styles.success_container}>
            <img src={content.icon} alt={status} className={styles.success_gif} style={{ width: '100px', height: '100px' }} />
            <h2>{content.title}</h2>
            <p>{content.message}</p>
            <button className={styles.close_btn} onClick={toggle}>
                {t('Close')}
            </button>
        </div>
    );
};

export default MobileWalletStatus;
