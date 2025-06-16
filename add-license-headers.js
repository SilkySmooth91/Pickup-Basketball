#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const licenseHeader = `// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

`;

const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

const excludeDirs = ['node_modules', 'build', 'dist', '.git', 'backup'];
const fileExtensions = ['.js', '.jsx'];

let stats = {
  processed: 0,
  modified: 0,
  skipped: 0,
  errors: 0
};

function log(message, type = 'info') {
  const icons = { info: '📝', success: '✅', skip: '⏭️', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

function hasLicenseHeader(content) {
  return content.includes('Copyright (C) 2025 Pickup Basketball') ||
         content.includes('GNU General Public License');
}

function addHeaderToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    stats.processed++;

    if (hasLicenseHeader(content)) {
      if (isVerbose) log(`Saltato (header presente): ${filePath}`, 'skip');
      stats.skipped++;
      return;
    }

    const newContent = licenseHeader + content;
    
    if (!isDryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    log(`${isDryRun ? '[DRY-RUN] ' : ''}Aggiunto header: ${filePath}`, 'success');
    stats.modified++;
  } catch (error) {
    log(`Errore elaborando ${filePath}: ${error.message}`, 'error');
    stats.errors++;
  }
}

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (fileExtensions.includes(ext)) {
          addHeaderToFile(fullPath);
        }
      }
    }
  } catch (error) {
    log(`Errore scansionando ${dir}: ${error.message}`, 'error');
  }
}

function createBackup() {
  if (isDryRun) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backup', timestamp);
  
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    log(`💾 Backup creato in: ${backupDir}`, 'info');
    return backupDir;
  } catch (error) {
    log(`Errore creando backup: ${error.message}`, 'error');
    return null;
  }
}

function main() {
  console.log('🚀 Script aggiunta header GPL v3\n');
  
  if (isDryRun) {
    log('🧪 Modalità DRY-RUN attiva (nessun file verrà modificato)', 'warn');
  }
  
  const backupDir = createBackup();
  
  log('🔄 Scansione cartelle FRONTEND e BACKEND...', 'info');
  
  const frontendDir = path.join(process.cwd(), 'FRONTEND');
  const backendDir = path.join(process.cwd(), 'BACKEND');
  
  if (fs.existsSync(frontendDir)) {
    scanDirectory(frontendDir);
  } else {
    log('⚠️  Cartella FRONTEND non trovata', 'warn');
  }
  
  if (fs.existsSync(backendDir)) {
    scanDirectory(backendDir);
  } else {
    log('⚠️  Cartella BACKEND non trovata', 'warn');
  }
  
  console.log('\n📊 Risultato finale:');
  log(`File processati: ${stats.processed}`, 'info');
  log(`File modificati: ${stats.modified}`, 'success');
  log(`File saltati: ${stats.skipped}`, 'skip');
  
  if (stats.errors > 0) {
    log(`Errori: ${stats.errors}`, 'error');
  }
  
  if (backupDir) {
    log(`💾 Backup salvato in: ${backupDir}`, 'info');
  }
  
  console.log('\n✨ Completato!');
}

main();