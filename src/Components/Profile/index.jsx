import ProfileComponent from "./ProfileComponent"
import styles from "../TransactionsNewApi/styles/index.module.scss"
import { useTranslation } from "react-i18next"
import TopRight from "../topRight"
import { useContext } from "react"
import { UserContext } from "../../Context/UserContext"
import { Card, CardBody, CardText } from "reactstrap"
import { Link } from "react-router-dom"

const ProfileTest = () => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <h4>{t("User Profile")}</h4>
                            <TopRight />
                        </div>
                        {
                            userDetails?.username
                                ?
                                <ProfileComponent />
                                :
                                <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                    <CardBody>
                                        <CardText>{t("Please add username to your profile to create a personalized public profile page.")} <Link to={"/settings?tab=basic"} style={{ textDecoration: "underline", fontWeight: 600 }}>Add Now</Link></CardText>
                                    </CardBody>
                                </Card>
                        }
                    </div>
                    :
                    <div className={styles.mobile} style={{ padding: 0 }}>
                        {
                            userDetails?.username
                                ?
                                <ProfileComponent />
                                :
                                <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                                    <CardBody>
                                        <CardText>{t("Please add username to your profile to create a personalized public profile page.")} <Link to={"/settings?tab=basic"} style={{ textDecoration: "underline", fontWeight: 600 }}>Add Now</Link></CardText>
                                    </CardBody>
                                </Card>
                        }
                    </div>
            }
        </>
    )
}

export default ProfileTest