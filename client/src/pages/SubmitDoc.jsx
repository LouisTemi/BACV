import React, {useContext, useState, useReducer} from 'react';
import {reducer} from '../utils/reducer';
import { UserContext } from '../App.js';
import { connectMetaMask } from '../utils/metamask';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeployPopup from '../components/DeployPopup';
import { ethers } from 'ethers';

const initialState = {    
    testnet: '',
    studentFile: '',
    studentId: '',
    studentEmail: '',
    studentName: '',
    course: '',
    certificateType: '',
    yearOfGraduation: ''
};  

export default function SubmitDoc() {
    const userData = useContext(UserContext);           
    const [errors, setErrors] = useState({});
    const [etherErrorMsg, setEtherErrorMsg] = useState('');
    const [formInputs, dispatch] = useReducer(reducer, initialState);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleInputChange = (inputEvent) => {
        if (inputEvent.target.name === "studentFile") {
            setFileName(inputEvent.target.files[0]?.name || '');
            dispatch({
                type: "update",
                payload: {
                    field: 'studentFile',
                    value: inputEvent.target.files[0]
                }
            });  
        } else {
            dispatch({
                type: "update",
                payload: {
                    field: inputEvent.target.name,
                    value: inputEvent.target.value
                }
            });               
        }
    }

    const findFormErrors = () => {
        const {studentId, studentEmail, studentName, testnet} = formInputs;
        const newErrors = {};
        const verifyEmail = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;        
        
        if (!testnet || testnet === '') {
            newErrors.testnet = 'Please select a network';
            newErrors.testnetError = true;
        }

        if (!studentEmail || studentEmail === '') {
            newErrors.studentEmail = 'Email cannot be blank';
            newErrors.studentEmailError = true;
        } else if (verifyEmail.test(studentEmail) === false) {
            newErrors.studentEmail = 'Please enter a valid email address';
            newErrors.studentEmailError = true;
        }

        if (!studentId || studentId === '') {
            newErrors.studentId = 'Student ID cannot be blank'; 
            newErrors.studentIdError = true;
        }

        if (!studentName || studentName === '') {
            newErrors.studentName = 'Student name cannot be blank'; 
            newErrors.studentNameError = true;
        }

        if (!fileName) {
            newErrors.file = 'Please upload a certificate PDF';
            newErrors.fileError = true;
        }

        return newErrors;
    }

    const handleSubmit = async (e) => {                  
        e.preventDefault();         
        setErrors({});
        setEtherErrorMsg("");         
        
        const newErrors = findFormErrors();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsUploading(true);

            // Connect MetaMask and verify network
            const { address, chainId } = await connectMetaMask();

            // Verify wallet matches
            if (address.toLowerCase() !== userData.walletAddress.toLowerCase()) {
                throw new Error('Connected wallet does not match your registered wallet');
            }

            // Verify network matches selection
            const chainIds = { 
                'localhost': 1337, 
                'sepolia': 11155111,
                'mainnet': 1 
            };
            const expectedChainId = chainIds[formInputs.testnet];
            if (chainId !== expectedChainId) {
                const networkNames = {
                    'localhost': 'Localhost 8545',
                    'sepolia': 'Sepolia Testnet',
                    'mainnet': 'Ethereum Mainnet'
                };
                throw new Error(`Please switch MetaMask to ${networkNames[formInputs.testnet]} network`);
            }

            // Prepare form data
            const formData = new FormData();
            for (const [key, value] of Object.entries(formInputs)) {                                
                formData.append(key, value);
            }
            formData.append('walletAddress', address);

            // Upload certificate (backend will prompt MetaMask for signing)
            const response = await fetch(`/api/documents/new`, {
                method: 'POST',                
                body: formData
            });
            
            const data = await response.json();
            
            if (data.data === "ReadyToSign") {
                // Backend prepared data, now sign with MetaMask
                const contractConfig = await fetch('/contractConfig.json').then(r => r.json());
                const contract = new ethers.Contract(
                    data.contractAddress,
                    contractConfig.abi,
                    (await connectMetaMask()).signer
                );

                console.log('Calling smart contract...');
                const tx = await contract.setCertificate(
                    data.certificateParams.studentId,
                    data.certificateParams.documentHash,
                    data.certificateParams.studentName,
                    data.certificateParams.issuerID,
                    data.certificateParams.course,
                    data.certificateParams.certificateType,
                    data.certificateParams.yearOfGraduation
                );

                console.log('Waiting for confirmation...');
                const receipt = await tx.wait();
                console.log('Transaction confirmed:', receipt.transactionHash);

                // Save certificate and send email
                await fetch('/api/documents/saveCertificate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionHash: receipt.transactionHash,
                        fileName: data.fileName,
                        studentEmail: formInputs.studentEmail,
                        studentName: formInputs.studentName,
                        studentId: formInputs.studentId, 
                        testnet: formInputs.testnet
                    })
                });

                setIsUploading(false);
                alert(`Certificate issued successfully!\n\nTransaction: ${receipt.transactionHash}\n\nView on Sepolia Etherscan:\nhttps://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
                window.location.assign(`/dashboard`);
            } else if (data.dataError) {                
                setEtherErrorMsg(data.dataError);
                setIsUploading(false);   
            }
        } catch (error) {
            console.error('Submit error:', error);
            setEtherErrorMsg(error.message || 'Failed to submit certificate');
            setIsUploading(false);
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
        <Box sx={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 140px)', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: '32px', fontWeight: 700, color: '#111827', mb: 1 }}>
                        Issue Certificate
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '16px' }}>
                        Upload a certificate to store it permanently on the blockchain
                    </Typography>
                </Box>

                {/* Not Logged In */}
                {userData.userId === "" && (
                    <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                        Please log in to submit documents
                    </Alert>
                )}
                
                {/* No Contract Deployed */}
                {userData.userId !== "" && userData.contractAddress?.length === 0 && (
                    <Box sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        p: 4,
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <Typography sx={{ color: '#ef4444', fontWeight: 600, mb: 2 }}>
                            No Smart Contract Deployed
                        </Typography>
                        <Typography sx={{ color: '#6b7280', mb: 3 }}>
                            You need to deploy a smart contract before you can issue certificates.
                        </Typography>
                        <DeployPopup method="deploy" />
                    </Box>
                )}

                {/* Main Form */}
                {userData.userId !== "" && userData.contractAddress?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Form Card */}
                        <Box sx={{ 
                            flex: 2,
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            p: 4,
                            border: '1px solid #e5e7eb'
                        }}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
                                Certificate Details
                            </Typography>

                            {etherErrorMsg && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                                    {etherErrorMsg}
                                </Alert>
                            )}

                            <form noValidate autoComplete="off">
                                {/* Network Selection */}
                                <FormControl fullWidth sx={{ mb: 2.5 }}>
                                    <InputLabel>Select Network</InputLabel>
                                    <Select
                                        name="testnet"
                                        value={formInputs.testnet}
                                        label="Select Network"
                                        onChange={handleInputChange}
                                        error={errors?.testnetError}
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

                                {/* File Upload */}
                                <Box sx={{ 
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '10px',
                                    p: 3,
                                    textAlign: 'center',
                                    mb: 2.5,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: '#2563eb', backgroundColor: '#f8fafc' }
                                }}>
                                    <input
                                        type="file"
                                        id="file-input"
                                        name="studentFile"
                                        accept=".pdf"
                                        onChange={handleInputChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                                        {fileName ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <CheckCircleOutlineIcon sx={{ color: '#10b981' }} />
                                                <Typography sx={{ color: '#111827', fontWeight: 500 }}>{fileName}</Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <UploadFileIcon sx={{ fontSize: 40, color: '#9ca3af', mb: 1 }} />
                                                <Typography sx={{ color: '#6b7280' }}>Click to upload certificate PDF</Typography>
                                            </>
                                        )}
                                    </label>
                                </Box>
                                {errors?.fileError && (
                                    <Typography sx={{ color: '#dc2626', fontSize: '13px', mb: 2 }}>
                                        {errors.file}
                                    </Typography>
                                )}

                                <TextField
                                    fullWidth
                                    name="studentId"
                                    label="Student ID"
                                    onChange={handleInputChange}
                                    error={errors?.studentIdError}
                                    helperText={errors?.studentId || ''}
                                    sx={inputStyle}
                                />

                                <TextField
                                    fullWidth
                                    name="studentName"
                                    label="Student Name"
                                    onChange={handleInputChange}
                                    error={errors?.studentNameError}
                                    helperText={errors?.studentName || ''}
                                    sx={inputStyle}
                                />

                                <TextField
                                    fullWidth
                                    name="studentEmail"
                                    label="Student Email"
                                    type="email"
                                    onChange={handleInputChange}
                                    error={errors?.studentEmailError}
                                    helperText={errors?.studentEmail || 'Certificate and verification link will be sent here'}
                                    sx={inputStyle}
                                />

                                <TextField
                                    fullWidth
                                    name="course"
                                    label="Course/Program"
                                    onChange={handleInputChange}
                                    helperText="e.g., Computer Science, Business Administration"
                                    sx={inputStyle}
                                />

                                <FormControl fullWidth sx={{ mb: 2.5 }}>
                                    <InputLabel>Certificate Type</InputLabel>
                                    <Select
                                        name="certificateType"
                                        value={formInputs.certificateType}
                                        label="Certificate Type"
                                        onChange={handleInputChange}
                                        sx={{ borderRadius: '10px' }}
                                    >
                                        <MenuItem value="">Select Type</MenuItem>
                                        <MenuItem value="High School Diploma">High School Diploma</MenuItem>
                                        <MenuItem value="Associate Degree">Associate Degree</MenuItem>
                                        <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
                                        <MenuItem value="Master's Degree">Master's Degree</MenuItem>
                                        <MenuItem value="Doctoral Degree">Doctoral Degree (PhD)</MenuItem>
                                        <MenuItem value="Professional Certificate">Professional Certificate</MenuItem>
                                        <MenuItem value="Course Completion">Course Completion</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    name="yearOfGraduation"
                                    label="Year of Graduation"
                                    type="number"
                                    onChange={handleInputChange}
                                    helperText="e.g., 2024"
                                    inputProps={{ min: 1900, max: 2100 }}
                                    sx={inputStyle}
                                />

                                {isUploading ? (
                                    <Box>
                                        <LinearProgress sx={{ borderRadius: '10px', height: '8px', mb: 2 }} />
                                        <Typography sx={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                                            {formInputs.testnet === 'sepolia' 
                                                ? 'Submitting to Sepolia testnet... MetaMask will prompt you to sign.' 
                                                : 'MetaMask will prompt you to sign the transaction...'}
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
                                        Issue Certificate on {formInputs.testnet === 'sepolia' ? 'Sepolia' : formInputs.testnet === 'localhost' ? 'Localhost' : 'Blockchain'}
                                    </Button>
                                )}
                            </form>
                        </Box>

                        {/* Sidebar */}
                        <Box sx={{ flex: 1 }}>
                            {/* Deployed Contracts */}
                            <Box sx={{ 
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                p: 3,
                                border: '1px solid #e5e7eb',
                                mb: 3
                            }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Active Contracts
                                </Typography>
                                {userData.contractAddress?.map((contract, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
                                            {contract.nameOfNet}
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '13px', 
                                            color: '#2563eb', 
                                            wordBreak: 'break-all',
                                            fontFamily: 'monospace'
                                        }}>
                                            {contract.address}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Wallet Info */}
                            <Box sx={{ 
                                backgroundColor: '#eff6ff',
                                borderRadius: '12px',
                                p: 3,
                                mb: 3
                            }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', mb: 1 }}>
                                    🦊 MetaMask Signing
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#3b82f6', lineHeight: 1.6 }}>
                                    Your wallet will sign the transaction to issue this certificate on the blockchain.
                                </Typography>
                            </Box>

                            {/* Gas Info */}
                            <Box sx={{ 
                                backgroundColor: '#eff6ff',
                                borderRadius: '12px',
                                p: 3
                            }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', mb: 1 }}>
                                    💡 Gas Requirement
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#3b82f6', lineHeight: 1.6 }}>
                                    Ensure you have at least 0.002 ETH in your wallet to cover transaction fees.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}