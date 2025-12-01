import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function VerifyDoc() {
    const { testnet, txnHash } = useParams();    
    const [certDetails, setCertDetails] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [fileInput, setFileInput] = useState();
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const getTxnData = async() => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/documents/verify/${testnet}/${txnHash}`, {
                method: 'GET',               
            });
            
            if(response.ok) {
                const data = await response.json();
                console.log(data);
                setCertDetails(data);
            }
        } catch (err) {
            console.log('Error fetching certificate:', err);
        }
        setIsLoading(false);
    }    

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
        setFileName(e.target.files[0]?.name || '');
        setVerificationResult(null);
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        const formData = new FormData();                                       
        formData.append("file", fileInput);        

        setIsUploading(true);
        const response = await fetch(`/api/documents/verifyIpfs`, {
            method: 'POST',                
            body: formData
        });
        const data = await response.json();
        
        if (data.ipfsHash) {
            setIsUploading(false); 
            if (data.ipfsHash === certDetails.documentHash) {
                setVerificationResult("match");
            } else {
                setVerificationResult("mismatch");
            }
        } else {                
            setVerificationResult("error");
            setIsUploading(false);
        }
    }

    useEffect(()=> {
        getTxnData();        
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ 
                minHeight: 'calc(100vh - 140px)', 
                backgroundColor: '#fafbfc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress sx={{ color: '#2563eb' }} />
                    <Typography sx={{ mt: 2, color: '#6b7280' }}>Loading certificate details...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 140px)', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ 
                        width: 64,
                        height: 64,
                        background: certDetails.isRevoked 
                            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                            : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                    }}>
                        {certDetails.isRevoked ? (
                            <WarningAmberIcon sx={{ fontSize: 32, color: 'white' }} />
                        ) : (
                            <VerifiedIcon sx={{ fontSize: 32, color: 'white' }} />
                        )}
                    </Box>
                    <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                        Certificate Verification
                    </Typography>
                </Box>

                {/* Revoked Warning */}
                {certDetails.isRevoked && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3, 
                            borderRadius: '12px',
                            '& .MuiAlert-message': { width: '100%' }
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', mb: 1 }}>
                            ⚠️ THIS CERTIFICATE HAS BEEN REVOKED
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                            This certificate is no longer valid. It was revoked by the issuing institution.
                        </Typography>
                        {certDetails.revocationReason && (
                            <Typography sx={{ fontSize: '14px' }}>
                                <strong>Reason:</strong> {certDetails.revocationReason}
                            </Typography>
                        )}
                    </Alert>
                )}

                {/* Valid Certificate Badge */}
                {!certDetails.isRevoked && (
                    <Alert 
                        severity="success" 
                        sx={{ mb: 3, borderRadius: '12px' }}
                        icon={<CheckCircleIcon />}
                    >
                        <Typography sx={{ fontWeight: 600 }}>
                            ✓ This certificate is VALID on the blockchain
                        </Typography>
                    </Alert>
                )}

                {/* Certificate Details Card */}
                <Box sx={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    p: 4,
                    border: '1px solid #e5e7eb',
                    mb: 3,
                    opacity: certDetails.isRevoked ? 0.85 : 1
                }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
                        Certificate Details
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 3 }}>
                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 1, minWidth: '200px' }}>
                                <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                    Student Name
                                </Typography>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                    {certDetails.studentName || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: '200px' }}>
                                <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                    Student ID
                                </Typography>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#2563eb' }}>
                                    {certDetails.studentId || 'N/A'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                    Student Email
                                </Typography>
                                <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>
                                    {certDetails.studentEmail}
                                </Typography>
                            </Box>
                        </Box>

                        {(certDetails.course || certDetails.certificateType || certDetails.yearOfGraduation) && (
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {certDetails.course && (
                                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Course/Program
                                        </Typography>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                                            {certDetails.course}
                                        </Typography>
                                    </Box>
                                )}
                                {certDetails.certificateType && (
                                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Certificate Type
                                        </Typography>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                                            {certDetails.certificateType}
                                        </Typography>
                                    </Box>
                                )}
                                {certDetails.yearOfGraduation && (
                                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                            Year of Graduation
                                        </Typography>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                                            {certDetails.yearOfGraduation}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box>
                            <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                Issued By
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                                    {certDetails.issuerName || 'Unknown Institution'}
                                </Typography>
                                {certDetails.domainValidated ? (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5,
                                        backgroundColor: '#ecfdf5',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '4px'
                                    }}>
                                        <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                        <Typography sx={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>
                                            Verified
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5,
                                        backgroundColor: '#fef3c7',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '4px'
                                    }}>
                                        <Typography sx={{ fontSize: '12px', color: '#d97706', fontWeight: 500 }}>
                                            Unverified
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>
                                Document Hash
                            </Typography>
                            <Box sx={{ 
                                backgroundColor: '#f9fafb',
                                p: 2,
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <Typography sx={{ 
                                    fontSize: '13px', 
                                    color: '#2563eb', 
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }}>
                                    {certDetails.documentHash || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Document Verification Card */}
                <Box sx={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    p: 4,
                    border: '1px solid #e5e7eb'
                }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
                        Verify Document Authenticity
                    </Typography>
                    <Typography sx={{ color: '#6b7280', mb: 3 }}>
                        Upload the certificate PDF to check if it matches the blockchain record
                    </Typography>

                    <form>
                        <Box sx={{ 
                            border: '2px dashed #e5e7eb',
                            borderRadius: '12px',
                            p: 4,
                            textAlign: 'center',
                            mb: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#2563eb', backgroundColor: '#f8fafc' }
                        }}>
                            <input
                                type="file"
                                id="verify-file-input"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="verify-file-input" style={{ cursor: 'pointer' }}>
                                {fileName ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <CheckCircleIcon sx={{ color: '#10b981' }} />
                                        <Typography sx={{ color: '#111827', fontWeight: 500 }}>{fileName}</Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <UploadFileIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 1 }} />
                                        <Typography sx={{ color: '#6b7280' }}>Click to upload certificate PDF</Typography>
                                    </>
                                )}
                            </label>
                        </Box>

                        {isUploading ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <CircularProgress sx={{ color: '#2563eb' }} />
                            </Box>
                        ) : (
                            <Button
                                fullWidth
                                onClick={handleSubmit}
                                disabled={!fileName}
                                sx={{
                                    background: fileName ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' : '#e5e7eb',
                                    color: fileName ? 'white' : '#9ca3af',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: fileName ? 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' : '#e5e7eb',
                                    }
                                }}
                            >
                                Verify Document
                            </Button>
                        )}
                    </form>

                    {/* Verification Result */}
                    {verificationResult === "match" && (
                        <Alert 
                            severity="success" 
                            sx={{ mt: 3, borderRadius: '10px' }}
                            icon={<CheckCircleIcon />}
                        >
                            <Typography sx={{ fontWeight: 600 }}>✓ VERIFIED: Document hash matches!</Typography>
                            <Typography sx={{ fontSize: '14px' }}>
                                The uploaded certificate is authentic and has not been tampered with.
                            </Typography>
                        </Alert>
                    )}
                    {verificationResult === "mismatch" && (
                        <Alert 
                            severity="error" 
                            sx={{ mt: 3, borderRadius: '10px' }}
                            icon={<CancelIcon />}
                        >
                            <Typography sx={{ fontWeight: 600 }}>✗ VERIFICATION FAILED: Hash mismatch!</Typography>
                            <Typography sx={{ fontSize: '14px' }}>
                                The uploaded document does not match the original. It may have been tampered with.
                            </Typography>
                        </Alert>
                    )}
                    {verificationResult === "error" && (
                        <Alert severity="warning" sx={{ mt: 3, borderRadius: '10px' }}>
                            Could not verify the file. Please try again.
                        </Alert>
                    )}
                </Box>
            </Container>
        </Box>
    );
}