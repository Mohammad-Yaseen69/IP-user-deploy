import { useContext, useState } from 'react';
import Rating from 'react-rating';
import { Link } from 'react-router-dom';
import { Card, Col, Progress } from 'reactstrap';
import { H4, H6, Image } from '../../../AbstractElements';
import Img from '../../../assets/images/user-profile/bg-profile.jpg';
import { Designer, Href } from '../../../Constant';
import { dynamicImage } from "../../../Services/index"
import SocialMediaIcons from './SocialMediaIcons';
import { UserContext } from '../../../Context/UserContext';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileHeader = () => {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const { userDetails } = useContext(UserContext)
  const [profilePercentage, setProfilePercentage] = useState(0)

  useEffect(() => {
    const arr = [];
    if (userDetails?.user?.first_name) arr.push(1);
    if (userDetails?.user?.last_name) arr.push(1);
    if (userDetails?.email) arr.push(1);
    if (userDetails?.phone) arr.push(1);
    if (userDetails?.postal_code) arr.push(1);
    if (userDetails?.city) arr.push(1);
    if (userDetails?.country) arr.push(1);
    if (userDetails?.address) arr.push(1);
    if (userDetails?.about_me) arr.push(1);
    if (userDetails?.user?.answer1) arr.push(1);
    if (userDetails?.user?.answer2) arr.push(1);
    if (userDetails?.user?.answer3) arr.push(1);
    const percentage = 100 / 12 * arr.length
    setProfilePercentage(percentage)
  }, [userDetails])

  return (
    <Col sm="12" style={{ position: "relative" }}>
      <Card className="profile-header bg-image" style={{ backgroundImage: `url(${Img})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }}>
        <Image attrImage={{ className: 'img-fluid bg-img-cover d-none', src: dynamicImage('user-profile/bg-profile.jpg'), alt: '' }} />
        <div className="profile-img-wrrap" style={{ backgroundImage: `url(${Img})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }}>
          <Image attrImage={{ className: 'img-fluid bg-img-cover d-none', src: dynamicImage('user-profile/bg-profile.jpg'), alt: '' }} />
        </div>
        <div className="userpro-box">
          <div className="img-wrraper">
            <div className="avatar">
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "25px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                color: "white",
                fontSize: "1.4rem",
                fontWeight: 800
              }}>{userDetails?.user?.first_name[0]}</div>
            </div>
            <Link className="icon-wrapper" to={`${process.env.PUBLIC_URL}/users/useredit`}>
              <i className="icofont icofont-pencil-alt-5"></i>
            </Link>
          </div>
          <div className="user-designation">
            <div className="title">
              <a target="_blank" rel="noreferrer" href={Href}>
                <H4>{userDetails?.user?.first_name} {userDetails?.user?.last_name}</H4>
                <H6>{Designer}</H6>
              </a>
            </div>
            <SocialMediaIcons />
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: ".5rem",
              color: "#5826f0"
            }}>
              <Rating initialRating={rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" onChange={(rate) => setRating(rate)}></Rating>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", fontSize: ".6rem", gap: ".25rem", position: "relative", color: "white" }}>
              <span style={{ fontWeight: 600, position: "absolute", left: "10px" }}>{t("Profile Completion")}:</span>
              <Progress value={profilePercentage} barStyle={{ background: "#5826f0", height: "100%" }} style={{ height: "19px", flex: 1 }} />
              <span style={{ fontWeight: 700, position: "absolute", right: "10px" }}>{Math.round(profilePercentage)}%</span>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );
};
export default ProfileHeader;