import React, {useReducer, useState, useEffect} from 'react';
import { useHistory, Link } from 'react-router-dom';
import {reducer} from '../utils/reducer';
import { connectMetaMask, isMetaMaskInstalled, onAccountsChanged } from '../utils/metamask';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import SchoolIcon from '@mui/icons-material/School';

const initialState = {    
    email: '',
    password: '',
    domain: '', 
    issuer: '',
    walletAddress: ''
};

export default function SignupPage({ login, setLogin }) {
    const history = useHistory();
    const [formInputs, dispatch] = useReducer(reducer, initialState);
    const [errors, setErrors] = useState({});    
    const [backEndErrorMsg, setBackEndErrorMsg] = useState({ email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    useEffect(() => {
        // Check if already connected
        if (isMetaMaskInstalled()) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setWalletConnected(true);
                        dispatch({
                            type: "update",
                            payload: { field: 'walletAddress', value: accounts[0] }
                        });
                    }
                });
        }

        // Listen for account changes
        onAccountsChanged((account) => {
            if (account) {
                setWalletAddress(account);
                setWalletConnected(true);
                dispatch({
                    type: "update",
                    payload: { field: 'walletAddress', value: account }
                });
            } else {
                setWalletAddress('');
                setWalletConnected(false);
                dispatch({
                    type: "update",
                    payload: { field: 'walletAddress', value: '' }
                });
            }
        });
    }, []);

    const handleConnectWallet = async () => {
        try {
            const { address } = await connectMetaMask();
            setWalletAddress(address);
            setWalletConnected(true);
            dispatch({
                type: "update",
                payload: { field: 'walletAddress', value: address }
            });
        } catch (error) {
            alert(error.message);
        }
    };

    const handleInputChange = (inputEvent) => {
        dispatch({
          type: "update",
          payload: {
            field: inputEvent.target.name,
            value: inputEvent.target.value
          }
        })
    }
    
    const findFormErrors = () => {
        const {email, password, domain, issuer, walletAddress} = formInputs;
        const newErrors = {};
        const verifyEmail = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;        
        
        if (!email || email === '') {
            newErrors.email = 'Email cannot be blank';
            newErrors.emailError = true;
        } else if (verifyEmail.test(email) === false) {
            newErrors.email = 'Please enter a valid email address';
            newErrors.emailError = true;
        }

        if (!password || password === '') {
            newErrors.password = 'Password cannot be blank'; 
            newErrors.passwordError = true;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            newErrors.passwordError = true;
        }

        if (!domain || domain === '') {
            newErrors.domain = 'Domain cannot be blank';
            newErrors.domainError = true;
        } else if (domain.slice(0,4) !== 'http') {
            newErrors.domain = 'Domain must start with http:// or https://';
            newErrors.domainError = true;
        }

        if (!issuer || issuer === '') {
            newErrors.issuer = 'Institution name cannot be blank';
            newErrors.issuerError = true;
        }

        if (!walletAddress || walletAddress === '') {
            newErrors.wallet = 'Please connect your MetaMask wallet';
            newErrors.walletError = true;
        }

        return newErrors;
    }
    
    const handleSubmit = async (e) => {                  
        e.preventDefault();
        setErrors({}); 
        setBackEndErrorMsg({});
        
        const newErrors = findFormErrors()
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            setIsLoading(true);
            const response = await fetch("https://bacv-backend.onrender.com/api/users/signup", {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formInputs)
            });            
            const data = await response.json();
            
            if (data.data === "Success") {                           
                setLogin(true);  
                setIsLoading(false);
                history.push('/dashboard');
            } else if (data.errors) { 
                setIsLoading(false);                       
                setBackEndErrorMsg(data.errors);
            }
        }
    };

    const inputStyle = {
        mb: 2.5,
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            '&:hover fieldset': { borderColor: '#2563eb' },
            '&.Mui-focused fieldset': { borderColor: '#2563eb' }
        }
    };

    return (
        <Box sx={{ 
            minHeight: 'calc(100vh - 140px)', 
            backgroundColor: '#fafbfc',
            py: 6
        }}>
            <Container maxWidth="sm">
                <Box sx={{ 
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    p: { xs: 4, md: 6 },
                    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb'
                }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ 
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                        }}>
                            <SchoolIcon sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', mb: 1 }}>
                            Register Institution
                        </Typography>
                        <Typography sx={{ color: '#6b7280' }}>
                            Create your BACV account with MetaMask
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {backEndErrorMsg.email && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                            {backEndErrorMsg.email}
                        </Alert>
                    )}

                    {/* Form */}
                    <form noValidate autoComplete="off">
                        <TextField
                            fullWidth
                            name="issuer"
                            label="Institution Name"
                            variant="outlined"
                            required
                            onChange={handleInputChange}
                            error={errors?.issuerError}
                            helperText={errors?.issuer || 'e.g., Harvard University'}
                            sx={inputStyle}
                        />

                        <TextField
                            fullWidth
                            name="domain"
                            label="Institution Website"
                            variant="outlined"
                            required
                            onChange={handleInputChange}
                            error={errors?.domainError}
                            helperText={errors?.domain || 'e.g., https://harvard.edu'}
                            sx={inputStyle}
                        />

                        {/* MetaMask Wallet Connection */}
                        <Box sx={{ 
                            mb: 2.5,
                            p: 3,
                            border: '2px solid',
                            borderColor: walletConnected ? '#10b981' : '#e5e7eb',
                            borderRadius: '12px',
                            backgroundColor: walletConnected ? '#ecfdf5' : '#f9fafb'
                        }}>
                            <Typography sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                                MetaMask Wallet
                            </Typography>
                            {!isMetaMaskInstalled() ? (
                                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                                    MetaMask is not installed. Please install{' '}
                                    <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                                        MetaMask extension
                                    </a>
                                </Alert>
                            ) : walletConnected ? (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 8, height: 8, backgroundColor: '#10b981', borderRadius: '50%' }} />
                                        <Typography sx={{ color: '#10b981', fontWeight: 500 }}>
                                            Wallet Connected
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ 
                                        fontSize: '13px', 
                                        color: '#2563eb',
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all'
                                    }}>
                                        {walletAddress}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography sx={{ color: '#6b7280', mb: 2, fontSize: '14px' }}>
                                        Connect your MetaMask wallet to register
                                    </Typography>
                                    <Button
                                        onClick={handleConnectWallet}
                                        fullWidth
                                        sx={{
                                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                            color: 'white',
                                            py: 1.25,
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                                            }
                                        }}
                                    >
                                        🦊 Connect MetaMask
                                    </Button>
                                </Box>
                            )}
                            {errors?.walletError && (
                                <Typography sx={{ color: '#dc2626', fontSize: '13px', mt: 1 }}>
                                    {errors.wallet}
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            name="email"
                            label="Admin Email"
                            variant="outlined"
                            type="email"
                            required
                            onChange={handleInputChange}
                            error={errors?.emailError}
                            helperText={errors?.email || ''}
                            sx={inputStyle}
                        />
                        
                        <TextField
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            required
                            onChange={handleInputChange}
                            error={errors?.passwordError}
                            helperText={errors?.password || 'Minimum 8 characters'}
                            sx={inputStyle}
                        />

                        {isLoading ? (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress sx={{ borderRadius: '10px', height: '8px' }} />
                                <Typography sx={{ textAlign: 'center', mt: 2, color: '#6b7280', fontSize: '14px' }}>
                                    Creating your account...
                                </Typography>
                            </Box>
                        ) : (
                            <Button
                                fullWidth
                                type="submit"
                                onClick={handleSubmit}
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
                                Create Account
                            </Button>
                        )}
                    </form>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '15px' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ 
                                color: '#2563eb', 
                                fontWeight: 600, 
                                textDecoration: 'none' 
                            }}>
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Box>

                {/* Info Box */}
                <Box sx={{ 
                    mt: 3,
                    p: 3,
                    backgroundColor: '#eff6ff',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <Typography sx={{ color: '#1e40af', fontSize: '14px' }}>
                        🔐 Your MetaMask wallet will be used to sign all blockchain transactions securely.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}