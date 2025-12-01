import React, {useState, useContext} from 'react';
import { UserContext } from '../App.js';
import { connectMetaMask } from '../utils/metamask';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ethers } from 'ethers';

export default function DeployPopup({method, setCertificates, setTestnet}) {
    const userData = useContext(UserContext);               
    const [etherErrorMsg, setEtherErrorMsg] = useState('');
    const [testnetSelection, setTestnetSelection] = useState('');
    const [open, setOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEtherErrorMsg('');
    };

    const handleTestnetChange = (event) => {
        setTestnetSelection(event.target.value);
    };

    const getChainId = (network) => {
        const chainIds = {
            'localhost': 1337,
            'sepolia': 11155111,
            'goerli': 5,
            'mainnet': 1
        };
        return chainIds[network] || 1337;
    };

    const handleDeployment = async () => {
        setEtherErrorMsg('');

        if (!testnetSelection) {
            setEtherErrorMsg('Please select a network');
            return;
        }

        try {
            setIsDeploying(true);

            // Connect MetaMask
            const { address, chainId, signer, provider } = await connectMetaMask();

            // Verify correct network
            const expectedChainId = getChainId(testnetSelection);
            if (chainId !== expectedChainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (switchError) {
                    const networkNames = {
                        'localhost': 'Localhost 8545',
                        'sepolia': 'Sepolia Testnet',
                        'mainnet': 'Ethereum Mainnet'
                    };
                    throw new Error(`Please switch MetaMask to ${networkNames[testnetSelection]} network`);
                }
            }

            // Check if wallet matches
            if (address.toLowerCase() !== userData.walletAddress.toLowerCase()) {
                throw new Error('Connected wallet does not match your registered wallet address');
            }

            if (method === "deploy") {
                // Load contract ABI and bytecode
                const response = await fetch('/contractConfig.json');
                const contractData = await response.json();
                
                // Deploy contract using MetaMask
                const factory = new ethers.ContractFactory(
                    contractData.abi, 
                    contractData.bytecode || contractData.abi, 
                    signer
                );
                
                console.log('Deploying contract...');
                const contract = await factory.deploy();
                console.log('Waiting for deployment...');
                await contract.deployed();
                console.log('Contract deployed at:', contract.address);
                
                // Save contract address to backend
                const saveResponse = await fetch('/api/documents/saveContract', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        contractAddress: contract.address,
                        testnet: testnetSelection
                    })
                });

                const saveData = await saveResponse.json();
                
                if (saveData.data === "Success") {
                    setIsDeploying(false);
                    setOpen(false);
                    alert(`Contract deployed successfully at ${contract.address}\n\nNetwork: ${testnetSelection}\n\nYou can now issue certificates!`);
                    window.location.assign('/submitDoc');
                } else {
                    throw new Error(saveData.dataError || 'Failed to save contract');
                }
            } else {
                // Load certificates
                const response = await fetch(`/api/documents/certificates`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },  
                    body: JSON.stringify({
                        testnet: testnetSelection, 
                        walletAddress: address
                    })          
                });            

                const data = await response.json();
                
                if (data.data === "Success") {
                    console.log(data.result);
                    setCertificates(data.result);
                    if (setTestnet) {
                        setTestnet(testnetSelection);
                    }
                    setIsDeploying(false);
                    setOpen(false);
                } else if (data.dataError) {                        
                    setEtherErrorMsg(data.dataError);
                    setIsDeploying(false);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setEtherErrorMsg(error.message || 'Operation failed');
            setIsDeploying(false);
        }
    };

    return (
        <div>
            <Button 
                variant="contained" 
                onClick={handleClickOpen}
                sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '10px',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                    }
                }}
            >
                {method === "deploy" ? "Deploy Contract" : "Load Certificates"}
            </Button>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px' }
                }}
            >
                <DialogTitle>
                    <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
                        {method === "deploy" ? "Deploy Smart Contract" : "Load Certificates"}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        {method === "deploy" 
                            ? "Deploy your smart contract to start issuing certificates." 
                            : "Load your issued certificates from the blockchain."}
                    </DialogContentText>

                    {userData.walletAddress && (
                        <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
                            <Typography sx={{ fontSize: '13px' }}>
                                Connected Wallet: <br/>
                                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                    {userData.walletAddress}
                                </Box>
                            </Typography>
                        </Alert>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Network</InputLabel>
                        <Select
                            value={testnetSelection}
                            label="Select Network"
                            onChange={handleTestnetChange}
                            sx={{ borderRadius: '10px' }}
                        >
                            <MenuItem value="localhost">
                                <Box>
                                    <Typography sx={{ fontWeight: 500 }}>Localhost</Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                        Development (Ganache)
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="sepolia">
                                <Box>
                                    <Typography sx={{ fontWeight: 500 }}>Sepolia Testnet</Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                        Free test network (recommended)
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="goerli">
                                <Box>
                                    <Typography sx={{ fontWeight: 500 }}>Goerli Testnet</Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                        Legacy test network
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="mainnet">
                                <Box>
                                    <Typography sx={{ fontWeight: 500, color: '#dc2626' }}>Ethereum Mainnet</Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#dc2626' }}>
                                        Real ETH required ⚠️
                                    </Typography>
                                </Box>
                            </MenuItem>                       
                        </Select>
                    </FormControl>

                    {method === "deploy" && (
                        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                            <Typography sx={{ fontSize: '14px' }}>
                                MetaMask will prompt you to sign the deployment transaction. 
                                {testnetSelection === 'sepolia' && ' Deployment costs ~0.01 Sepolia ETH.'}
                                {testnetSelection === 'localhost' && ' Make sure Ganache is running.'}
                            </Typography>
                        </Alert>
                    )}

                    {etherErrorMsg && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
                            {etherErrorMsg}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                        onClick={handleClose}
                        disabled={isDeploying}
                        sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeployment}
                        disabled={isDeploying}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: '120px',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                            }
                        }}
                    >
                        {isDeploying ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                            method === "deploy" ? "Deploy" : "Load"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}