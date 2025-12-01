require('dotenv').config();
const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const web3 = new Web3();
const User = require('../models/user');
const EthereumNet = require('../models/ethereumNet');
const { requireAuth } = require('../middleware/authMiddleware');

const CertificateMetadata = require('../models/certificateMetadata');

//Dependency to send email
const sendEmail = require('../utils/sendEmail');

//Dependencies needed to deploy and interact with the smart contract
const deployContract = require('../contracts/pseudoDeploy');
const {newCertificate, getAllCertificates, getWalletBalance, revokeCertificate, getCertificateStatus} = require('../contracts/interact');
const getTransactionData = require('../contracts/getTransactionData');

//======================
//Dependencies and Configurations for file storage and multer
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
})

// Helper function to mask email
const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
        return `${username[0]}***@${domain}`;
    }
    const visibleStart = username.slice(0, 2);
    const visibleEnd = username.slice(-1);
    const maskedPart = '*'.repeat(Math.min(username.length - 3, 5));
    return `${visibleStart}${maskedPart}${visibleEnd}@${domain}`;
};

const uploadMiddleware = multer({
  storage: diskStorage,
}).any();

//Middleware
router.use(uploadMiddleware);

//HTTP routes for different testnets and mainnet
const testnetObj = {
    'localhost': 'http://localhost:8545',
    'sepolia': `https://sepolia.infura.io/v3/${process.env.SEPOLIA_API}`,
    'goerli': `https://goerli.infura.io/v3/${process.env.RINKEBY_API}`, 
    'mainnet': `https://mainnet.infura.io/v3/${process.env.MAINNET_API}`,
};

// Helper function to generate a hash of the file
const generateFileHash = (fileBuffer) => {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};



// Deploy route - Updated for MetaMask
router.post('/deploy', requireAuth, async(req, res) => {
    if (req.profile.id === req.body.userId) {
        try {
            const user = await User.findOne({_id: req.body.userId});
            const walletAddress = req.body.walletAddress;
            
            // Verify wallet address matches user's registered wallet
            if (walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
                return res.status(403).json({dataError: "Wallet address does not match registered wallet"});
            }

            // Check balance using just the wallet address (no private key needed)
            const Web3 = require('web3');
            const web3 = new Web3(testnetObj[req.body.testnet]);
            const balanceWei = await web3.eth.getBalance(walletAddress);
            const balanceEther = web3.utils.fromWei(balanceWei, "ether");
            
            if (parseFloat(balanceEther) >= 0.0075) {
                // Contract address will be provided by frontend after MetaMask deployment
                // Just return success and let frontend handle the actual deployment
                res.status(200).json({
                    data: "Success", 
                    message: "Ready to deploy. Please confirm transaction in MetaMask."
                });
            } else {
                console.log("Not enough Ether", balanceEther);
                res.status(404).json({
                    dataError: `You do not have at least 0.0075 Ether to deploy Contract. You only have ${balanceEther} Ether. Please get more Ether`
                });
            }
            
        } catch (err) {
            console.error("Deploy error:", err);
            const errMsg = err.message.split("{")[0];
            res.status(404).json({dataError: errMsg});
        }
    } else {
        res.status(403).json({dataError: "Unauthorized"});
    }
});

// New route to save deployed contract address
router.post('/saveContract', requireAuth, async(req, res) => {
    try {
        const { contractAddress, testnet } = req.body;
        const user = await User.findOne({_id: req.profile.id});
        
        if (!contractAddress || !testnet) {
            return res.status(400).json({dataError: "Missing contract address or network"});
        }

        // Check if contract already exists for this network
        const existingContract = await EthereumNet.findOne({
            userId: req.profile.id,
            nameOfNet: testnet
        });

        if (existingContract) {
            return res.status(400).json({dataError: "Contract already deployed on this network"});
        }

        // Save the contract address
        const ethNet = await EthereumNet.create({
            userId: req.profile.id,
            nameOfNet: testnet,
            address: contractAddress
        });
        
        res.status(200).json({data: "Success"});
    } catch (err) {
        console.error("Save contract error:", err);
        res.status(404).json({dataError: err.message});
    }
});

// Certificates route - Updated for MetaMask
router.post('/certificates', requireAuth, async(req, res) => {
    try {
        const user = await User.findOne({_id: req.profile.id});
        const deployedContract = await EthereumNet.findOne({
            userId: req.profile.id, 
            nameOfNet: req.body.testnet
        });
        
        if (!deployedContract) {
            return res.status(404).json({dataError: "No contract deployed on this network"});
        }

        const walletAddress = req.body.walletAddress;
        
        // Verify wallet address matches
        if (walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
            return res.status(403).json({dataError: "Wallet address does not match registered wallet"});
        }

        // Get all certificates - we don't need private key for reading
        const Web3 = require('web3');
        const web3 = new Web3(testnetObj[req.body.testnet]);
        const path = require('path');
        const fs = require('fs');
        
        // Load contract ABI
        const contractPath = path.resolve(__dirname, '../build', 'Azcredify.json');
        const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        const contract = new web3.eth.Contract(abi, deployedContract.address);
        const studentIDs = await contract.methods.getStudentIDs().call();
        
        const certificates = [];
        for (const studentID of studentIDs) {
            const certificate = await contract.methods.getCertificateInfo(studentID).call();
            const status = await contract.methods.getCertificateStatus(studentID).call();
            certificates.push({
                studentID: studentID, 
                hash: certificate["0"], 
                name: certificate["1"],
                isRevoked: status.isRevoked,
                revokedAt: status.revokedAt,
                revocationReason: status.reason
            });
        }
        
        res.status(200).json({data: "Success", result: certificates});
    } catch (err) {
        console.error("Get certificates error:", err);
        res.status(404).json({dataError: "Error at backend"});
    }
});

// Issue new certificate - Updated for MetaMask
router.post('/new', requireAuth, async(req, res) => {
    try {
        const deployedContract = await EthereumNet.findOne({
            userId: req.profile.id, 
            nameOfNet: req.body.testnet
        });
        
        if (!deployedContract) {
            return res.status(404).json({dataError: "No contract deployed on this network"});
        }

        const user = await User.findOne({_id: req.profile.id});
        const walletAddress = req.body.walletAddress;
        
        // Verify wallet matches
        if (walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
            return res.status(403).json({dataError: "Wallet address does not match registered wallet"});
        }
        
        if (req.files[0]) {
            const file = req.files[0];
            const fileBuffer = fs.readFileSync(file.path);
            
            const fileHash = generateFileHash(fileBuffer);
            console.log('Generated file hash:', fileHash);
            
            const certificateParams = {
                studentId: req.body.studentId, 
                documentHash: fileHash, 
                studentName: req.body.studentName, 
                issuerID: req.profile.id,
                course: req.body.course || '',
                certificateType: req.body.certificateType || '',
                yearOfGraduation: req.body.yearOfGraduation || ''
            };

            // Check balance without private key
            const Web3 = require('web3');
            const web3 = new Web3(testnetObj[req.body.testnet]);
            const balanceWei = await web3.eth.getBalance(walletAddress);
            const balanceEther = web3.utils.fromWei(balanceWei, "ether");
            
            if (parseFloat(balanceEther) >= 0.002) {
                // Return certificate data for frontend to sign with MetaMask
                res.status(200).json({
                    data: "ReadyToSign",
                    certificateParams: certificateParams,
                    contractAddress: deployedContract.address,
                    fileHash: fileHash,
                    fileName: file.filename
                });
            } else {
                fs.unlinkSync(`./uploads/${file.filename}`);
                res.status(404).json({
                    dataError: `You do not have at least 0.002 Ether. You only have ${balanceEther} Ether. Please get more Ether`
                });
            }
        } else {
            res.status(400).json({dataError: "No file uploaded"});
        }
    } catch(err) {
        console.log("err in catch block", err);
        const errMsg = err.message ? err.message.split("{")[0] : 'Error processing certificate';
        res.status(404).json({dataError: errMsg});
    }
});

// Save certificate after MetaMask signing
router.post('/saveCertificate', requireAuth, async(req, res) => {
    try {
        const { transactionHash, fileName, studentEmail, studentName, testnet, studentId } = req.body;
        
        if (!transactionHash) {
            return res.status(400).json({dataError: "Transaction hash required"});
        }

        // Save certificate metadata (including email) to database
        if (studentId && studentEmail) {
            try {
                await CertificateMetadata.create({
                    studentId: studentId,
                    studentEmail: studentEmail,
                    transactionHash: transactionHash,
                    testnet: testnet,
                    issuerId: req.profile.id
                });
                console.log('Certificate metadata saved to database');
            } catch (dbErr) {
                console.log('Database save error (this is OK if duplicate):', dbErr.message);
            }
        }

        // Send email if file was uploaded
        if (fileName) {
            const filePath = `./uploads/${fileName}`;
            
            if (fs.existsSync(filePath)) {
                let rootPath = '';
                if (process.env.NODE_ENV === 'production') {
                    rootPath = `https://${req.hostname}/documents/${testnet}`; 
                } else {
                    rootPath = `${req.protocol}://${req.hostname}:${process.env.REACT_PORT || 3000}/documents/${testnet}`; 
                }
                
                try {
                    const file = {
                        filename: fileName,
                        path: filePath
                    };
                    await sendEmail(studentEmail, studentName, transactionHash, file, rootPath);
                } catch (emailErr) {
                    console.log('Email sending failed (this is OK for local testing):', emailErr.message);
                }

                // Clean up uploaded file
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(200).json({
            data: "Success",
            transactionHash: transactionHash
        });
    } catch(err) {
        console.log("Save certificate error:", err);
        res.status(404).json({dataError: err.message});
    }
});

// Revoke certificate - Updated for MetaMask
router.post('/revoke', requireAuth, async(req, res) => {
    try {
        const { studentId, reason, testnet, walletAddress } = req.body;
        
        const deployedContract = await EthereumNet.findOne({
            userId: req.profile.id, 
            nameOfNet: testnet
        });
        
        if (!deployedContract) {
            return res.status(404).json({dataError: "No contract found for this network"});
        }

        const user = await User.findOne({_id: req.profile.id});
        
        // Verify wallet matches
        if (walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
            return res.status(403).json({dataError: "Wallet address does not match registered wallet"});
        }

        // Return data for frontend to sign with MetaMask
        res.status(200).json({
            data: "ReadyToSign",
            contractAddress: deployedContract.address,
            studentId: studentId,
            reason: reason
        });
        
    } catch(err) {
        console.log("Error preparing revoke:", err);
        const errMsg = err.message ? err.message.split("{")[0] : 'Error processing revocation';
        res.status(404).json({dataError: errMsg});
    }
});

// NEW: Get certificate status endpoint
router.get('/status/:testnet/:studentId', async(req, res) => {
    try {
        const { testnet, studentId } = req.params;
        
        // Use SUPER_PRIVATEKEY for reading data
        const privateKey = process.env.SUPER_PRIVATEKEY;
        const {address} = web3.eth.accounts.privateKeyToAccount(privateKey);
        
        // Find any contract for this network (we need contract address)
        const deployedContract = await EthereumNet.findOne({nameOfNet: testnet});
        
        if (!deployedContract) {
            return res.status(404).json({dataError: "No contract found for this network"});
        }

        const status = await getCertificateStatus(
            testnetObj[testnet],
            address,
            privateKey,
            deployedContract.address,
            studentId
        );
        
        res.status(200).json({
            data: "Success",
            isRevoked: status.isRevoked,
            revokedAt: status.revokedAt,
            reason: status.reason
        });
        
    } catch(err) {
        console.log("Error getting certificate status:", err);
        res.status(404).json({dataError: "Error retrieving certificate status"});
    }
});

router.post('/verifyIpfs', async (req,res) => {
    try {
        if (req.files[0]) {
            const file = req.files[0];
            const fileBuffer = fs.readFileSync(file.path);
            
            const fileHash = generateFileHash(fileBuffer);
            
            fs.unlinkSync(`./uploads/${file.filename}`);                 
            res.status(200).json({ipfsHash: fileHash});
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({dataError: "Error at backend"});
    }
});

// Add this route - REPLACE the existing router.get('/verify/:testnet/:txnHash') route
router.get('/verify/:testnet/:txnHash', async (req, res) => {            
    try {
        const testnetObj = {
            'localhost': 'http://localhost:8545',
            'sepolia': `https://sepolia.infura.io/v3/${process.env.SEPOLIA_API}`,
            'goerli': `https://goerli.infura.io/v3/${process.env.RINKEBY_API}`,
            'mainnet': `https://mainnet.infura.io/v3/${process.env.MAINNET_API}`,
        };

        const transactionData = await getTransactionData(req.params.txnHash, testnetObj[req.params.testnet]);        
        const user = await User.findOne({_id: transactionData["3"]});

        // Get certificate metadata (including email)
        const metadata = await CertificateMetadata.findOne({
            transactionHash: req.params.txnHash
        });

        // Get full certificate info from smart contract
        const Web3 = require('web3');
        const web3Instance = new Web3(testnetObj[req.params.testnet]);
        const path = require('path');
        const fs = require('fs');
        
        const contractPath = path.resolve(__dirname, '../build', 'Azcredify.json');
        const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        const deployedContract = await EthereumNet.findOne({
            userId: transactionData["3"],
            nameOfNet: req.params.testnet
        });

        let fullCertData = {
            course: '',
            certificateType: '',
            yearOfGraduation: ''
        };

        if (deployedContract) {
            try {
                const contract = new web3Instance.eth.Contract(abi, deployedContract.address);
                const studentId = transactionData["0"];
                
                const certInfo = await contract.methods.getFullCertificateInfo(studentId).call();
                
                fullCertData = {
                    course: certInfo.course || '',
                    certificateType: certInfo.certificateType || '',
                    yearOfGraduation: certInfo.yearOfGraduation || ''
                };
            } catch (err) {
                console.log("Could not get full certificate info:", err.message);
            }
        }

        const privateKey = process.env.SUPER_PRIVATEKEY;
        const {address} = web3.eth.accounts.privateKeyToAccount(privateKey);
        
        let revocationStatus = { isRevoked: false, revokedAt: 0, reason: '' };
        
        if (deployedContract) {
            try {
                revocationStatus = await getCertificateStatus(
                    testnetObj[req.params.testnet],
                    address,
                    privateKey,
                    deployedContract.address,
                    transactionData["0"]
                );
            } catch (statusErr) {
                console.log("Could not get revocation status:", statusErr.message);
            }
        }

        res.status(200).json({
            documentHash: transactionData["1"],
            studentName: transactionData["2"],
            studentId: transactionData["0"],
            studentEmail: metadata ? maskEmail(metadata.studentEmail) : '',
            issuerName: user ? user.issuer : "Unknown",
            domainValidated: user ? user.domainValidated : false,
            course: fullCertData.course,
            certificateType: fullCertData.certificateType,
            yearOfGraduation: fullCertData.yearOfGraduation,
            isRevoked: revocationStatus.isRevoked,
            revokedAt: revocationStatus.revokedAt,
            revocationReason: revocationStatus.reason
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({dataError: "Error retrieving transaction data"});
    }
});

module.exports = router;