import { Container } from 'reactstrap';
import LoginForm from './LoginForm';
import styles from "./LoginSweatalert.module.css"
import logo from "../../../assets/images/logo/logo.png"
import { Link } from 'react-router-dom';
import decorator from "./decorator.png"
import { useEffect, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

const LoginSweetalert = () => {
    const [showForm, setShowForm] = useState(false)
    const [logoAnime, setLogoAnime] = useState(false)
    const [circleAnime, setCircleAnime] = useState(false)
    const [typed, setTyped] = useState(false)

    useEffect(() => {
        setTimeout(() => setLogoAnime(true), 100);
        setTimeout(() => setCircleAnime(true), 250);
    }, [])

    useEffect(() => {
        if (typed) {
            setTimeout(() => {
                setShowForm(true)
            }, 1000);
        }
    }, [typed])
    return (
        <section style={{
            overflow: "hidden",
            maxHeight: "100vh",
            position: "relative"
        }}>
            <Link to={'/'} className={styles.logo} style={{
                opacity: logoAnime ? 1 : 0,
                left: logoAnime ? 0 : "-100px"
            }}>
                <img src={logo} alt="" style={{ height: "40px" }} />
                <span style={{ color: "black", fontSize: "1.2rem" }}>InstaPay</span>
            </Link>
            <img src={decorator} alt="instapay" className={`${styles.cir} ${styles.cir_top}`} style={{
                top: circleAnime ? "-140px" : "-400px",
                right: circleAnime ? "-140px" : "-400px"
            }} />
            <img src={decorator} alt="instapay" className={`${styles.cir} ${styles.cir_bottom}`} style={{
                bottom: circleAnime ? "-140px" : "-400px",
                left: circleAnime ? "-140px" : "-400px"
            }} />
            {/* boaring message */}
            {
                !showForm
                &&
                <Container className='p-0' fluid={true}>
                    <div className="login-card">
                        <TypeAnimation
                            sequence={[
                                () => new Promise(resolve => setTimeout(resolve, 300)),
                                "W", 10, "We", 10, "Wel", 10, "Welc", 10, "Welco", 10, "Welcom", 10, "Welcome", 10, "Welcome ", 10, "Welcome t", 10, "Welcome to", 10, "Welcome to ", 10, "Welcome to I", 10, "Welcome to In", 10, "Welcome to Ins", 10, "Welcome to Inst", 10, "Welcome to Insta", 10, "Welcome to Instap", 10, "Welcome to Instapa", 10, "Welcome to Instapay", () => {
                                    setTyped(true)
                                }
                            ]}
                            wrapper="h2"
                            cursor={true}
                        />
                    </div>
                </Container>
            }
            <Container className="p-0" fluid={true} style={{
                opacity: showForm ? 1 : 0,
                transform: showForm ? "translateY(0px)" : "translateY(-100px)",
                pointerEvents: showForm ? "all" : "none",
                transition: "500ms ease-out"
            }}>
                <div className="login-card">
                    <LoginForm />
                </div>
            </Container>
        </ section>
    );
};

export default LoginSweetalert;