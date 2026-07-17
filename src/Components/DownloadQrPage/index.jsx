import { useParams } from "react-router"
import QrPoster from "./QrPoster"
import { useContext, useEffect, useLayoutEffect, useMemo } from "react"
import { UserContext } from "../../Context/UserContext"
import { captureScreenShot } from "../../Helper/takeScreenshot"

const DownloadQrPage = () => {
    const { wallet_id } = useParams()
    const { userWallets, verifyToken } = useContext(UserContext)

    // console.log(userWallets, "userWallets")
    const wallet = useMemo(() => {
        console.log(userWallets?.find(item => item?.wallet_id?.toLowerCase() == wallet_id?.toLowerCase()))
        return userWallets?.find(item => item?.wallet_id?.toLowerCase() === wallet_id?.toLowerCase())
    }, [wallet_id, userWallets])

    useLayoutEffect(() => {
        if (wallet) {
            captureScreenShot(wallet_id)
        }
    }, [wallet])

    return (
        <div style={{}}>
            <QrPoster wallet={wallet} />
        </div>
    )
}

export default DownloadQrPage