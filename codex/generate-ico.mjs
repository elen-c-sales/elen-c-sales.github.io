import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('public/favicon.svg');

await sharp(svg, { density: 300 })
  .resize(32, 32, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('public/favicon-32.png');

await sharp(svg, { density: 300 })
  .resize(16, 16, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('public/favicon-16.png');

await sharp(svg, { density: 300 })
  .resize(180, 180, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('public/apple-touch-icon.png');

await sharp(svg, { density: 300 })
  .resize(32, 32, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toFile('public/favicon.ico');

console.log('Favicon assets generated');