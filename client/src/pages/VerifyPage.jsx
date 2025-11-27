import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function VerifyPage() {
  const history = useHistory();
  const [txHash, setTxHash] = useState('');
  const [network, setNetwork] = useState('sepolia');
  const [error, setError] = useState('');

  const handleVerify = () => {
    setError('');
    
    if (!txHash.trim()) {
      setError('Please enter a transaction hash');
      return;
    }
    
    if (!txHash.startsWith('0x')) {
      setError('Transaction hash should start with 0x');
      return;
    }

    history.push(`/documents/${network}/${txHash.trim()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 140px)' }}>
      {/* Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 }
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <VerifiedIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '32px', md: '42px' },
              fontWeight: 700,
              color: '#111827',
              mb: 2
            }}>
              Verify a Certificate
            </Typography>
            
            <Typography sx={{ 
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '500px',
              mx: 'auto'
            }}>
              Enter the transaction hash to verify the authenticity of any blockchain-issued certificate
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Verification Form */}
      <Container maxWidth="sm" sx={{ mt: -6, position: 'relative', zIndex: 10, pb: 8 }}>
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          p: { xs: 3, md: 5 },
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Network Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Network</InputLabel>
            <Select
              value={network}
              label="Select Network"
              onChange={(e) => setNetwork(e.target.value)}
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
                    Ethereum test network
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="mainnet">
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Ethereum Mainnet</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                    Production network
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Transaction Hash Input */}
          <TextField
            fullWidth
            label="Transaction Hash"
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '&:hover fieldset': { borderColor: '#2563eb' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' }
              }
            }}
          />

          {/* Verify Button */}
          <Button
            fullWidth
            onClick={handleVerify}
            startIcon={<SearchIcon />}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              py: 1.5,
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
              }
            }}
          >
            Verify Certificate
          </Button>

          {/* Quick Test Link */}
          {network === 'sepolia' && (
            <Box sx={{ 
              mt: 2,
              p: 2,
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #86efac'
            }}>
              <Typography sx={{ fontSize: '13px', color: '#166534', fontWeight: 500, mb: 0.5 }}>
                ✅ Sepolia Network Selected
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#15803d' }}>
                Paste your transaction hash from Sepolia Etherscan to verify
              </Typography>
            </Box>
          )}
        </Box>

        {/* Info Box */}
        <Box sx={{ 
          mt: 4,
          p: 3,
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          display: 'flex',
          gap: 2
        }}>
          <InfoOutlinedIcon sx={{ color: '#2563eb', mt: 0.5 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
              Where do I find the transaction hash?
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              The transaction hash is provided to the certificate holder when their certificate is issued. 
              It can be found in the email sent to them, encoded in the QR code on their certificate, 
              or shared directly as a verification link.
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, mt: 1 }}>
              You can also find it on Sepolia Etherscan by searching for your wallet address.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}