import html2canvas from "html2canvas"
import { toast } from "react-toastify";

export const takeScreenshot = (classname = "App", setLoading) => {
    setLoading(true)
    // console.log("screenshot started")
    html2canvas(document.querySelector(`.${classname}`)).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const aTag = document.createElement("a");
        aTag.href = imgData;
        aTag.download = true;
        aTag.click()

        document.removeChild(aTag)
    })
        .finally(() => setLoading(false))
};

export const captureScreenShot = async (wallet_id) => {
    html2canvas(document.querySelector(`.App`), { useCORS: true })
        .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const aTag = document.createElement("a");
            aTag.href = imgData;
            aTag.download = `${wallet_id}-${new Date().toLocaleString()}`;
            aTag.click()

            document.removeChild(aTag)

            setTimeout(() => window.close(), 1000)
        })
    //     .catch(error => "a") // console.log(error))
    //     .finally(() => setTimeout(() => window.close(), 500))
    // try {
    //     const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true })
    //     const video = document.createElement("video")
    //     const aTag = document.createElement("a");

    //     video.addEventListener("loadedmetadata", () => {
    //         const canvas = document.createElement("canvas")
    //         const ctx = canvas.getContext("2d")

    //         canvas.width = video.videoWidth
    //         canvas.height = video.videoHeight

    //         video.play()
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    //         stream.getVideoTracks()[0].stop()
    //         // document.body.appendChild(canvas)

    //         const imgData = canvas.toDataURL("image/png");
    //         aTag.target = "_blank"
    //         aTag.href = imgData;
    //         aTag.download = true;
    //         aTag.click()

    //         // setTimeout(() => {
    //         //     window.close()
    //         // }, 100)
    //     })

    //     video.srcObject = stream;
    // } catch (error) {
    //     alert("You must permit us to take screenshot!")
    //     toast.error("You must permit us to take screenshot!")
    //     window.location.reload()
    //     // console.log(error)
    // }
}