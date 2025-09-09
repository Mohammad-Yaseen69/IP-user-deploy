import { useMutation } from "@tanstack/react-query"
import { startAuthentication } from "@simplewebauthn/browser"
import { toast } from "react-toastify"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import localforage from "localforage"
import { biometricVerification1, biometricVerification2 } from "../../Components/QrQuickerPay/queries"

const useBiometricVerifications = (data, dataHandler, handleGetFeeDetails, invoice) => {
    const { mutateAsync: biometricVerification1Mutation } = useMutation({
        mutationFn: (payload) => biometricVerification1(payload)
    })

    const { mutateAsync: biometricVerification2Mutation } = useMutation({
        mutationFn: (payload) => biometricVerification2(payload)
    })

    const handleBiometricVerification = async () => {
        try {
            dataHandler("isPressed", true)
            const localPhone = await localforage.getItem("phone");
            const loginPhone = await localforage.getItem("loginData")

            const storedCredentials = localPhone || loginPhone?.credential || null

            const payload = {
                qr_quicker_pay: true
            }
            if (data.phone && data.password) {
                payload.phone = data.phone;
                payload.password = data.password;
            }
            else if (storedCredentials) {
                payload.phone = storedCredentials;
                payload.localstorage = true;
            }

            const dec1 = await biometricVerification1Mutation(payload)
            const credentials = await startAuthentication(dec1.options)
            console.log(dec1)
            const dec2 = await biometricVerification2Mutation(credentials)

            console.log(dec2)

            if (dec2.user?.username === data.recipientDets?.username) {
                toast.error("You cannot send money to your own wallet")
                dataHandler("isPressed", false)
                return
            } else {
                dataHandler("showDetsModal", false)
                dataHandler("token", dec2.token)
                dataHandler("userDetails", dec2.user)
                if (!invoice || !invoice?.shippingAddress) {
                    dataHandler("step", data.step + 1)
                    handleGetFeeDetails(
                        dec2?.user?.walletDetails?._id,
                        dec2?.user?.walletDetails?.currency?.code,
                        dec2?.token,
                        dec2?.user?._id,
                        dec2?.user?.level_id
                    )
                }
                else {
                    dataHandler("showShippingAddress", true)
                }

                return dec2
            }
        } catch (error) {
            dataHandler("isPressed", false)
            console.log("Biometric verification error:", error)

            const dec = error?.response?.data?.data ? decryptData(error?.response?.data?.data) : error.response?.data
            console.log("Decrypted error:", dec)

            if (dec?.message?.toLowerCase()?.includes("cookie")) {
                dataHandler("showDetsModal", true)
                return
            }
            if (dec?.message?.toLowerCase()?.includes("user not found")) {
                return toast.error("You have entered wrong phone number/ password")
            }
            if (dec?.message?.toLowerCase()?.includes("password")) {
                return toast.error("You have entered wrong phone number/ password")
            }
            if (dec?.message?.toLowerCase()?.includes("quickerqrpay is disabled")) {
                dataHandler("error", "Quicker QR pay is inactive in your account, please enable it from settings/payment threshold for quick payments.")
                dataHandler("showModal", true)
                return
            }

            console.log(dec)
            toast.error("Biometric verification failed");
        }
        finally {
            dataHandler("isPressed", false)
        }
    };

    return {
        handleBiometricVerification
    }
}

export default useBiometricVerifications
