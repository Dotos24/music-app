// Simple script to start the server
const { exec } = require('child_process');
const path = require('path');

console.log('Starting server...');

// Navigate to the server directory and run the server
const serverProcess = exec('cd server && npx ts-node api/index.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Server output: ${stdout}`);
});

serverProcess.stdout.on('data', (data) => {
  console.log(`${data.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`${data.trim()}`);
});

console.log('Server process started. Press Ctrl+C to stop.'); 