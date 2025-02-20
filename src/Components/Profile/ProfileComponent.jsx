import { Card, CardBody } from "reactstrap"
import styles from "./styles/index.module.scss"
import { useState } from "react"
import Cover from "./Cover"
import Header from "./Header"
import Socials from "./Socials"
import Qr from "./Qr"
import Portfolio from "./Portfolio"
import Reviews from "./Reviews" 

const ProfileComponent = () => {
    const [currentRevTab, setCurrentRevTab] = useState("Seller");
    const [userReviewsAsSeller, setUserReviewsAsSeller] = useState([])
    const [userReviewsAsBuyer, setUserReviewsAsBuyer] = useState([])
    const [averageRatingAsSeller, setAverageRatingAsSeller] = useState(0)
    const [averageRatingAsBuyer, setAverageRatingAsBuyer] = useState(0)
    const [totalReviewsAsSeller, setTotalReviewsAsSeller] = useState(0)
    const [totalReviewsAsBuyer, setTotalReviewsAsBuyer] = useState(0)

    return (
        <div className={styles.container}>
            <Cover />
            <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
                <CardBody className={styles.sc_body}>
                    <Header />
                    <Socials />
                    <Qr
                        averageRatingAsBuyer={averageRatingAsBuyer}
                        averageRatingAsSeller={averageRatingAsSeller}
                        currentRevTab={currentRevTab}
                        totalReviewsAsBuyer={totalReviewsAsBuyer}
                        totalReviewsAsSeller={totalReviewsAsSeller}
                    />
                    <div className={styles.feed_reviews}>
                        <Portfolio />
                        <Reviews
                            currentRevTab={currentRevTab}
                            setCurrentRevTab={setCurrentRevTab}
                            userReviewsAsBuyer={userReviewsAsBuyer}
                            userReviewsAsSeller={userReviewsAsSeller}
                            setAverageRatingAsBuyer={setAverageRatingAsBuyer}
                            setTotalReviewsAsBuyer={setTotalReviewsAsBuyer}
                            setUserReviewsAsBuyer={setUserReviewsAsBuyer}
                            setUserReviewsAsSeller={setUserReviewsAsSeller}
                            setAverageRatingAsSeller={setAverageRatingAsSeller}
                            setTotalReviewsAsSeller={setTotalReviewsAsSeller}
                        />

                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default ProfileComponent