require('dotenv').config({ path: `${__dirname}/../.env` });
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const getTransactionData = async (transactionHash, testnetArg) => {
    
    // Updated HDWalletProvider format for newer versions
    const provider = new HDWalletProvider({
        privateKeys: [process.env.SUPER_PRIVATEKEY],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);
    
    try {
        const result = await web3.eth.getTransaction(transactionHash);
        
        if (!result || !result.input) {
            throw new Error('Transaction not found');
        }
        
        const tx_data = result.input;
        const input_data = tx_data.slice(10); // get only data without function selector

        // Decode with all 7 parameters: studentId, documentHash, studentName, issuerID, course, certificateType, yearOfGraduation
        const params = await web3.eth.abi.decodeParameters([
            'string', // studentId (0)
            'string', // documentHash (1)
            'string', // studentName (2)
            'string', // issuerID (3)
            'string', // course (4)
            'string', // certificateType (5)
            'string'  // yearOfGraduation (6)
        ], input_data);
        
        console.log("Decoded transaction parameters:");
        console.log("Student ID:", params[0]);
        console.log("Document Hash:", params[1]);
        console.log("Student Name:", params[2]);
        console.log("Issuer ID:", params[3]);
        console.log("Course:", params[4]);
        console.log("Certificate Type:", params[5]);
        console.log("Year of Graduation:", params[6]);
        
        provider.engine.stop();
        return params;
    } catch (err) {
        console.log("Error getting transaction data:", err.message);
        provider.engine.stop();
        throw err;
    }
}

module.exports = getTransactionData;