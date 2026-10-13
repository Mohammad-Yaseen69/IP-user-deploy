import sharp from "sharp";
import path from "path";

console.log("🚀 Image optimization start...");

await sharp("src/Components/PaymentsNewer/files/usdt.webp")
  .webp({ quality: 75 })
  .resize(1400)
  .toFile("src/Components/PaymentsNewer/files/usdt.webp");
console.log("✅ PaymentsNewer/usdt.webp done!");
