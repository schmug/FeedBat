/**
 * Icon generator for the FeedBat extension
 * Creates purple bat-themed icons
 *
 * Usage: node generate-icons.js
 *
 * Note: For production, you may want to create proper bat icons.
 * These are simple purple circles with bat emoji placeholder concept.
 */

const fs = require('fs');

// Minimal PNG generator - creates a simple colored circle
function createPNG(size, bgColor, fgColor) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = createIHDR(size, size);

  // IDAT chunk (image data)
  const idat = createIDAT(size, size, bgColor, fgColor);

  // IEND chunk
  const iend = createIEND();

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createIHDR(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;  // bit depth
  data[9] = 2;  // color type (RGB)
  data[10] = 0; // compression
  data[11] = 0; // filter
  data[12] = 0; // interlace

  return createChunk('IHDR', data);
}

function createIDAT(width, height, bgColor, fgColor) {
  const zlib = require('zlib');

  // Create raw pixel data (filter byte + RGB for each pixel per row)
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(rowSize * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2 - 1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // filter type: none

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Draw circle with bat-like wing hints
      let color = bgColor;
      if (distance <= radius) {
        color = fgColor;

        // Simple bat silhouette - ears and wings
        const relX = (x - centerX) / radius;
        const relY = (y - centerY) / radius;

        // Body (oval in center)
        const inBody = (relX * relX * 2 + relY * relY * 4) < 0.6;

        // Ears (top triangles)
        const inLeftEar = relY < -0.3 && relX < -0.1 && relX > -0.4 && relY > -0.7 + (relX + 0.25) * 1.5;
        const inRightEar = relY < -0.3 && relX > 0.1 && relX < 0.4 && relY > -0.7 - (relX - 0.25) * 1.5;

        // Wings (side arcs)
        const wingY = relY > -0.2 && relY < 0.4;
        const inLeftWing = wingY && relX < -0.2 && relX > -0.9;
        const inRightWing = wingY && relX > 0.2 && relX < 0.9;

        if (inBody || inLeftEar || inRightEar || inLeftWing || inRightWing) {
          // Darker purple for bat shape
          color = { r: 40, g: 30, b: 80 };
        }
      }

      raw[pixelOffset] = color.r;
      raw[pixelOffset + 1] = color.g;
      raw[pixelOffset + 2] = color.b;
    }
  }

  const compressed = zlib.deflateSync(raw);
  return createChunk('IDAT', compressed);
}

function createIEND() {
  return createChunk('IEND', Buffer.alloc(0));
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();

  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }

  return crc ^ 0xFFFFFFFF;
}

function makeCRCTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Colors
const bgColor = { r: 255, g: 255, b: 255 }; // White/transparent background
const fgColor = { r: 90, g: 79, b: 207 };   // Purple (#5a4fcf)

// Generate icons
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const png = createPNG(size, bgColor, fgColor);
  const filename = `icon${size}.png`;
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('\nFeedBat icons created!');
console.log('For better icons, open generate-icons.html in a browser.');
