const YAML = require('yaml');
const fs = require('fs-extra');

async function generateYaml(chunks, reasoningAndPlanning, outputPath, version) {
  const yamlContent = {
    metadata: {
      generated_at: new Date().toISOString(),
      chunk_count: chunks.length,
      version
    },
    reasoning_and_planning: reasoningAndPlanning,
    chunks: chunks.map(chunk => ({
      ...chunk,
      generated_timestamp: new Date().toISOString()
    }))
  };
  
  const yamlString = YAML.stringify(yamlContent);
  await fs.writeFile(outputPath, yamlString, 'utf-8');
}

module.exports = { generateYaml };