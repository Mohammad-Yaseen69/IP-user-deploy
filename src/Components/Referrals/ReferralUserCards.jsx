import React /*{ Fragment, useEffect, useState }*/ from 'react';
// import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Col } from 'reactstrap';
import { H4, H6, LI, UL, Image } from '../../AbstractElements';
import { useSelector } from 'react-redux';

const ReferralUserCards = () => {
    // const [cards, setCards] = useState([]);
    // useEffect(() => {
    //     axios.get(`${process.env.PUBLIC_URL}/api/usercard.json`).then(res => setCards(res.data));
    // }, []);
    // var images = require.context('../../assets/images', true);
    // const dynamicImage = (image) => {
    //     return images(`./${image}`);
    // };

    const referrals = useSelector(state => state.referrals)

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            columnGap: "1.5rem",
            flexWrap: "wrap",
            marginTop: "4rem"
        }}>
            {
                referrals.map((item) => {
                    return (
                        <Col md="6" lg="4" className="box-col-33" style={{ maxWidth: "300px" }} key={item.id}>
                            <Card className="custom-card">
                                <CardHeader className="p-0">
                                    <Image attrImage={{ src: item.card_bg, className: 'img-fluid', alt: '', style: { minHeight: "140px" } }} />
                                </CardHeader>
                                <div className="card-profile">
                                    <Image attrImage={{ src: item.avatar, className: 'rounded-circle', alt: '', style: { objectFit: "cover", width: "80px", height: "80px" } }} />
                                </div>
                                <div className="text-center profile-details">
                                    <Link to={`${process.env.PUBLIC_URL}/users/userprofile`}>
                                        <H4>{item.name.slice(0, 9)}{item.name.length > 10 && "..."}</H4>
                                    </Link>
                                    <H6>{item.post}</H6>
                                </div>
                                <UL attrUL={{ as: 'ul', className: 'simple-list card-social d-flex flex-row justify-content-center' }}>
                                    <LI>
                                        <a href="https://www.facebook.com/">
                                            <i className="fa fa-facebook"></i>
                                        </a>
                                    </LI>
                                    <LI>
                                        <a href="https://myaccount.google.com/">
                                            <i className="fa fa-google-plus"></i>
                                        </a>
                                    </LI>
                                    <LI>
                                        <a href="https://x.com/">
                                            <i className="fa fa-twitter"></i>
                                        </a>
                                    </LI>
                                    <LI>
                                        <a href="https://www.instagram.com/">
                                            <i className="fa fa-instagram"></i>
                                        </a>
                                    </LI>
                                    <LI>
                                        <a href="https://dashboard.rss.com/auth/sign-in/">
                                            <i className="fa fa-rss"></i>
                                        </a>
                                    </LI>
                                </UL>
                            </Card>
                        </Col>
                    );
                })
            }
        </div>
    );
};
export default ReferralUserCards;