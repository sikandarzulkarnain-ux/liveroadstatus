import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('🚀 LivePassWatch Static Site Prerender Engine...');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Please run vite build first.');
  process.exit(1);
}

// Copy static .html files to dist directory for production serving
const rootFiles = fs.readdirSync(rootDir);
const htmlFiles = rootFiles.filter(file => file.endsWith('.html'));

console.log(`📦 Copying ${htmlFiles.length} static HTML pass pages to dist/`);

htmlFiles.forEach(file => {
  const srcPath = path.resolve(rootDir, file);
  const destPath = path.resolve(distDir, file);
  fs.copyFileSync(srcPath, destPath);
});

// Copy sitemap.xml, robots.txt, homepage_bg.jpg, etc. if present
['sitemap.xml', 'robots.txt', 'homepage_bg.jpg', 'HOMEPAGE BG.jpg', '_redirects'].forEach(file => {
  const srcPath = path.resolve(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.resolve(distDir, file));
  }
});

// Copy IMAGE directory recursively to dist/IMAGE
const imageSrcDir = path.resolve(rootDir, 'IMAGE');
const imageDestDir = path.resolve(distDir, 'IMAGE');

if (fs.existsSync(imageSrcDir)) {
  fs.cpSync(imageSrcDir, imageDestDir, { recursive: true });
  console.log(`🖼️  Copied IMAGE/ folder to dist/IMAGE/`);
}

// Copy passes/ directory recursively to dist/passes
const passesSrcDir = path.resolve(rootDir, 'passes');
const passesDestDir = path.resolve(distDir, 'passes');
if (fs.existsSync(passesSrcDir)) {
  fs.cpSync(passesSrcDir, passesDestDir, { recursive: true });
  console.log('🏔️  Copied passes/ SSG pages to dist/passes/');
}

// Obsolete country/ directory is intentionally omitted so requests are 301 redirected to canonical hubs

// Copy individual country hierarchy folders to dist/ (e.g. dist/india, dist/france, dist/italy, etc.)
const countries = [
  'france',
  'india',
  'italy',
  'usa',
  'switzerland',
  'canada',
  'norway',
  'austria',
  'pakistan',
  'chile'
];

countries.forEach(c => {
  const cSrcDir = path.resolve(rootDir, c);
  const cDestDir = path.resolve(distDir, c);
  if (fs.existsSync(cSrcDir)) {
    fs.cpSync(cSrcDir, cDestDir, { recursive: true });
    const subDirs = fs.readdirSync(cSrcDir).filter(f => fs.statSync(path.join(cSrcDir, f)).isDirectory()).length;
    console.log(`🌍 Copied ${c}/ hierarchy to dist/${c}/ (${subDirs} sub-regions)`);
  }
});
// Copy legal, trust, and directory routes
const cleanRouteDirs = ['about', 'methodology', 'contact', 'privacy', 'terms', 'disclaimer', 'countries'];
cleanRouteDirs.forEach(d => {
  const dSrcDir = path.resolve(rootDir, d);
  const dDestDir = path.resolve(distDir, d);
  if (fs.existsSync(dSrcDir)) {
    fs.cpSync(dSrcDir, dDestDir, { recursive: true });
    console.log(`📜 Copied /${d}/ clean URL page to dist/${d}/`);
  }
});

console.log('✅ SSG Prerendering completed successfully! All pass pages, images, and sitemap bundled into dist/.');
