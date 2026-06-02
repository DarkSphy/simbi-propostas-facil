import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1cae6b09-8dcb-40d6-b56c-26276adf49e2\\simbi_app_icon_1780404717359.png';
const publicDir = 'public';

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

async function resize() {
  try {
    // Android PWA Icons
    await sharp(source).resize(192, 192).toFile(path.join(publicDir, 'icon-192x192.png'));
    await sharp(source).resize(512, 512).toFile(path.join(publicDir, 'icon-512x512.png'));
    
    // iOS Apple Touch Icon
    await sharp(source).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('Icons resized successfully!');
  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resize();
