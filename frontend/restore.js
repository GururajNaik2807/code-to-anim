import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, 'src', 'Visualizer-main');
const activeDir = path.join(__dirname, 'src', 'components');

if (fs.existsSync(backupDir)) {
  console.log('♻️ Restoring clean files for local development...');
  fs.copyFileSync(path.join(backupDir, 'layoutEngine.js'), path.join(activeDir, 'layoutEngine.js'));
  console.log('✅ Clean code restored successfully!');
} else {
  console.log('ℹ️ No backup folder found, skipping restore step.');
}