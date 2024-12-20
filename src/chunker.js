const fs = require('fs-extra');
const path = require('path');
const AIProvider = require('./aiProvider');
require('dotenv').config();

async function processFiles(files) {
  // Filter out non-text files and very large files
  const validFiles = await Promise.all(
    files.map(async (filePath) => {
      try {
        const stats = await fs.stat(filePath);
        if (stats.size > 1000000) { // Skip files larger than 1MB
          console.warn(`Skipping large file: ${filePath}`);
          return null;
        }
        
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          content,
          path: path.relative(process.cwd(), filePath)
        };
      } catch (error) {
        console.warn(`Error reading file ${filePath}:`, error);
        return null;
      }
    })
  );

  const fileContents = validFiles.filter(Boolean);

  // Process files in smaller batches
  const BATCH_SIZE = 30;
  const batches = [];
  for (let i = 0; i < fileContents.length; i += BATCH_SIZE) {
    batches.push(fileContents.slice(i, i + BATCH_SIZE));
  }

  const aiProvider = new AIProvider(process.env.OPENAI_API_KEY);
  
  let allChunks = [];
  let allReasoningAndPlanning = [];
  for (const batch of batches) {
    try {
      console.log(`Processing batch of ${batch.length} files...`);
      const { chunks, reasoningAndPlanning } = await aiProvider.generateChunks(batch);
      allChunks = [...allChunks, ...chunks];
      allReasoningAndPlanning = [...allReasoningAndPlanning, ...reasoningAndPlanning];
    } catch (error) {
      console.error('Error processing batch:', error);
      // Continue with next batch instead of failing completely
    }
  }

  if (allChunks.length === 0) {
    throw new Error('No chunks were generated. Check the logs for errors.');
  }

  return {
    chunks: allChunks,
    reasoningAndPlanning: allReasoningAndPlanning
  };
}

module.exports = { processFiles }; 