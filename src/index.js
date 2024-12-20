const path = require('path');
const fs = require('fs-extra');
const { processFiles } = require('./chunker');
const { generateYaml } = require('./yamlGenerator');
const { findFiles } = require('./fileUtils');

async function generateChunks() {
  const cwd = process.cwd();
  const packageJson = await fs.readJson(path.join(cwd, 'package.json'));
  const version = packageJson.version;
  
  const semanticDir = path.join(cwd, '.semantic');
  await fs.ensureDir(semanticDir);
  
  const files = await findFiles(cwd);
  
  // Process files into chunks and get reasoning
  const { chunks, reasoningAndPlanning } = await processFiles(files);
  
  const yamlPath = path.join(semanticDir, `v${version}-chunks.yaml`);
  await generateYaml(chunks, reasoningAndPlanning, yamlPath, version);
}

module.exports = { generateChunks }; 