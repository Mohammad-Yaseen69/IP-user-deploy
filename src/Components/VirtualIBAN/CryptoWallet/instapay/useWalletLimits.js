import { useContext, useEffect, useRef, useState } from "react"
import axios from "axios"
import { UserContext } from "../../../../Context/UserContext"
import { getLimits } from "../../../WalletsNew"

/** The account limits My Wallets shows, for whichever wallet is open here. */
export const useWalletLimits = (wallet) => {
    const { authHeader } = useContext(UserContext)
    const cancelTokenRef = useRef()
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const walletId = wallet?._id

    useEffect(() => {
        if (!walletId) return undefined

        cancelTokenRef.current?.cancel()
        cancelTokenRef.current = axios.CancelToken.source()
        setError(false)
        getLimits(wallet, setData, authHeader, setLoading, setError, cancelTokenRef.current.token)

        return () => cancelTokenRef.current?.cancel()
    }, [walletId])

    return { data, loading, error }
}

export default useWalletLimits
