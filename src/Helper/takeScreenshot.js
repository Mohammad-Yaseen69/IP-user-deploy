import html2canvas from "html2canvas"

export const takeScreenshot = (classname = "App", setLoading) => {
    setLoading(true)
    
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
    // Add a delay to ensure the QR code is rendered
    setTimeout(() => {
        html2canvas(document.querySelector(`.App`), { useCORS: true })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const aTag = document.createElement("a");
                aTag.href = imgData;
                aTag.download = `${wallet_id}-${new Date().toLocaleString()}`;
                aTag.click();

                document.body.removeChild(aTag);

                setTimeout(() => window.close(), 4000);
            })
            .catch(error => console.log(error));
    }, 1000); 
};