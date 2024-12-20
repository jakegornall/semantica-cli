const path = require('path');
const fs = require('fs-extra');
const YAML = require('yaml');

async function syncTrainingData() {
  const cwd = process.cwd();
  const semanticDir = path.join(cwd, '.semantic');
  const trainingDir = path.join(semanticDir, '.training');
  
  await fs.ensureDir(trainingDir);
  
  const chunkFiles = await fs.readdir(semanticDir);
  const yamlFiles = chunkFiles.filter(f => f.endsWith('-chunks.yaml'));
  
  for (const yamlFile of yamlFiles) {
    const version = yamlFile.split('-chunks.yaml')[0];
    const yamlPath = path.join(semanticDir, yamlFile);
    const threadPath = path.join(trainingDir, `${version}-thread.json`);
    
    if (!await fs.pathExists(threadPath)) {
      console.warn(`No thread file found for ${version}`);
      continue;
    }
    
    // Read chunks and thread
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    const { chunks, reasoning_and_planning } = YAML.parse(yamlContent);
    const thread = await fs.readJson(threadPath);
    
    if (!thread.messages || thread.messages.length < 2) {
      console.warn(`Invalid thread format for ${version}`);
      continue;
    }
    
    // Update the assistant message with both chunks and reasoning
    thread.messages[1] = {
      role: "assistant",
      content: JSON.stringify({
        reasoningAndPlanning: reasoning_and_planning,
        chunks
      }, null, 2)
    };
    
    thread.lastSync = new Date().toISOString();
    
    await fs.writeJson(threadPath, thread, { spaces: 2 });
    
    console.log(`Synced training thread for version ${version}`);
  }
}

module.exports = { syncTrainingData }; 