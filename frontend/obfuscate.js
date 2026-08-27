import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const sourceDir = path.join(__dirname, 'src', 'Visualizer-main');
const targetDir = path.join(__dirname, 'src', 'components');

console.log('🔒 Starting obfuscation process...');

// 1. Light Obfuscation for Visualizer.jsx
// We skip the obfuscator here because it cannot parse JSX tags. 
// Instead, we just copy it over and let Vite natively minify it during the build!
fs.copyFileSync(path.join(sourceDir, 'Visualizer.jsx'), path.join(targetDir, 'Visualizer.jsx'));
console.log('✅ Visualizer.jsx copied (Vite will handle light minification)');

// 2. Medium Obfuscation for layoutEngine.js (Pure JS)
const logicCode = fs.readFileSync(path.join(sourceDir, 'layoutEngine.js'), 'utf8');
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
fs.writeFileSync(path.join(targetDir, 'layoutEngine.js'), obfuscatedLogic.getObfuscatedCode());
console.log('✅ layoutEngine.js obfuscated (Medium Settings)');