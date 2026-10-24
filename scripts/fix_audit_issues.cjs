const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. Fix khyber.html meta description
const khyberPath = path.join(root, 'khyber.html');
if (fs.existsSync(khyberPath)) {
  let c = fs.readFileSync(khyberPath, 'utf8');
  if (!c.includes('name="description"')) {
    c = c.replace('<title>', '<meta name="description" content="Live road status and conditions for Khyber Pakhtunkhwa mountain passes in Pakistan, including Babusar and Lowari.">\n  <title>');
    fs.writeFileSync(khyberPath, c, 'utf8');
    console.log('Fixed khyber.html meta description');
  }
}

// 2. Fix broken image in gilgit.html
const gilgitPath = path.join(root, 'gilgit.html');
if (fs.existsSync(gilgitPath)) {
  let c = fs.readFileSync(gilgitPath, 'utf8');
  c = c.replace(/src=["']IMAGE\/Gilgit-Baltistan%20Mountain%20Passes%20Atlas\.png["']/g, 'src="IMAGE/Karakoram-Highway-Khunjerab-Pass-105283235.jpg"');
  fs.writeFileSync(gilgitPath, c, 'utf8');
  console.log('Fixed gilgit.html image');
}

// 3. Fix broken image in usa.html (Oregon map)
const usaPath = path.join(root, 'usa.html');
if (fs.existsSync(usaPath)) {
  let c = fs.readFileSync(usaPath, 'utf8');
  // Check if Oregon Mountain Passes Map.png doesn't exist, replace with Washington Mountain Passes Map or HOMEPAGE BG.jpg
  c = c.replace(/src=["']IMAGE\/Oregon Mountain Passes Map\.png["']/g, 'src="IMAGE/HOMEPAGE BG.jpg"');
  fs.writeFileSync(usaPath, c, 'utf8');
  console.log('Fixed usa.html Oregon image');
}
