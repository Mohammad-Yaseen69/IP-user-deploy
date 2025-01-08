import { Col, Container, Row } from 'reactstrap';
import RegisterFrom from './RegisterFrom';
// import { Image } from '../../../AbstractElements';
import { Link } from 'react-router-dom';
// import { dynamicImage } from "../../../Services/index"
import logo from "../../../assets/images/logo/logo.png"


const RegisterSimple = () => {
    return (
        <section style={{
            backgroundImage: `url(/bg.jpg)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', display: 'block'
        }}>
            <Link to={'/'} style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                position: "absolute",
                padding: "2rem",
                top: "0",
                left: "0",
            }}>
                <img src={logo} alt="" style={{ height: "40px" }} />
                <span style={{ color: "black", fontSize: "1.2rem" }}>InstaPay</span>
            </Link>
            <Container className="p-0" fluid={true}>
                <div className="login-card">
                    <RegisterFrom />
                </div>
            </Container>
        </section >
    );
};

export default RegisterSimple;