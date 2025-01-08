import React from 'react';
import { Modal, ModalBody, Button } from 'reactstrap';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { SiWhatsapp, SiSnapchat, SiPinterest, SiTiktok, SiTelegram, SiReddit, SiLinkedin, SiQuora, SiDiscord } from 'react-icons/si';

const socialData = [
    {
        icon: <FaFacebook />,
        href: (link) => `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    },
    {
        icon: <FaTwitter />,
        href: (link) => `https://x.com/intent/tweet?url=${link}`,
    },
    {
        icon: <FaInstagram />,
        href: (link) => `https://www.instagram.com/share?url=${link}`,
    },
    {
        icon: <SiWhatsapp />,
        href: (link) => `https://api.whatsapp.com/send/?text=${link}&type=custom_url&app_absent=0`,
    },
    {
        icon: <SiSnapchat />,
        href: (link) => `https://www.snapchat.com/add/${link}`,
    },
    {
        icon: <SiPinterest />,
        href: (link) => `https://pinterest.com/pin/create/button/?url=${link}`,
    },
    {
        icon: <SiTiktok />,
        href: (link) => `https://www.tiktok.com/share?url=${link}`,
    },
    {
        icon: <SiTelegram />,
        href: (link) => `https://t.me/share/url?url=${link}&text=${link}`,
    },
    {
        icon: <SiReddit />,
        href: (link) => `https://www.reddit.com/submit?url=${link}&title=${link}`,
    },
    {
        icon: <SiLinkedin />,
        href: (link) => `https://www.linkedin.com/shareArticle?url=${link}&title=InstaPay&summary=InstaPay&source=${link}`,
    },
    {
        icon: <SiQuora />,
        href: (link) => `https://www.quora.com/share?url=${link}`,
    },
    {
        icon: <SiDiscord />,
        href: (link) => `https://discord.com/channels/@me`,
    },
];

const SocialModal = ({ link, isOpen, toggle }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalBody style={{ padding: 0 }}>
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
                    {socialData.map((item, index) => (
                        <Button
                            key={index}
                            color="link"
                            href={item.href(link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: 0, fontSize: '20px' }}
                        >
                            {item.icon}
                        </Button>
                    ))}
                </div>
            </ModalBody>
        </Modal>
    )
}

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


