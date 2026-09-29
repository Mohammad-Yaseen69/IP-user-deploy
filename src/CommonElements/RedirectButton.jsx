import { useTranslation } from 'react-i18next';

const RedirectButton = ({ platform }) => {
    const {t} = useTranslation()
    const handleRedirect = () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (platform === 'instagram') {
            // The handle differs per environment — a test build must send the
            // user back to the account they were actually chatting with, not to
            // the production one.
            const handle = import.meta.env.VITE_INSTAGRAM_HANDLE || 'Instapay_swiss';
            const chatLink = `https://ig.me/m/${handle}`;
            const androidIntent = `intent://ig.me/m/${handle}#Intent;scheme=https;package=com.instagram.android;end`;
            const iosScheme = `instagram://user?username=${handle.toLowerCase()}`;

            if (/android/i.test(userAgent)) {
                window.location.href = androidIntent;
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                const now = Date.now();
                window.location.href = iosScheme;

                setTimeout(() => {
                    if (Date.now() - now < 2000) {
                        window.location.href = chatLink;
                    }
                }, 1500);
            } else {
                window.location.href = chatLink;
            }
        }

        if (platform === 'telegram') {
            const telegramLink = 'https://t.me/Instapay_swiss_bot';
            const tgPackage = 'org.telegram.messenger';

            if (/android/i.test(userAgent)) {
                const intentUrl = `intent://t.me/Instapay_swiss_bot#Intent;scheme=https;package=${tgPackage};end`;
                window.location.href = intentUrl;
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                const iosScheme = 'tg://resolve?domain=Instapay_swiss_bot';
                const now = Date.now();
                window.location.href = iosScheme;

                setTimeout(() => {
                    if (Date.now() - now < 2000) {
                        window.location.href = telegramLink;
                    }
                }, 1500);
            } else {
                window.location.href = telegramLink;
            }
        }
    };

    return (
        <button
            onClick={handleRedirect}
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
                textDecoration: "none",
                width: "100%",
            }}
        >
            {platform === "telegram" ? t("Go Back to {{platform}}",{platform: "Telegram"}) : t("Go Back to {{platform}}",{platform: "Instagram"})}
        </button>
    );
};

export default RedirectButton;