export const DownloadQRHandler = async (qrCodeUrl) => {
    try {
        // Fetch the QR code image from the server
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();

        // Convert the blob to data URL
        const img = new Image();
        const objectURL = URL.createObjectURL(blob);
        img.src = objectURL;

        img.onload = () => {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match the image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the QR code image on the canvas
            ctx.drawImage(img, 0, 0);

            // Add text (Muhammad Imtiaz) at the bottom-center of the canvas
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white'; // You can set the text color here
            ctx.textAlign = 'center';
            ctx.fillText('Muhammad Imtiaz', canvas.width / 2, canvas.height - 10);

            // Convert the canvas to a data URL
            const stickerUrl = canvas.toDataURL('image/png');

            // Create a link element for downloading
            const downloadLink = document.createElement('a');
            downloadLink.href = stickerUrl;
            downloadLink.download = 'sticker.png';

            // Append the link to the document and trigger the click event
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Remove the link from the document
            document.body.removeChild(downloadLink);
        };
    } catch (error) {
        console.error('Error fetching or processing the image:', error);
    }
};  