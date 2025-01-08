import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { SiWhatsapp, SiSnapchat, SiPinterest, SiTiktok, SiTelegram, SiReddit, SiLinkedin, SiQuora, SiDiscord } from 'react-icons/si';
import { Share2 } from 'react-feather';
import s from "../PaymentsNew/files/share.png"
import { useTranslation } from 'react-i18next';

const ShareBtn = ({ link, bg, sm = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useTranslation()

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
        >
            {/* <Share2 style={{ marginLeft: '1rem', cursor: 'pointer' }} /> */}
            <div style={{ display: "flex", alignItems: "center", background: bg, borderRadius: "50px", padding: sm ? "10px" : "12px 14px", gap: ".3rem", cursor: "pointer" }}>
                <img src={s} alt="s" style={{ height: "20px", width: ".7vw", objectFit: "contain" }} />
                <span style={{ fontWeight: "600" }}>{t("Share")}</span>
            </div>
            {isHovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-150%',
                        right: 0,
                        overflow: "visible"
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: "repeat(6, 1fr)",
                            background: 'white',
                            gap: '1rem',
                            padding: '.5rem',
                            boxShadow: '0 0 3px grey',
                            borderRadius: '10px',
                        }}
                    >
                        <Button
                            color="link"
                            href={`https://www.facebook.com/sharer/sharer.php?u=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <FaFacebook />
                        </Button>
                        <Button
                            color="link"
                            href={`https://x.com/intent/tweet?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <FaTwitter />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.instagram.com/?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <FaInstagram />
                        </Button>
                        <Button
                            color="link"
                            href={`whatsapp://send?text=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiWhatsapp />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.snapchat.com/share?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiSnapchat />
                        </Button>
                        <Button
                            color="link"
                            href={`https://pinterest.com/pin/create/button/?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiPinterest />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.tiktok.com/share?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiTiktok />
                        </Button>
                        <Button
                            color="link"
                            href={`https://telegram.me/share/url?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiTelegram />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.reddit.com/submit?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiReddit />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.linkedin.com/shareArticle?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiLinkedin />
                        </Button>
                        <Button
                            color="link"
                            href={`https://www.quora.com/share?url=${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiQuora />
                        </Button>
                        <Button
                            color="link"
                            href={`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=0`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            <SiDiscord />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareBtn;