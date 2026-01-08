import fs from 'fs';
import path from 'path';

const src = path.resolve('src/generated/swagger.json');
const destDir = path.resolve('dist/generated');
const dest = path.join(destDir, 'swagger.json');

if (!fs.existsSync(src)) {
  console.error(`Swagger spec not found at ${src}. Did tsoa spec run?`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copied swagger.json -> ${dest}`);
