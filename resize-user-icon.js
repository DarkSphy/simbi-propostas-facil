import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1cae6b09-8dcb-40d6-b56c-26276adf49e2\\media__1780405896634.jpg';
const publicDir = 'public';

async function resize() {
  try {
    // Generate icons from the exact user provided image
    // Using fit: 'contain' with the specific background color from the landing page (#09090b or #020817)
    // Actually the user asked "sem colocar nada atrás dela, somente o incone em funco azul escuro como o da nossa lendign page"
    // The provided image might already be like this, we'll just resize it directly
    // but we can ensure it has a background if it has transparency (though it's a jpg)
    
    const options = {
      fit: 'contain',
      background: { r: 2, g: 8, b: 23, alpha: 1 } // #020817 which is the dark background of the app
    };

    await sharp(source).resize(192, 192, options).toFile(path.join(publicDir, 'icon-192x192.png'));
    await sharp(source).resize(512, 512, options).toFile(path.join(publicDir, 'icon-512x512.png'));
    await sharp(source).resize(180, 180, options).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('Icons resized successfully from user source!');
  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resize();
