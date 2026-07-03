import { useState } from 'react';
import {
    ArrowRight,
    Check,
    CheckCircle,
    Facebook,
    Instagram,
    Layers,
    Linkedin,
    MessageSquare,
    Minus,
    Plus,
    Radio,
    Twitter,
    Users,
    Video,
    XCircle,
    Youtube,
    Zap
} from 'react-feather';
import InstaMedia from "../../assets/images/logo/InstaMedia.png";
import cardoneImg from "./files/Group 2128.png"
import card3Img from "./files/Group 2132.png"
import style from './InstaMedia.module.css';
const whatWeDo = [

    "Handle payments, payouts & taxes",
    "Host your content, live & on-demand",
    "Verify every fan before they can pay",
    "Keep chargebacks & fraud off your plate",
];

const whatYouGet = [
    "One dashboard for every app you run",
    "Money in your account the same day",
    "Real analytics on what fans actually watch",
    "A team that answers when something breaks",
];

const keepMore = [
    "Instant payouts direct to your InstaPay wallet - no 30-day wait",
    "Keep nearly all of every dollar, euro or franc you earn",
    "Live stream, post and publish video — all in one place",
    "Subscriber gating, ticket events and real-time tipping built in",
    "Built-in discovery puts your channel in front of the right fans",
];

const everyoneYouLove = [
    "One login for every creator you follow",
    "Tip and subscribe in two taps from your phone",
    "Exclusive drops, live access and members-only content",
    "Pay with card, bank transfer or crypto",
    "Never miss a live — get notified the second they go live",
];

const faqItems = [
    {
        q: "What is Fanbase?",
        a: "Fanbase is one platform that runs your live streams, on-demand content, subscriptions and payouts — so you don't need five different apps to run your business.",
    },
    {
        q: "How is Fanbase different from OnlyFans or Patreon?",
        a: "Fanbase combines live streaming, tipping, subscriptions and instant payouts into a single product, instead of forcing you to stitch several tools together.",
    },
    {
        q: "What are the fees?",
        a: "You keep the majority of everything you earn. Our fee is shown upfront on every transaction — no hidden cuts, no surprise deductions.",
    },
    {
        q: "What devices are supported?",
        a: "Fanbase works on iOS, Android and the web, so you can go live or manage your page from whichever device you have on hand.",
    },
    {
        q: "How does payout work?",
        a: "Earnings move to your linked account instantly after a purchase clears — no waiting on a weekly or monthly payout schedule.",
    },
    {
        q: "How do I start earning?",
        a: "Create your page, turn on tips or subscriptions, and share your link. You can go live or post your first piece of content in minutes.",
    },
];
const Index = () => {

    const [openIndex, setOpenIndex] = useState(0);

    const toggleFaq = (i) => setOpenIndex(openIndex === i ? -1 : i);


    return (
        <div className={style.container}>


            <div className={style.siteContent}>
                <nav className={style.nav}>
                    <div className={style.logo}>
                        <img src={InstaMedia} className={style.logoMark} alt="" />
                        <span className={style.logoText}>InstaMedia</span>
                    </div>
                    <div className={style.navRight}>
                        <span>
                            Join the waitlist
                        </span>
                    </div>
                </nav>

                <section className={style.hero}>
                    <span className={style.heroEyebrow}> Powered by InstaPay · Launching Q3 2026</span>
                    <h1 className={style.heroTitle}>
                        Your platform. Your <span className={style.heroHighlight}>audience</span>. Your revenue.
                    </h1>
                    <p className={style.heroSubtitle}>
                        One platform for live streaming, video, posts and memberships - built on <br /> InstaPay so every tip, sub and sale lands in your wallet instantly.
                    </p>

                    <div className={style.heroFormWrapper}>
                        <div className={style.gradientBlob} />
                        <div className={style.heroForm}>
                            <span className={style.formLabel}>Get notified when we launch</span>
                            <div className={style.formRow}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={style.emailInput}
                                />
                                <button className={style.notifyButton}>
                                    Continue
                                </button>
                            </div>
                            <p className={style.formNote}>
                                No spam — one notification when we go live.
                            </p>
                            <p className={style.formNote}>
                                12,480+ creators already on the waitlist                            </p>
                        </div>
                    </div>

                    <div className={style.partnerWrapper}>
                        <div className={style.partnerTrack}>
                            {[...Array(2)].map((_, index) => (
                                <div className={style.partnerGroup} key={index}>
                                    <span className={style.partnerItem}>◆ Trusted by creators</span>
                                    <span className={style.partnerItem}>▲ Featured Product</span>
                                    <span className={style.partnerItem}>● Top Rated App</span>
                                    <span className={style.partnerItem}>■ Fast Growing</span>
                                    <span className={style.partnerItem}>◆ Editor's Choice</span>
                                    <span className={style.partnerItem}>✦ Video on Demand</span>
                                    <span className={style.partnerItem}>✦ Subscriptions</span>
                                    <span className={style.partnerItem}>✦ Instant Payouts</span>
                                    <span className={style.partnerItem}>✦ Posts & Stories</span>
                                    <span className={style.partnerItem}>✦ Tips & Donations</span>
                                    <span className={style.partnerItem}>✦ Live Streaming</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className={style.featuresSection}>
                    <div className={style.header}>
                        <div>
                            <span className={style.eyebrow}>Platform</span>
                            <h2 className={style.heading}>
                                Five apps.
                                <br />
                                One platform.
                            </h2>
                        </div>
                        <p className={style.headerSub}>
                            Everything a creator needs to build an audience, <br /> run a community and get paid - in one app.
                        </p>
                    </div>

                    <div className={style.grid}>
                        <div className={style.rowtowCon}>
                            <div className={`${style.card} ${style.cardWhite}`}>
                                <span className={style.cardEyebrow}>What's inside</span>
                                <h3 className={style.cardTitle}>
                                    Go live. Get tipped.
                                    <br />
                                    Repeat.
                                </h3>
                                <p className={style.cardText}>
                                    Subscriber-only streams, live chat, real-time tipping. <br /> Your audience, your rules!
                                </p>
                                <button className={style.liveButton}>
                                    LIVE NOW <strong>4,218 watching</strong>
                                </button>
                            </div>

                            <div className={`${style.card} ${style.cardMint}`}>
                                <span className={style.cardEyebrow}>Instant Payouts</span>
                                <h3 className={style.cardTitle1}>
                                    Zero-wait.
                                    <br />
                                    Always.
                                </h3>

                                <div className={style.instaBadge}>
                                    <div className={style.instaIcon}>
                                        <h6>
                                            <div className={style.instaIcon}>
                                                <MessageSquare size={16} />
                                            </div>
                                            InstaMedia</h6> <span>14:32:07</span>
                                    </div>
                                    <div>
                                        CHF 2,841 landed instantly
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={style.rowtowCon}>
                            <div className={`${style.card} ${style.cardWhite}`}>
                                <span className={style.cardEyebrow}>Video & Reels</span>
                                <h3 className={style.cardTitle}>Long, short
                                    <br />
                                    or live.</h3>

                                <img src={cardoneImg} alt="Card 3" />

                            </div>
                            <div className={`${style.card} ${style.cardWhite}`}>
                                <span className={style.cardEyebrow}>Memberships</span>
                                <h3 className={style.cardTitle}>Monthly tiers

                                    <br />
                                    fans love
                                </h3>
                                <img src={cardoneImg} alt="Card 3" />


                            </div>
                            <div className={`${style.card} ${style.cardWhite} ${style.cardWhite3}`}>
                                <span className={style.cardEyebrow}>Posts & Discover</span>
                                <h3 className={style.cardTitle}>Your world,
                                    <br />
                                    their feed.</h3>
                                <p>
                                    Photo posts, stories, exclusive drops. Interest-based discovery brings new fans every day.
                                </p>

                                <img src={card3Img} alt="Card 3" />
                            </div>
                        </div>
                        <div className={style.rowtowCon}>
                            <div className={style.compareWrapper}>
                                <div className={style.oldCard}>
                                    <p className={style.smallHeading}>
                                        WHAT CREATORS JUGGLE TODAY
                                    </p>

                                    <div className={style.item}>
                                        <XCircle size={16} />
                                        <span>Twitch for live streaming</span>
                                    </div>

                                    <div className={style.item}>
                                        <XCircle size={16} />
                                        <span>YouTube for video</span>
                                    </div>

                                    <div className={style.item}>
                                        <XCircle size={16} />
                                        <span>Patreon for memberships</span>
                                    </div>

                                    <div className={style.item}>
                                        <XCircle size={16} />
                                        <span>Stripe + 30–60 day delays</span>
                                    </div>
                                </div>


                                <div className={style.newCard}>
                                    <p className={style.smallHeading}>
                                        REPLACE IT ALL WITH ONE APP
                                    </p>

                                    <div className={style.logoRow}>
                                        <img src={InstaMedia} className={style.logoMark} alt="" />
                                        <span className={style.logoText}>InstaMedia</span>
                                    </div>

                                    <div className={style.itemSuccess}>
                                        <CheckCircle size={17} />
                                        <span>All content formats in one app</span>
                                    </div>

                                    <div className={style.itemSuccess}>
                                        <CheckCircle size={17} />
                                        <span>One wallet, every revenue stream</span>
                                    </div>

                                    <div className={style.itemSuccess}>
                                        <CheckCircle size={17} />
                                        <span>Payouts land instantly via InstaPay</span>
                                    </div>

                                    <div className={style.shape}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="148" height="186" viewBox="0 0 148 186" fill="none">
                                            <g opacity="0.21">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M126.883 98.2878H147.117V142.144C147.117 166.366 130.67 186 110.379 186H0.108321V142.144C0.108321 117.922 16.5557 98.2878 36.8464 98.2878H73.5846V142.144C81.78 116.505 102.523 98.2878 126.883 98.2878Z" fill="url(#paint0_linear_15_3966)" />
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2343 87.7122H0V43.8561C0 19.634 16.4474 0 36.7381 0H147.009V43.8561C147.009 68.0782 130.562 87.7122 110.271 87.7122H73.5328V43.8561C65.3374 69.4951 44.5945 87.7122 20.2343 87.7122Z" fill="url(#paint1_linear_15_3966)" />
                                            </g>
                                            <defs>
                                                <linearGradient id="paint0_linear_15_3966" x1="73.5587" y1="0" x2="73.5587" y2="186" gradientUnits="userSpaceOnUse">
                                                    <stop stop-color="#A88BFF" />
                                                    <stop offset="1" stop-color="#F2EEFF" />
                                                </linearGradient>
                                                <linearGradient id="paint1_linear_15_3966" x1="73.5587" y1="0" x2="73.5587" y2="186" gradientUnits="userSpaceOnUse">
                                                    <stop stop-color="#A88BFF" />
                                                    <stop offset="1" stop-color="#F2EEFF" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className={style.calloutGrid}>
                        <div className={`${style.callout} ${style.calloutLavender}`}>
                            <button>
                                For creators
                            </button>
                            <h3 className={style.calloutTitle}>
                                Keep more.
                                <br />
                                Earn instantly.
                            </h3>
                            <ul className={style.calloutList}>
                                {keepMore.map((item) => (
                                    <li key={item}>
                                        <Check size={13} className={style.checkIcon} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={`${style.callout} ${style.calloutCream}`}>
                            <button>
                                For creators
                            </button>
                            <h3 className={style.calloutTitle}>
                                Everyone you love.
                                <br />
                                One tab.
                            </h3>
                            <ul className={style.calloutList}>
                                {everyoneYouLove.map((item) => (
                                    <li key={item}>
                                        <Check size={13} className={style.checkIcon} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={style.ctaSection}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="382" height="253" viewBox="0 0 382 253" fill="none">
                            <g opacity="0.21">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M171.972 133.215H199.397V192.656C199.397 225.486 177.105 252.097 149.604 252.097H0.146814V192.656C0.146814 159.827 22.4389 133.215 49.9402 133.215H99.7336V192.656C110.841 157.906 138.956 133.215 171.972 133.215Z" fill="url(#paint0_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.4248 118.882H0V59.4408C0 26.6112 22.2921 0 49.7934 0H199.25V59.4408C199.25 92.2704 176.958 118.882 149.457 118.882H99.6634V59.4408C88.5557 94.1908 60.4416 118.882 27.4248 118.882Z" fill="url(#paint1_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M386.369 133.215H413.794V192.656C413.794 225.486 391.502 252.097 364.001 252.097H214.544V192.656C214.544 159.827 236.836 133.215 264.337 133.215H314.131V192.656C325.238 157.906 353.353 133.215 386.369 133.215Z" fill="url(#paint2_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M241.822 118.882H214.397V59.4408C214.397 26.6112 236.689 0 264.19 0H413.647V59.4408C413.647 92.2704 391.355 118.882 363.854 118.882H314.06V59.4408C302.953 94.1908 274.839 118.882 241.822 118.882Z" fill="url(#paint3_linear_25_1063)" />
                            </g>
                            <defs>
                                <linearGradient id="paint0_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className={style.ctaBox}>
                            <h3 className={style.ctaTitle}>Be first through the door.</h3>
                            <p className={style.ctaSub}>
                                Join the waitlist. We'll open your account the
                                <br /> moment we go live. No spam, ever.
                            </p>
                            <form
                                className={style.ctaForm}
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <input
                                    type="email"
                                    placeholder="you@email.com"
                                    className={style.ctaInput}
                                    required
                                />
                                <button type="submit" className={style.ctaButton}>
                                    Continue                                </button>
                            </form>
                            <p>
                                No spam — one notification when we go live.
                            </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="382" height="253" viewBox="0 0 382 253" fill="none">
                            <g opacity="0.21">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M171.972 133.215H199.397V192.656C199.397 225.486 177.105 252.097 149.604 252.097H0.146814V192.656C0.146814 159.827 22.4389 133.215 49.9402 133.215H99.7336V192.656C110.841 157.906 138.956 133.215 171.972 133.215Z" fill="url(#paint0_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.4248 118.882H0V59.4408C0 26.6112 22.2921 0 49.7934 0H199.25V59.4408C199.25 92.2704 176.958 118.882 149.457 118.882H99.6634V59.4408C88.5557 94.1908 60.4416 118.882 27.4248 118.882Z" fill="url(#paint1_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M386.369 133.215H413.794V192.656C413.794 225.486 391.502 252.097 364.001 252.097H214.544V192.656C214.544 159.827 236.836 133.215 264.337 133.215H314.131V192.656C325.238 157.906 353.353 133.215 386.369 133.215Z" fill="url(#paint2_linear_25_1063)" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M241.822 118.882H214.397V59.4408C214.397 26.6112 236.689 0 264.19 0H413.647V59.4408C413.647 92.2704 391.355 118.882 363.854 118.882H314.06V59.4408C302.953 94.1908 274.839 118.882 241.822 118.882Z" fill="url(#paint3_linear_25_1063)" />
                            </g>
                            <defs>
                                <linearGradient id="paint0_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_25_1063" x1="0" y1="126.048" x2="384.961" y2="126.048" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#D1C1FF" />
                                    <stop offset="0.735577" stop-color="#F2EEFF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className={style.faqSection}>
                        <span className={style.eyebrow}>FAQ</span>
                        <h2 className={style.faqHeading}>Questions.</h2>

                        <div className={style.faqList}>
                            {faqItems.map((item, i) => {
                                const isOpen = openIndex === i;
                                return (
                                    <div key={item.q} className={style.faqItem}>
                                        <button
                                            className={style.faqQuestion}
                                            onClick={() => toggleFaq(i)}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{item.q}</span>
                                            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                        </button>
                                        {isOpen && <p className={style.faqAnswer}>{item.a}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <footer className={style.footer}>
                    <div className={style.footerLogo}>
                        <img src={InstaMedia} className={style.logoMark} alt="" />
                        <span >InstaMedia</span>
                    </div>
                    <p className={style.footerTagline}>
                        Stream. Post. Get paid — instantly. Built on
                        <br />
                        InstaPay by Kemit Kingdom SA, Switzerland.

                    </p>
                    <div className={style.footerIcons}>
                        <span><Facebook size={13} /></span>
                        <span><Twitter size={13} /></span>
                        <span><Instagram size={13} /></span>
                        <span><Linkedin size={13} /></span>
                        <span><Youtube size={13} /></span>
                    </div>
                    <p className={style.footerCopy}>® 2026 All rights reserved.</p>
                </footer>
            </div>
        </div >
    )
}

export default Index