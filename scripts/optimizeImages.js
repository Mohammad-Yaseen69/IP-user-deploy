import sharp from 'sharp';
import path from 'path';

console.log('🚀 Image optimization start...');


await sharp('src/components/HomeNewUpdated/files/ref_banner.png')
  .webp({ quality: 75 })
  .resize(1200)
  .toFile('src/components/HomeNewUpdated/files/ref_banner.webp');

console.log('✅ ref_banner.webp done!');


await sharp('src/components/HomeNewUpdated/files/ref_banner.png')
  .webp({ quality: 70 })
  .resize(600)
  .toFile('src/components/HomeNewUpdated/files/ref_banner-mobile.webp');

console.log('✅ ref_banner-mobile.webp done!');

await sharp('src/Components/AuthNew/files/bg.png')
  .webp({ quality: 75 })
  .resize(1400)
  .toFile('src/Components/AuthNew/files/bg.webp');
console.log('✅ AuthNew/bg.webp done!');

await sharp('src/Components/Auth/files/bg.png')
  .webp({ quality: 75 })
  .resize(1400)
  .toFile('src/Components/Auth/files/bg.webp');
console.log('✅ Auth/bg.webp done!');

