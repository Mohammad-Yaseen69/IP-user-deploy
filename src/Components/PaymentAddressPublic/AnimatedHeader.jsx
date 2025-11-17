import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

const AnimatedHeader = ({ mobileUI }) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);

    const headerContents = [
        {
            heading: "Get paid instantly, sell, and stream — all from one link.",
            para: "Your socials are now your bank—Receive money straight to your bank, wallet, crypto, or cash pick-up in 180+ countries"
        },
        {
            heading: "Your Social Payment Address",
            para: "No middlemen, no delays. Instantly receive funds to your bank, mobile wallet, crypto, or cash pick-up in 180+ countries."
        },
        {
            heading: "Turn followers into income",
            para: "With your InstaPay Address, receive instant payments worldwide—direct to bank, wallet, crypto, or cash pick-up."
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % headerContents.length);
        }, 8000);

        return () => clearInterval(interval); // cleanup
    }, []);
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "fit-content",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: mobileUI ? "center" : "flex-start"
            }}
        >
            <AnimatePresence exitBeforeEnter >
                <motion.div
                    key={index}
                    style={mobileUI && {
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        padding: "0px 30px"
                    }}
                >
                    <motion.span
                        initial={{ opacity: .5, filter: "blur(3px)", }}
                        animate={{ opacity: 1, filter: "blur(0px)", }}
                        exit={{ opacity: .5, filter: "blur(3px)", }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                            color: "#5926F0",
                            fontWeight: 700,
                            fontSize: "20px"
                        }}
                    >
                        {t(headerContents[index].heading)}
                    </motion.span>
                    <motion.p
                        initial={{ opacity: .5, filter: "blur(3px)", }}
                        animate={{ opacity: 1, filter: "blur(0px)", }}
                        exit={{ opacity: .5, filter: "blur(3px)", }}
                        transition={{ duration: 0.6, ease: "linear" }}
                        style={{
                            color: "#777",
                            fontWeight: 600,
                            marginBottom: "0px",
                            fontSize: "14px",
                            textAlign: mobileUI && "center",
                            width: !mobileUI && "75%"
                        }}
                    >
                        {t(headerContents[index].para)}
                    </motion.p>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default AnimatedHeader
