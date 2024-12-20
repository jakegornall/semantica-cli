const glob = require('glob');
const path = require('path');

async function findFiles(cwd) {
  const patterns = [
    '**/*.md',
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    'package.json'
  ];
  
  const ignorePatterns = [
    'node_modules/**',
    '.git/**',
    '.semantic/**',
    'dist/**',
    'build/**'
  ];
  
  const files = await glob.glob(patterns, {
    cwd,
    ignore: ignorePatterns,
    absolute: true
  });
  
  return files;
}

module.exports = { findFiles }; 