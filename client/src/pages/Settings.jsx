import React, { useContext } from 'react';
import { UserContext } from '../App.js';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import DeployPopup from '../components/DeployPopup';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Settings() {
    const userData = useContext(UserContext);

    return (
        <Box sx={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 140px)', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ 
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                Settings
                            </Typography>
                            <Typography sx={{ color: '#6b7280' }}>
                                Manage your smart contracts and account
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Main Content */}
                    <Box sx={{ flex: 2 }}>
                        {/* Smart Contracts Card */}
                        <Box sx={{ 
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            p: 4,
                            border: '1px solid #e5e7eb',
                            mb: 3
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <AccountBalanceWalletIcon sx={{ color: '#2563eb' }} />
                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                    Smart Contracts
                                </Typography>
                            </Box>

                            {userData.userId !== "" && userData.contractAddress?.length === 0 && (
                                <Box sx={{ 
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '12px',
                                    p: 3,
                                    mb: 3
                                }}>
                                    <Typography sx={{ color: '#dc2626', fontWeight: 500, mb: 1 }}>
                                        No Smart Contract Deployed
                                    </Typography>
                                    <Typography sx={{ color: '#7f1d1d', fontSize: '14px' }}>
                                        Deploy a smart contract to start issuing certificates on the blockchain.
                                    </Typography>
                                </Box>
                            )}

                            {userData.userId !== "" && userData.contractAddress?.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    {userData.contractAddress.map((contract, index) => (
                                        <Box key={index} sx={{ 
                                            p: 3,
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '12px',
                                            mb: 2,
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                                                <Typography sx={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: 600, 
                                                    color: '#111827',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {contract.nameOfNet} Network
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ 
                                                fontSize: '13px', 
                                                color: '#2563eb', 
                                                wordBreak: 'break-all',
                                                fontFamily: 'monospace',
                                                backgroundColor: 'white',
                                                p: 1.5,
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                {contract.address}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <DeployPopup method="deploy" />
                        </Box>

                        {/* Account Info Card */}
                        {userData.userId && (
                            <Box sx={{ 
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                p: 4,
                                border: '1px solid #e5e7eb'
                            }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
                                    Account Information
                                </Typography>
                                
                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Email
                                        </Typography>
                                        <Typography sx={{ color: '#111827' }}>
                                            {userData.email || 'Not set'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Institution
                                        </Typography>
                                        <Typography sx={{ color: '#111827' }}>
                                            {userData.issuer || 'Not set'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Domain
                                        </Typography>
                                        <Typography sx={{ color: '#2563eb' }}>
                                            {userData.domain || 'Not set'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Domain Verified
                                        </Typography>
                                        <Typography sx={{ 
                                            color: userData.domainValidated ? '#10b981' : '#f59e0b',
                                            fontWeight: 500
                                        }}>
                                            {userData.domainValidated ? '✓ Verified' : '⏳ Pending'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Sidebar */}
                    <Box sx={{ flex: 1 }}>
                        {/* Info Card */}
                        <Box sx={{ 
                            backgroundColor: '#eff6ff',
                            borderRadius: '16px',
                            p: 3,
                            mb: 3
                        }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <InfoOutlinedIcon sx={{ color: '#2563eb', mt: 0.5 }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 600, color: '#1e40af', mb: 1 }}>
                                        What is a Smart Contract?
                                    </Typography>
                                    <Typography sx={{ color: '#3b82f6', fontSize: '14px', lineHeight: 1.6 }}>
                                        A Smart Contract is code deployed on the Ethereum blockchain that handles certificate issuance and verification.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Network Info */}
                        <Box sx={{ 
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            p: 3,
                            border: '1px solid #e5e7eb'
                        }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 2 }}>
                                Available Networks
                            </Typography>
                            
                            {[
                                { name: 'Localhost', desc: 'Local development testing', color: '#6b7280' },
                                { name: 'Goerli', desc: 'Ethereum testnet', color: '#f59e0b' },
                                { name: 'Mainnet', desc: 'Production network', color: '#10b981' }
                            ].map((network, index) => (
                                <Box key={index} sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2,
                                    py: 1.5,
                                    borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none'
                                }}>
                                    <Box sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%', 
                                        backgroundColor: network.color 
                                    }} />
                                    <Box>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                                            {network.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                            {network.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}