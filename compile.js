const fs = require('fs');
const solc = require('solc');
const path = require('path');

const contractPath = './contracts/TicketSale.sol';

const sourceCode = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        [contractPath]: {
            content: sourceCode,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const compiledContract = JSON.parse(solc.compile(JSON.stringify(input))); // No need to parse the output

// console.log('Input object:', input);
// const solcOutput = solc.compile(JSON.stringify(input));
// console.log('solc.compile() output:', solcOutput);
// // const compiledContract = JSON.parse(solcOutput);
// console.log('solcOutput:', solcOutput);



const outputDir = 'compiled';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const contractName = 'TicketSale';
const bytecode = compiledContract.contracts[contractPath][contractName].evm.bytecode.object;
const abi = compiledContract.contracts[contractPath][contractName].abi;

fs.writeFileSync(path.join(outputDir, 'TicketSaleBytecode.json'), bytecode, 'utf8'); // No need to stringify bytecode
fs.writeFileSync(path.join(outputDir, 'TicketSaleABI.json'), JSON.stringify(abi), 'utf8');

console.log('Contract compiled successfully.');
