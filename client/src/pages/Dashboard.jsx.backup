import React, {useState, useEffect, useContext} from 'react';
import { UserContext } from '../App.js';
import { getCurrentAccount, connectMetaMask } from '../utils/metamask';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function Dashboard() {
    const userData = useContext(UserContext);
    const [certificates, setCertificates] = useState([]);
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [revokeReason, setRevokeReason] = useState('');
    const [testnet, setTestnet] = useState('localhost');
    const [isRevoking, setIsRevoking] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState({ show: false, type: '', message: '' });
    const [walletAddress, setWalletAddress] = useState('');
    const [needsConnection, setNeedsConnection] = useState(false);

    // Auto-load certificates when component mounts
    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        setIsLoading(true);
        setAlertMessage({ show: false, type: '', message: '' });
        setNeedsConnection(false);

        try {
            // First, check if MetaMask is already connected (no popup)
            let address = await getCurrentAccount();
            let chainId;

            if (!address) {
                // Not connected yet, ask user to connect
                setNeedsConnection(true);
                setIsLoading(false);
                return;
            }

            // Get chainId from connected MetaMask
            const provider = new (require('ethers').ethers.providers.Web3Provider)(window.ethereum);
            const network = await provider.getNetwork();
            chainId = network.chainId;

            setWalletAddress(address);

            // Determine network from chainId
            const networkMap = {
                1337: 'localhost',
                5777: 'localhost',
                5: 'goerli',
                11155111: 'sepolia',
                1: 'mainnet'
            };
            
            const detectedNetwork = networkMap[chainId] || 'localhost';
            setTestnet(detectedNetwork);

            console.log('Connected address:', address);
            console.log('Registered address:', userData.walletAddress);
            console.log('Match:', address.toLowerCase() === userData.walletAddress?.toLowerCase());

            // Verify wallet matches registered wallet
            if (address.toLowerCase() !== userData.walletAddress?.toLowerCase()) {
                setAlertMessage({ 
                    show: true, 
                    type: 'error', 
                    message: `Connected wallet (${address.slice(0,6)}...${address.slice(-4)}) does not match your registered wallet (${userData.walletAddress?.slice(0,6)}...${userData.walletAddress?.slice(-4)}). Please switch to the correct account in MetaMask.` 
                });
                setIsLoading(false);
                return;
            }

            // Fetch certificates from backend
            const response = await fetch('/api/documents/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testnet: detectedNetwork,
                    walletAddress: address
                })
            });

            const data = await response.json();

            if (response.ok && data.data === "Success") {
                setCertificates(data.result || []);
                if (data.result && data.result.length > 0) {
                    setAlertMessage({ 
                        show: true, 
                        type: 'success', 
                        message: `Successfully loaded ${data.result.length} certificate${data.result.length !== 1 ? 's' : ''} from ${detectedNetwork}` 
                    });
                }
            } else {
                setAlertMessage({ 
                    show: true, 
                    type: 'warning', 
                    message: data.dataError || 'No certificates found. Have you deployed a contract and issued certificates?' 
                });
            }
        } catch (err) {
            console.error('Error loading certificates:', err);
            setAlertMessage({ 
                show: true, 
                type: 'error', 
                message: err.message || 'Failed to connect to MetaMask or load certificates' 
            });
        }

        setIsLoading(false);
    };

    const handleConnectWallet = async () => {
        try {
            setIsLoading(true);
            // This will trigger MetaMask popup
            await connectMetaMask();
            // After connection, reload certificates
            await loadCertificates();
        } catch (err) {
            setAlertMessage({
                show: true,
                type: 'error',
                message: err.message || 'Failed to connect MetaMask'
            });
            setIsLoading(false);
        }
    };

    const handleRevokeClick = (certificate) => {
        setSelectedCertificate(certificate);
        setRevokeDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setRevokeDialogOpen(false);
        setSelectedCertificate(null);
        setRevokeReason('');
    };

    const handleConfirmRevoke = async () => {
        if (!revokeReason.trim()) {
            setAlertMessage({ show: true, type: 'error', message: 'Please provide a reason for revocation' });
            return;
        }

        setIsRevoking(true);
        
        try {
            // First, prepare the revocation (backend will return contract details)
            const response = await fetch('/api/documents/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedCertificate.studentID,
                    reason: revokeReason,
                    testnet: testnet,
                    walletAddress: walletAddress
                })
            });

            const data = await response.json();

            if (data.data === "ReadyToSign") {
                // TODO: Implement MetaMask signing for revocation
                // For now, show that backend is ready but MetaMask integration is pending
                setAlertMessage({ 
                    show: true, 
                    type: 'info', 
                    message: 'Revocation prepared. MetaMask signing integration coming soon!' 
                });
                handleCloseDialog();
            } else {
                setAlertMessage({ 
                    show: true, 
                    type: 'error', 
                    message: data.dataError || 'Failed to prepare revocation' 
                });
            }
        } catch (err) {
            setAlertMessage({ 
                show: true, 
                type: 'error', 
                message: 'Error connecting to server' 
            });
        }

        setIsRevoking(false);
    };

    return (
        <Box sx={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 140px)', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DashboardIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                Dashboard
                            </Typography>
                            <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                                {walletAddress ? `Connected: ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)} on ${testnet}` : 'Manage issued certificates'}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {certificates.length > 0 && (
                            <Chip 
                                label={`${certificates.length} Certificate${certificates.length !== 1 ? 's' : ''}`}
                                sx={{ 
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    fontWeight: 500
                                }}
                            />
                        )}
                        {!needsConnection && (
                            <Button
                                variant="outlined"
                                onClick={loadCertificates}
                                disabled={isLoading}
                                sx={{ 
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                {isLoading ? 'Loading...' : 'Refresh'}
                            </Button>
                        )}
                    </Box>
                </Box>
                
                {alertMessage.show && (
                    <Alert 
                        severity={alertMessage.type} 
                        sx={{ mb: 3, borderRadius: '12px' }}
                        onClose={() => setAlertMessage({ show: false, type: '', message: '' })}
                    >
                        {alertMessage.message}
                    </Alert>
                )}

                {needsConnection ? (
                    <Box sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        p: 6,
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <DashboardIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
                            Connect Your Wallet
                        </Typography>
                        <Typography sx={{ color: '#6b7280', mb: 3 }}>
                            Please connect your MetaMask wallet to view your certificates
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleConnectWallet}
                            sx={{
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                borderRadius: '10px',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                                }
                            }}
                        >
                            Connect MetaMask
                        </Button>
                    </Box>
                ) : isLoading ? (
                    <Box sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        p: 6,
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography sx={{ color: '#6b7280' }}>
                            Loading certificates from blockchain...
                        </Typography>
                    </Box>
                ) : certificates.length === 0 ? (
                    <Box sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        p: 6,
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <DescriptionIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
                            No Certificates Found
                        </Typography>
                        <Typography sx={{ color: '#6b7280', mb: 3 }}>
                            You haven't issued any certificates yet, or no contract is deployed on {testnet}.
                        </Typography>
                        <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                            Make sure you've deployed a contract and issued certificates on the {testnet} network.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        {certificates.map((certificate, index) => (
                            <Box key={`${certificate.hash}${index}`} sx={{ 
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
                            }}>
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                                    {certificate.name}
                                                </Typography>
                                                {certificate.isRevoked && (
                                                    <Chip 
                                                        label="REVOKED" 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: '#fef2f2',
                                                            color: '#dc2626',
                                                            fontWeight: 600,
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
                                                Student ID: {certificate.studentID}
                                            </Typography>
                                        </Box>
                                        
                                        {!certificate.isRevoked && (
                                            <Button 
                                                variant="outlined" 
                                                color="error"
                                                size="small"
                                                onClick={() => handleRevokeClick(certificate)}
                                                sx={{ 
                                                    borderRadius: '8px',
                                                    textTransform: 'none',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </Box>

                                    <Box sx={{ 
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                        p: 2
                                    }}>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', mb: 0.5 }}>
                                            Document Hash
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '13px', 
                                            color: '#2563eb', 
                                            wordBreak: 'break-all',
                                            fontFamily: 'monospace'
                                        }}>
                                            {certificate.hash}
                                        </Typography>
                                    </Box>

                                    {certificate.isRevoked && certificate.revocationReason && (
                                        <Box sx={{ 
                                            mt: 2,
                                            p: 2,
                                            backgroundColor: '#fef2f2',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            gap: 1.5
                                        }}>
                                            <WarningAmberIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                                                    Revocation Reason
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', color: '#7f1d1d' }}>
                                                    {certificate.revocationReason}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Revoke Dialog */}
                <Dialog 
                    open={revokeDialogOpen} 
                    onClose={handleCloseDialog} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: '16px' }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <WarningAmberIcon sx={{ color: '#dc2626' }} />
                            <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
                                Revoke Certificate
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2, color: '#6b7280' }}>
                            You are about to revoke the certificate for <strong style={{ color: '#111827' }}>{selectedCertificate?.name}</strong> (ID: {selectedCertificate?.studentID}).
                        </DialogContentText>
                        <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
                            This action is permanent and will be recorded on the blockchain.
                        </Alert>
                        <TextField
                            autoFocus
                            label="Reason for Revocation"
                            fullWidth
                            multiline
                            rows={3}
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            placeholder="e.g., Certificate issued in error, Academic misconduct"
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': { borderRadius: '10px' }
                            }}
                        />
                        <Alert severity="info" sx={{ borderRadius: '10px' }}>
                            You'll be prompted to sign the transaction in MetaMask
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button 
                            onClick={handleCloseDialog}
                            sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 3
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirmRevoke} 
                            variant="contained" 
                            color="error"
                            disabled={isRevoking}
                            sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 3
                            }}
                        >
                            {isRevoking ? 'Processing...' : 'Confirm Revoke'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}