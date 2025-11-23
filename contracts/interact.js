const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const {abi} = require('./compile.js');

const newCertificate = async(testnetArg, addressArg, privateKeyArg, contractAdd, certificateArg) => {   
    const {studentId, documentHash, studentName, issuerID, course, certificateType, yearOfGraduation} = certificateArg;
    
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);    
    let contract = new web3.eth.Contract(abi, contractAdd);
    
    try {
        const transactionReceipt = await contract.methods.setCertificate(
            studentId, 
            documentHash, 
            studentName, 
            issuerID,
            course || '',
            certificateType || '',
            yearOfGraduation || ''
        ).send({gas: '500000', gasPrice: '10000000000', from: addressArg});   
        console.log("Certificate created successfully");
        provider.engine.stop();
        return transactionReceipt;
    } catch (err) {
        provider.engine.stop();
        throw err;
    }
}

const revokeCertificate = async(testnetArg, addressArg, privateKeyArg, contractAdd, studentId, reason) => {
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);    
    let contract = new web3.eth.Contract(abi, contractAdd);
    
    try {
        const transactionReceipt = await contract.methods.revokeCertificate(studentId, reason).send({gas: '200000', gasPrice: '10000000000', from: addressArg});   
        console.log("Certificate revoked successfully");
        provider.engine.stop();
        return transactionReceipt;
    } catch (err) {
        provider.engine.stop();
        throw err;
    }
}

const getCertificateStatus = async(testnetArg, addressArg, privateKeyArg, contractAdd, studentId) => {
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);    
    let contract = new web3.eth.Contract(abi, contractAdd);
    
    try {
        const status = await contract.methods.getCertificateStatus(studentId).call({from: addressArg});
        provider.engine.stop();
        return {
            isRevoked: status.isRevoked,
            revokedAt: status.revokedAt,
            reason: status.reason
        };
    } catch (err) {
        provider.engine.stop();
        throw err;
    }
}

const getAllCertificates = async(testnetArg, addressArg, privateKeyArg, contractAdd) => {   
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);    
    let contract = new web3.eth.Contract(abi, contractAdd);
    
    try {
        const studentIDs = await contract.methods.getStudentIDs().call({from: addressArg}); 
        const certificates = [];
        for (const studentID of studentIDs) {
            const certificate = await contract.methods.getCertificateInfo(studentID).call({from: addressArg});
            const status = await contract.methods.getCertificateStatus(studentID).call({from: addressArg});
            certificates.push({
                studentID: studentID, 
                hash: certificate["0"], 
                name: certificate["1"],
                isRevoked: status.isRevoked,
                revokedAt: status.revokedAt,
                revocationReason: status.reason
            });
        }
        provider.engine.stop();
        return certificates;
    } catch (err) {
        provider.engine.stop();
        throw err;
    }
}

const getWalletBalance = async(testnetArg, addressArg, privateKeyArg) => {   
    const provider = new HDWalletProvider({
        privateKeys: [privateKeyArg],
        providerOrUrl: testnetArg,
    });

    const web3 = new Web3(provider);    
    
    try {
        const balanceWei = await web3.eth.getBalance(addressArg);
        const balanceEther = web3.utils.fromWei(balanceWei, "ether");
        provider.engine.stop();
        return balanceEther;
    } catch (err) {
        provider.engine.stop();
        throw err;
    }
}

module.exports = {newCertificate, getAllCertificates, getWalletBalance, revokeCertificate, getCertificateStatus};