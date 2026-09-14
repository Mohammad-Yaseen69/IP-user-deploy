// import React from 'react';
// import { Modal, ModalBody, Button } from 'reactstrap';
// import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
// import { SiWhatsapp, SiSnapchat, SiPinterest, SiTiktok, SiTelegram, SiReddit, SiLinkedin, SiQuora, SiDiscord } from 'react-icons/si';

// const socialData = [
//     {
//         name: "Facebook",
//         icon: <FaFacebook />,
//         href: (link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Twitter / X",
//         icon: <FaTwitter />,
//         href: (link) => `https://x.com/intent/tweet?url=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Instagram",
//         icon: <FaInstagram />,
//         href: (link) => `https://www.instagram.com/share?url=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "WhatsApp",
//         icon: <SiWhatsapp />,
//         href: (link) => `https://api.whatsapp.com/send/?text=${encodeURIComponent(link)}&type=custom_url&app_absent=0`,
//     },
//     {
//         name: "Snapchat",
//         icon: <SiSnapchat />,
//         href: (link) => `https://www.snapchat.com/add/${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Pinterest",
//         icon: <SiPinterest />,
//         href: (link) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "TikTok",
//         icon: <SiTiktok />,
//         href: (link) => `https://www.tiktok.com/share?url=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Telegram",
//         icon: <SiTelegram />,
//         href: (link) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Reddit",
//         icon: <SiReddit />,
//         href: (link) => `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "LinkedIn",
//         icon: <SiLinkedin />,
//         href: (link) => `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(link)}&title=InstaPay&summary=InstaPay&source=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Quora",
//         icon: <SiQuora />,
//         href: (link) => `https://www.quora.com/share?url=${encodeURIComponent(link)}`,
//     },
//     {
//         name: "Discord",
//         icon: <SiDiscord />,
//         href: (link) => `https://discord.com/channels/@me`,
//     },
// ];

// const SocialModal = ({ link, isOpen, toggle }) => {
//     return (
//         <Modal isOpen={isOpen} toggle={toggle}>
//             <ModalBody style={{ padding: 0 }}>
//                 <div
//                     style={{
//                         display: 'grid',
//                         gridTemplateColumns: "repeat(6, 1fr)",
//                         background: 'white',
//                         gap: '1rem',
//                         padding: '.5rem',
//                         boxShadow: '0 0 3px grey',
//                         borderRadius: '10px',
//                     }}
//                 >
//                     {socialData.map((item, index) => (
//                         <Button
//                             key={index}
//                             color="link"
//                             href={item.href(link)}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             style={{ padding: 0, fontSize: '20px' }}
//                         >
//                             {item.icon}
//                         </Button>
//                     ))}
//                 </div>
//             </ModalBody>
//         </Modal>
//     )
// }

// export default SocialModal;

// ---------------------------code-----------------------

//-----------------manual code----------------------


import React, { useState } from 'react';
import { Modal, ModalBody, Button } from 'reactstrap';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { SiWhatsapp, SiSnapchat, SiPinterest, SiTiktok, SiTelegram, SiReddit, SiLinkedin, SiQuora, SiDiscord } from 'react-icons/si';

const socialData = [
    {
        name: "Facebook",
        icon: <FaFacebook />,
        href: (link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    },
    {
        name: "Twitter / X",
        icon: <FaTwitter />,
        href: (link) => `https://x.com/intent/tweet?url=${encodeURIComponent(link)}`,
    },
    {
        name: "Instagram",
        icon: <FaInstagram />,
        href: (link) => `https://www.instagram.com/share?url=${encodeURIComponent(link)}`,
    },
    {
        name: "WhatsApp",
        icon: <SiWhatsapp />,
        href: (link) => `https://api.whatsapp.com/send/?text=${encodeURIComponent(link)}&type=custom_url&app_absent=0`,
    },
    {
        name: "Snapchat",
        icon: <SiSnapchat />,
        href: (link) => `https://www.snapchat.com/add/${encodeURIComponent(link)}`,
    },
    {
        name: "Pinterest",
        icon: <SiPinterest />,
        href: (link) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}`,
    },
    {
        name: "TikTok",
        icon: <SiTiktok />,
        href: (link) => `https://www.tiktok.com/share?url=${encodeURIComponent(link)}`,
    },
    {
        name: "Telegram",
        icon: <SiTelegram />,
        href: (link) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(link)}`,
    },
    {
        name: "Reddit",
        icon: <SiReddit />,
        href: (link) => `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(link)}`,
    },
    {
        name: "LinkedIn",
        icon: <SiLinkedin />,
        href: (link) => `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(link)}&title=InstaPay&summary=InstaPay&source=${encodeURIComponent(link)}`,
    },
    {
        name: "Quora",
        icon: <SiQuora />,
        href: (link) => `https://www.quora.com/share?url=${encodeURIComponent(link)}`,
    },
    {
        name: "Discord",
        icon: <SiDiscord />,
        href: (link) => `https://discord.com/channels/@me`,
    },
];

const SocialModal = ({ link, isOpen, toggle }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalBody style={{ padding: 0, overflow: 'visible' }}> 
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: "repeat(6, 1fr)",
                        background: 'white',
                        gap: '1rem',
                        padding: '1.2rem .5rem .5rem .5rem', /* Top padding adjust ki hai tooltip space ke liye */
                        boxShadow: '0 0 3px grey',
                        borderRadius: '10px',
                    }}
                >
                    {socialData.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Hover Name Tooltip */}
                            {hoveredIndex === index && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '120%',
                                        backgroundColor: '#111827',
                                        color: '#ffffff',
                                        padding: '4px 8px',
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        zIndex: 1000,
                                        pointerEvents: 'none',
                                        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    {item.name}
                                    {/* Small arrow pointing down */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '4px solid transparent',
                                            borderRight: '4px solid transparent',
                                            borderTop: '4px solid #111827',
                                        }}
                                    />
                                </div>
                            )}

                            <Button
                                color="link"
                                href={item.href(link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: 0, fontSize: '20px' }}
                            >
                                {item.icon}
                            </Button>
                        </div>
                    ))}
                </div>
            </ModalBody>
        </Modal>
    );
};

export default SocialModal;


// import React from 'react'
// import { Modal, ModalBody, Button } from 'reactstrap'
// import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
// import { SiWhatsapp, SiSnapchat, SiPinterest, SiTiktok, SiTelegram, SiReddit, SiLinkedin, SiQuora, SiDiscord } from 'react-icons/si';

// const SocialModal = ({ link, isOpen, toggle }) => {
//     return (
//         <Modal isOpen={isOpen} toggle={toggle}>
//             <ModalBody style={{ padding: 0 }}>
//                 <div
//                     style={{
//                         display: 'grid',
//                         gridTemplateColumns: "repeat(6, 1fr)",
//                         background: 'white',
//                         gap: '1rem',
//                         padding: '.5rem',
//                         boxShadow: '0 0 3px grey',
//                         borderRadius: '10px',
//                     }}
//                 >
//                     <Button
//                         color="link"
//                         href={`https://www.facebook.com/sharer/sharer.php?u=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <FaFacebook />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://x.com/intent/tweet?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <FaTwitter />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.instagram.com/?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <FaInstagram />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`whatsapp://send?text=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiWhatsapp />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.snapchat.com/share?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiSnapchat />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://pinterest.com/pin/create/button/?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiPinterest />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.tiktok.com/share?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiTiktok />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://telegram.me/share/url?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiTelegram />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.reddit.com/submit?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiReddit />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.linkedin.com/shareArticle?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiLinkedin />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://www.quora.com/share?url=${link}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiQuora />
//                     </Button>
//                     <Button
//                         color="link"
//                         href={`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=0`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ padding: 0, fontSize: '20px' }}
//                     >
//                         <SiDiscord />
//                     </Button>
//                 </div>
//             </ModalBody>
//         </Modal>
//     )
// }

// export default SocialModal


