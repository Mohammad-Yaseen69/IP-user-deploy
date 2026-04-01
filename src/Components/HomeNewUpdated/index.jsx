import { useContext, useEffect, useState, lazy } from "react";
import styles from "./styles/index.module.scss";
import cardsStyle from "./styles/CardsContainer.module.css";
import { useTranslation } from "react-i18next";
import { BsFillPlayFill } from "react-icons/bs";
import { ChevronRight } from "react-feather";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";

//  Lazy-loaded components
const BalanceComponent = lazy(() => import("./BalanceCard"));
const EarnMoneyBanner = lazy(() => import("./EarnMoneyBanner"));
const TransDetails = lazy(() => import("./TransDetails"));
const QuickLinksNew = lazy(() => import("./QuickLinksNew"));
const Stats = lazy(() => import("./Stats"));
const RecentTrans = lazy(() => import("./RecentTrans"));
const RightContainer = lazy(() => import("./RightContainer"));
const SearchComponent = lazy(() => import("./Search"));
const ReferalRewards = lazy(() => import("./ReferalRewards"));
const CryptoCard = lazy(() => import("./CryptoCard"));
const RecentBeneficiaries = lazy(() => import("./RecentBeneficiaries"));
const WalletsMobile = lazy(() => import("./WalletsMobile"));
const CurConversion = lazy(() => import("./CurConversion"));
const QuickLinksMobile = lazy(() => import("./QuickLinksMobile"));
const TopBar = lazy(() => import("../../Layout/TopBar"));
const BusinessModal = lazy(() => import("../BusinessModal"));
const OtherBalance = lazy(() => import("./OtherBalance"));

//  Static assets (normal imports)
import btc from "../PaymentsNewer/files/btc.png";
import eth from "../PaymentsNewer/files/eth.png";
import usdt from "../PaymentsNewer/files/usdt.png";
import crown from "./files/crown.svg";
import chat from "./files/chat.svg";


const HomeNewUpdated = () => {

    const [currenciesData, setCurrenciesData] = useState([
        {
            name: "Bitcoin",
            img: btc,
            value: "btc",
            color: "#f39900",
            graph_values: [13, 15, 25, 20, 30, 26, 24, 15, 16, 20],
            item_bg: "#FFE1B4",
            price: 0,
            text_color: "#ff9921",
            text_bg: "rgba(255, 153, 33, 0.20)",
            increment: "2.05%",
            inc_bg: "#91BE65",
            inc_color: "white"
        },
        {
            name: "Tether",
            img: usdt,
            value: "usdt",
            color: "#009393",
            graph_values: [15, 12, 13, 10, 12, 14, 16, 16, 8],
            item_bg: "#01E2E2",
            price: 0,
            text_color: "#009393",
            text_bg: "rgba(0, 147, 147, 0.22)",
            increment: "2.05%",
            inc_bg: "#fff",
            inc_color: "black"
        },
        {
            name: "Ethereum",
            img: eth,
            value: "eth",
            color: "#101010",
            graph_values: [8, 9, 16, 7, 20, 8, 12, 14],
            item_bg: "#ececec",
            price: 0,
            text_color: "#000",
            text_bg: "rgba(0,0,0,.2)",
            increment: "2.05%",
            inc_bg: "#FD0D1b",
            inc_color: "white"
        },
    ])

    useEffect(() => {
        const getCryptoRates = async () => {
            try {
                const symbols = encodeURIComponent(JSON.stringify(["BTCUSDT", "ETHUSDT"]))
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`)
                const data = await res.json()

                const btcPrice = data.find(i => i.symbol === "BTCUSDT")?.price || 0
                const ethPrice = data.find(i => i.symbol === "ETHUSDT")?.price || 0

                setCurrenciesData(prev => prev.map(currency => {
                    let price = currency.price;
                    if (currency.value === "btc") price = Number(btcPrice);
                    else if (currency.value === "eth") price = Number(ethPrice);
                    else if (currency.value === "usdt") price = 1.00;

                    return {
                        ...currency,
                        price: price,
                        increment: "0.00%", // Binance ticker/price doesn't provide 24h change
                    };
                }));
            } catch (error) {
                console.error("Error fetching crypto rates:", error);
            }
        }

        getCryptoRates()
    }, [])

    const { userDetails, profileCompletedPercentage, userWallets, croppedImages } = useContext(UserContext)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [selectedWallet, setSelectedWallet] = useState(null)

    const { t } = useTranslation()

    const [showBusinessModal, setShowBusinessModal] = useState(false)
    return (
        <>
            {
                window.innerWidth > 1000
                &&
                <div className={styles.container} onClick={() => {
                    if (profileCompletedPercentage < 100 && !showCompletionModal) {
                        setShowCompletionModal(true)
                    }
                }}>
                    <div className={styles.sub}>
                        <div className={styles.left}>
                            <div className={styles.card}>
                                <div className={styles.top}>
                                    <div className={styles.greet}>
                                        <h5>{t("Good Evening")}</h5>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: window.innerWidth > 1650 ? "1rem" : ".6rem"
                                        }}>
                                            <div style={{ padding: "1px", border: "3px solid #72C123", borderRadius: "50px" }}>
                                                {
                                                    userDetails?.profileImage?.url
                                                        ?
                                                        <img

                                                            src={croppedImages.profileDP || userDetails?.profileImage?.url} alt={userDetails?.user?.first_name} style={{
                                                                minWidth: window.innerWidth > 1650 ? "50px" : "40px",
                                                                minHeight: window.innerWidth > 1650 ? "50px" : "40px",
                                                                width: window.innerWidth > 1650 ? "50px" : "40px",
                                                                height: window.innerWidth > 1650 ? "50px" : "40px",
                                                                borderRadius: "25px",
                                                                objectFit: "cover"
                                                            }}
                                                            loading="lazy"
                                                        />
                                                        :
                                                        <div style={{
                                                            minWidth: window.innerWidth > 1650 ? "50px" : "40px",
                                                            minHeight: window.innerWidth > 1650 ? "50px" : "40px",
                                                            borderRadius: "25px",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                            color: "white",
                                                            fontSize: "1.4rem",
                                                            fontWeight: 800
                                                        }}>{
                                                                userDetails?.account_type?.toLowerCase() === "individual"
                                                                    ?
                                                                    userDetails?.user?.first_name?.[0]?.toUpperCase()
                                                                    :
                                                                    userDetails?.company?.company_name?.[0]?.toUpperCase()
                                                            }</div>
                                                }
                                            </div>
                                            <div>
                                                <h5 style={{ fontSize: window.innerWidth > 1650 ? "1.1rem" : ".8rem", fontWeight: "700", marginBottom: 0, whiteSpace: "nowrap", overflow: "hidden" }}>
                                                    {
                                                        userDetails?.account_type?.toLowerCase() === "individual"
                                                            ?
                                                            `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`?.split(" ")?.slice(0, 2)?.join(" ")
                                                            :
                                                            userDetails?.company?.company_name?.split(" ")?.slice(0, 2)?.join(" ")
                                                    }
                                                </h5>
                                                <p style={{ marginBottom: 0, fontSize: ".7rem", color: "#939393" }}>{userDetails?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.top_right}>
                                        <SearchComponent />
                                    </div>
                                </div>
                                <div className={styles.balance_currencies}>
                                    <div style={{ display: "flex" }} className={styles.min_gap}>
                                        <BalanceComponent />
                                        <ReferalRewards />
                                    </div>
                                    {
                                        userWallets.some(item => item?.balance?.reserved)
                                        &&
                                        <OtherBalance />
                                    }
                                    {
                                        userWallets.some(item => item?.balance?.reserved)
                                            ?
                                            <div className={styles.scroll_view} style={{ maxWidth: "33vw" }}>
                                                {
                                                    currenciesData.map(item => (
                                                        <CryptoCard key={item.name} item={item} />
                                                    ))
                                                }
                                            </div>
                                            :
                                            <div style={{ display: "flex", scrollbarWidth: "none" }} className={styles.min_gap}>
                                                {
                                                    currenciesData.map(item => (
                                                        <CryptoCard key={item.name} item={item} />
                                                    ))
                                                }
                                            </div>
                                    }
                                </div>
                            </div>
                            <div className={styles.ban_ben}>
                                <EarnMoneyBanner />
                                <RecentBeneficiaries />
                            </div>
                        </div>
                        <div className={styles.middle}>
                            <RecentTrans currentWallet={selectedWallet} />
                            <Stats
                                currentWallet={selectedWallet}
                            />
                            <QuickLinksNew />
                        </div>
                    </div>
                    <div className={styles.right}>
                        <RightContainer
                            setCurrentWallet={setSelectedWallet}
                            showBusinessModal={showBusinessModal}
                            setShowBusinessModal={setShowBusinessModal}
                        />
                        <a href="https://api.whatsapp.com/send/?phone=41783258200" target="_blank" style={{ width: "100%", flex: 1, display: "flex" }} rel="noreferrer">
                            <div style={{
                                minHeight: "75px",
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1.2rem",
                                position: "relative",
                                // background: "rgba(0, 0, 0, 0.55)",
                                borderRadius: "12px",
                                width: "100%",
                                zIndex: 10,
                                overflow: "hidden",
                                background: "white",
                                boxShadow: "0 0 20px #afafaf3e",
                                flex: 1,
                                height: "100%"
                            }}>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "7px", background: "#5926f02e", height: "36px", width: "36px" }}>
                                    <img src={chat} alt=""
                                        loading="lazy"
                                        style={{
                                            width: "70%",
                                            height: "70%",
                                            objectFit: "contain",
                                            flexShrink: "0"
                                        }}
                                    />
                                </div>
                                <span style={{
                                    color: "#000",
                                    leadingTrim: " both",
                                    textEdge: " cap",
                                    fontFamily: " Manrope",
                                    fontSize: " 24px",
                                    fontStyle: " normal",
                                    fontWeight: " 700",
                                    lineHeight: " normal",
                                    letterSpacing: " -0.48px",
                                }}>{t("Chat with us")}</span>
                                {/* <img src={chat_an} alt="" style={{ position: "absolute", top: "0", left: "0", height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply", zIndex: "-1" }} /> */}
                                <ChevronRight color="black" size={20} style={{ marginLeft: "auto" }} />
                            </div>
                        </a>
                    </div >
                </div >
            }
            {
                window.innerWidth < 1000
                &&
                <div className={styles.mobile_home} onClick={() => {
                    if (profileCompletedPercentage < 100 && !showCompletionModal) {
                        setShowCompletionModal(true)
                    }
                }}>
                    <BusinessModal
                        isOpen={showBusinessModal}
                        toggle={() => setShowBusinessModal(false)}
                    />
                    <TopBar />
                    <EarnMoneyBanner />
                    <RecentBeneficiaries />
                    <WalletsMobile
                        setCurrentWallet={setSelectedWallet}
                    />
                    {/* crypto */}
                    <div className={styles.crypto}>
                        <h5>{t("crypto wallet balance").split(" ")?.map(item => service_name_formatter(item))?.join(" ")}</h5>
                        <div className={styles.scroll_view}>
                            {
                                currenciesData.map(item => (
                                    <CryptoCard key={item.name} item={item} />
                                ))
                            }
                        </div>
                        {userDetails?.account_type === "individual" &&
                            <button onClick={() => setShowBusinessModal(true)} className={cardsStyle.button} style={{
                                background: "linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                color: "white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: ".75rem",
                                borderRadius: "7px",
                                padding: "1rem"
                            }}>
                                <img src={crown} alt="c"
                                    loading="lazy"
                                    style={{ width: "20px" }} />
                                <span style={{ color: "white", WebkitTextFillColor: "white", fontSize: ".9rem" }}>{t("Upgrade to Business Account")}</span>
                                <BsFillPlayFill size={25} style={{ marginLeft: "auto" }} />
                            </button>
                        }
                    </div>
                    <QuickLinksMobile />
                    <Stats
                        currentWallet={selectedWallet}
                    />
                    <TransDetails
                        selectedWallet={selectedWallet}
                    />
                    <CurConversion />
                </div>
            }
        </>
    )
}

export default HomeNewUpdated;