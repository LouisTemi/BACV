const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const {abi, bytecode} = require('./compile.js');

const deployContract = async(testnetArg, addressArg, privateKeyArg) => {    
    // Updated HDWalletProvider format for newer versions
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });
    
    const web3 = new Web3(provider);    
    let contract = new web3.eth.Contract(abi);
    
    try {
        // Increased gas limit for the larger contract with revocation
        contract = await contract.deploy({data: bytecode}).send({
            gas: '3000000', 
            gasPrice: '20000000000', 
            from: addressArg
        });   
        console.log('Contract deployed to:', contract.options.address);
        provider.engine.stop();
        return contract.options.address;
    } catch (err) {
        console.log('Deployment error:', err.message);
        provider.engine.stop();
        throw err;
    }
}

module.exports = deployContract;