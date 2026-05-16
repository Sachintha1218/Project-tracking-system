const fs = require('fs');
const os = require('os');
const path = require('path');
const src = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '9d766f21-d2f0-4b3e-8f29-080e2843ba6d', 'glass_dragon_1778820978819.png');
fs.copyFileSync(src, path.join(__dirname, 'public', 'assets', 'glass_dragon.png'));
console.log('Copied successfully!');
