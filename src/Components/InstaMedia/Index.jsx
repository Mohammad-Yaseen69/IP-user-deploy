import React from 'react'
import {
    Search,
    MessageCircle,
    Share2,
    DollarSign,
    Gift,
    Star,
    Zap,
    ChevronDown,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    ArrowRight,
    CheckCircle,
} from 'react-feather'
import style from './InstaMedia.module.css'

const Index = () => {
    const faqs = [
        {
            q: 'What is included?',
            a: 'You get access to five powerful apps in one single platform, built to help you grow your audience and earn more from it.',
        },
        { q: 'How quickly can I get started?' },
        { q: 'Is there a free trial?' },
        { q: 'Can I cancel anytime?' },
        { q: 'Do you offer support?' },
    ]

    return (
        <div className={style.container}>


                <div className={style.siteContent}>
                    {/* NAV */}
                    <nav className={style.nav}>
                        <div className={style.logo}>
                            <span className={style.logoMark} />
                            <span className={style.logoText}>Nova</span>
                        </div>
                        <div className={style.navRight}>
                            <a href="#!">Features</a>
                            <a href="#!">Pricing</a>
                            <a href="#!">About</a>
                            <button className={style.navButton}>Get Started</button>
                        </div>
                    </nav>

                    {/* HERO */}
                    <section className={style.hero}>
                        <span className={style.heroEyebrow}>PLATFORM FOR CREATORS</span>
                        <h1 className={style.heroTitle}>
                            Your platform. Your <span className={style.heroHighlight}>audience</span>. Your revenue.
                        </h1>
                        <p className={style.heroSubtitle}>
                            Everything you need to build, engage, and monetize your audience — all
                            from one beautifully simple platform.
                        </p>

                        <div className={style.heroFormWrapper}>
                            <div className={style.gradientBlob} />
                            <div className={style.heroForm}>
                                <span className={style.formLabel}>Get early access</span>
                                <div className={style.formRow}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={style.emailInput}
                                    />
                                    <button className={style.notifyButton}>
                                        Notify me <ArrowRight size={14} />
                                    </button>
                                </div>
                                <p className={style.formNote}>
                                    <CheckCircle size={12} /> Join 2,400+ creators already on the list
                                </p>
                            </div>
                        </div>

                        <div className={style.partnerRow}>
                            <span className={style.partnerItem}>◆ Trusted by creators</span>
                            <span className={style.partnerItem}>▲ Featured Product</span>
                            <span className={style.partnerItem}>● Top Rated App</span>
                            <span className={style.partnerItem}>■ Fast Growing</span>
                            <span className={style.partnerItem}>◆ Editor's Choice</span>
                        </div>
                    </section>

                    {/* FEATURES */}
                    <section className={style.features}>
                        <div className={style.featuresHeader}>
                            <span className={style.sectionEyebrow}>FEATURES</span>
                            <h2 className={style.featuresTitle}>
                                Five apps.
                                <br />
                                One platform.
                            </h2>
                            <p className={style.featuresSubtitle}>
                                Everything you need to build, engage, and monetize —
                                <br />
                                all working seamlessly, right out of the box.
                            </p>
                        </div>

                        <div className={style.featureGrid}>
                            <div className={`${style.featureCard} ${style.cardLight}`}>
                                <span className={style.cardEyebrow}>SEARCH</span>
                                <h3>Get the best speed. Repeat.</h3>
                                <p>Instant, accurate results powered by search built for creators.</p>
                                <span className={style.redPill}>Try Search Now</span>
                                <div className={style.mockSearchBox}>
                                    <Search size={12} />
                                    <span className={style.mockLine} />
                                </div>
                            </div>

                            <div className={`${style.featureCard} ${style.cardMint}`}>
                                <span className={style.mintPill}>ZERO CODE</span>
                                <h3>Zero code. Always on.</h3>
                                <div className={style.mockChat}>
                                    <span className={style.mockAvatar}>
                                        <MessageCircle size={12} />
                                    </span>
                                    <div>
                                        <p className={style.mockChatTitle}>New message</p>
                                        <p className={style.mockChatSub}>Just fully live delivery</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`${style.featureCard} ${style.cardLight}`}>
                                <span className={style.cardEyebrow}>SOCIAL</span>
                                <h3>Long, short article.</h3>
                                <div className={style.mockDots}>
                                    <span className={style.dotRedSm} />
                                    <span className={style.dotBlueSm} />
                                    <span className={style.dotYellowSm} />
                                </div>
                            </div>

                            <div className={`${style.featureCard} ${style.cardBlue}`}>
                                <span className={style.cardEyebrow}>WORKFLOW</span>
                                <h3>Modify fast functions.</h3>
                                <div className={style.mockRow}>
                                    <span className={style.yellowBox} />
                                    <span className={style.mockLineSmall} />
                                </div>
                            </div>

                            <div className={`${style.featureCard} ${style.cardDark}`}>
                                <span className={style.cardEyebrowLight}>PAYMENTS</span>
                                <h3>Pay world. That fast.</h3>
                                <p>Everyday payments processed instantly, worldwide.</p>
                                <div className={style.mockDarkRow}>
                                    <span className={style.mockAvatarSm} />
                                    <span className={style.mockLineLight} />
                                </div>
                            </div>
                        </div>

                        <div className={style.testimonialCard}>
                            <div className={style.testimonialLeft}>
                                <p className={style.testiEyebrow}>WHAT CREATORS ARE SAYING</p>
                                <ul>
                                    <li><Star size={10} /> Built for growth</li>
                                    <li><Star size={10} /> Set up in minutes</li>
                                    <li><Star size={10} /> Loved by thousands</li>
                                </ul>
                            </div>
                            <div className={style.testimonialRight}>
                                <p className={style.testiEyebrow}>FEATURED ON</p>
                                <div className={style.testiLogo}>
                                    <span className={style.logoMark} /> Nova
                                </div>
                                <ul>
                                    <li><CheckCircle size={10} /> Simple, transparent pricing</li>
                                    <li><CheckCircle size={10} /> No hidden fees, ever</li>
                                    <li><CheckCircle size={10} /> Cancel anytime, no questions</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* CTA CARDS */}
                    <section className={style.ctaSection}>
                        <div className={`${style.ctaCard} ${style.ctaPurple}`}>
                            <span className={style.ctaPillPurple}>EARNINGS</span>
                            <h3>Keep more. Earn instantly.</h3>
                            <ul>
                                <li><CheckCircle size={11} /> Low, transparent platform fees</li>
                                <li><CheckCircle size={11} /> Instant payouts to your bank</li>
                                <li><CheckCircle size={11} /> No surprise deductions, ever</li>
                                <li><CheckCircle size={11} /> Real time earnings dashboard</li>
                                <li><CheckCircle size={11} /> Multiple payout methods supported</li>
                            </ul>
                        </div>
                        <div className={`${style.ctaCard} ${style.ctaYellow}`}>
                            <span className={style.ctaPillYellow}>COMMUNITY</span>
                            <h3>Everyone you love. One tab.</h3>
                            <ul>
                                <li><CheckCircle size={11} /> Chat, share, and connect easily</li>
                                <li><CheckCircle size={11} /> Bring your whole audience together</li>
                                <li><CheckCircle size={11} /> Notifications that actually matter</li>
                                <li><CheckCircle size={11} /> Everything synced across devices</li>
                                <li><CheckCircle size={11} /> One inbox for every conversation</li>
                            </ul>
                        </div>
                    </section>

                    {/* DOOR SECTION */}
                    <section className={style.doorSection}>
                        <div className={style.doorCard}>
                            <h2>Be first through the door.</h2>
                            <p>
                                Join the waitlist and be the first to know when we launch.
                                <br />
                                Early members get exclusive perks.
                            </p>
                            <div className={style.doorForm}>
                                <input type="email" placeholder="you@example.com" />
                                <button>
                                    Notify me <ArrowRight size={14} />
                                </button>
                            </div>
                            <p className={style.doorNote}>No spam. Unsubscribe anytime.</p>

                            <div className={style.doorIcons}>
                                <span className={style.doorIconBox}><Zap size={16} /></span>
                                <span className={style.doorIconBox}><Gift size={16} /></span>
                                <span className={style.doorIconBox}><Star size={16} /></span>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className={style.faqSection}>
                        <span className={style.sectionEyebrow}>FAQ</span>
                        <h2 className={style.faqTitle}>Questions.</h2>
                        <div className={style.faqList}>
                            {faqs.map((item, i) => (
                                <div className={style.faqItem} key={i}>
                                    <div className={style.faqRow}>
                                        <span className={style.faqQuestion}>{item.q}</span>
                                        <ChevronDown size={14} />
                                    </div>
                                    {item.a && <p className={style.faqAnswer}>{item.a}</p>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FOOTER */}
                    <footer className={style.footer}>
                        <div className={style.footerLogo}>
                            <span className={style.logoMark} />
                            <span>Nova</span>
                        </div>
                        <p className={style.footerTagline}>
                            The all-in-one platform for creators.
                            <br />
                            Build, engage, and earn — together.
                        </p>
                        <div className={style.footerIcons}>
                            <span><Facebook size={13} /></span>
                            <span><Twitter size={13} /></span>
                            <span><Instagram size={13} /></span>
                            <span><Linkedin size={13} /></span>
                            <span><Youtube size={13} /></span>
                        </div>
                        <p className={style.footerCopy}>© 2026 Nova. All rights reserved.</p>
                    </footer>
            </div>
        </div>
    )
}

export default Index