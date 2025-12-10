// Minimal Node.js script that demonstrates how you might call Soroban CLI
// to deploy/invoke the contract from the frontend environment. This is a
// helper/placeholder; in production you would use a proper Soroban JS client
// library and not shell out to the CLI.

const { exec } = require('child_process');
const fetch = require('node-fetch');
require('dotenv').config();

const SOROBAN_CLI = process.env.SOROBAN_CLI_PATH || 'soroban';
const NETWORK = process.env.SOROBAN_NETWORK || 'https://soroban-testnet.stellar.org';

async function runCmd(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return rej(stderr || err);
      res(stdout.trim());
    });
  });
}

async function showHelp() {
  const out = await runCmd(`${SOROBAN_CLI} --help`);
  console.log(out);
}

async function main() {
  console.log('Frontend helper — not a full app. Use soroban-cli or a JS Soroban client for real interactions.');
  try {
    await showHelp();
  } catch (e) {
    console.error('Error running soroban CLI:', e);
  }
}

main();
