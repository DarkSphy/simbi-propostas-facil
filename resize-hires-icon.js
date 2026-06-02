import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1cae6b09-8dcb-40d6-b56c-26276adf49e2\\upscaled_simbi_logo_1780406394558.png';
const publicDir = 'public';

async function resize() {
  try {
    const options = {
      fit: 'contain',
      background: { r: 2, g: 8, b: 23, alpha: 1 } // #020817
    };

    await sharp(source).resize(192, 192, options).toFile(path.join(publicDir, 'icon-192x192.png'));
    await sharp(source).resize(512, 512, options).toFile(path.join(publicDir, 'icon-512x512.png'));
    await sharp(source).resize(180, 180, options).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('High-res icons generated successfully!');
  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resize();
