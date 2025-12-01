const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

// Load compiled contract
const contractPath = path.resolve(__dirname, '../build', 'Azcredify.json');
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// Ganache local blockchain settings
const GANACHE_URL = 'http://127.0.0.1:8545';

// Use the FIRST account from Ganache (copy these from your Ganache terminal)
// REPLACE THESE with the values shown in YOUR Ganache terminal!
const ACCOUNT_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const PRIVATE_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

const deployContract = async () => {
    console.log('Starting deployment...');
    
    const provider = new HDWalletProvider(
        PRIVATE_KEY,
        GANACHE_URL
    );
    
    const web3 = new Web3(provider);
    
    console.log('Deploying from account:', ACCOUNT_ADDRESS);
    
    let contract = new web3.eth.Contract(abi);
    
    try {
        const deployedContract = await contract
            .deploy({ data: bytecode })
            .send({ 
                gas: '3000000', 
                gasPrice: '10000000000', 
                from: ACCOUNT_ADDRESS 
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        
        // Save contract address to a file for later use
        const configPath = path.resolve(__dirname, '../contractConfig.json');
        fs.writeFileSync(
            configPath,
            JSON.stringify({
                contractAddress: deployedContract.options.address,
                abi: abi,
                network: 'ganache-local',
                deployedAt: new Date().toISOString()
            }, null, 2),
            'utf8'
        );
        
        console.log('📁 Contract config saved to contractConfig.json');
        
        provider.engine.stop();
        return deployedContract.options.address;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        provider.engine.stop();
        process.exit(1);
    }
};

deployContract();