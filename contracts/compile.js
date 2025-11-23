//solidity compiler 
const solc = require("solc");

// file system - read and write files to your computer
const fs = require("fs");
const path = require('path');
// reading the file contents of the smart  contract

const contractPath = path.resolve(__dirname, 'Azcredify.sol');
const fileContent = fs.readFileSync(contractPath).toString();

// create an input structure for my solidity compiler
const input = {
  language: "Solidity",
  sources: {
    "Azcredify": {
      content: fileContent,
    },
  },

  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const abi = output.contracts['Azcredify']['Azcredify'].abi;

const bytecode = output.contracts['Azcredify']['Azcredify']['evm']['bytecode']['object'];
module.exports = { abi, bytecode } ;

// make build folder
const buildPath = path.resolve(__dirname, "../build");
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

// write compiled output
const outputPath = path.resolve(buildPath, "Azcredify.json");
fs.writeFileSync(
  outputPath,
  JSON.stringify({ abi, bytecode }, null, 2),
  "utf8"
);

console.log("Compilation successful. Output written to build/Azcredify.json");
