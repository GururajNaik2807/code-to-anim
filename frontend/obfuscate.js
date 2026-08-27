import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, 'src', 'Visualizer-main');
const activeDir = path.join(__dirname, 'src', 'components');

// Determine if we are running in Vercel/Production or Local
const hasBackup = fs.existsSync(backupDir);
const sourceDir = hasBackup ? backupDir : activeDir;

console.log(`🔒 Starting obfuscation process (Source: ${hasBackup ? 'Visualizer-main' : 'src/components'})...`);

// 1. Visualizer.jsx
if (hasBackup) {
  fs.copyFileSync(path.join(sourceDir, 'Visualizer.jsx'), path.join(activeDir, 'Visualizer.jsx'));
  console.log('✅ Visualizer.jsx copied');
}

// 2. Medium Obfuscation for layoutEngine.js
const logicPath = path.join(sourceDir, 'layoutEngine.js');
const logicCode = fs.readFileSync(logicPath, 'utf8');

const obfuscatedLogic = JavaScriptObfuscator.obfuscate(logicCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    renameGlobals: false,
});

fs.writeFileSync(path.join(activeDir, 'layoutEngine.js'), obfuscatedLogic.getObfuscatedCode());
console.log('✅ layoutEngine.js obfuscated (Medium Settings)');