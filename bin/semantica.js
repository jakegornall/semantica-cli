#!/usr/bin/env node

const { program } = require('commander');
const { generateChunks } = require('../src/index');
const { syncTrainingData } = require('../src/training');

program
  .version(require('../package.json').version)
  .command('chunk')
  .description('Generate semantic chunks from the codebase')
  .action(async () => {
    try {
      await generateChunks();
      console.log('Successfully generated semantic chunks!');
    } catch (error) {
      console.error('Error generating chunks:', error);
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Sync approved chunks to training data')
  .action(async () => {
    try {
      await syncTrainingData();
      console.log('Successfully synced training data!');
    } catch (error) {
      console.error('Error syncing training data:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 