const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 transparent PNG buffer
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPifDwAEfwH3G9eZfwAAAABJRU5ErkJggg==', 'base64');

['icon.png', 'splash-icon.png', 'adaptive-icon.png', 'favicon.png'].forEach(filename => {
  fs.writeFileSync(path.join(assetsDir, filename), pngBuffer);
});

console.log('Mobile assets successfully generated.');
