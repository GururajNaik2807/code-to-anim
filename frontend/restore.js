import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your paths (match these to what you used in obfuscate.js)
const backupDir = path.join(__dirname, 'src', 'Visualizer-main');
const activeDir = path.join(__dirname, 'src', 'components');

console.log('♻️ Restoring clean files for local development...');

// Copy clean files back to the active directory
fs.copyFileSync(path.join(backupDir, 'Visualizer.jsx'), path.join(activeDir, 'Visualizer.jsx'));
fs.copyFileSync(path.join(backupDir, 'layoutEngine.js'), path.join(activeDir, 'layoutEngine.js'));

console.log('✅ Clean code restored successfully!');