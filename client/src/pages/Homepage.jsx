import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedIcon from '@mui/icons-material/Verified';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';

function Homepage() {
  const userData = useContext(UserContext);
  const history = useHistory();
  const [txHash, setTxHash] = useState('');

  const handleQuickVerify = () => {
    if (txHash.trim()) {
      history.push(`/documents/localhost/${txHash.trim()}`);
    }
  };

  const features = [
    {
      icon: <LockIcon sx={{ fontSize: 40, color: '#2563eb' }} />,
      title: 'Immutable Security',
      description: 'Certificates stored on Ethereum blockchain cannot be altered or forged by anyone.'
    },
    {
      icon: <BoltIcon sx={{ fontSize: 40, color: '#7c3aed' }} />,
      title: 'Instant Verification',
      description: 'Verify any certificate in seconds with just a transaction hash or QR code.'
    },
    {
      icon: <PublicIcon sx={{ fontSize: 40, color: '#2563eb' }} />,
      title: 'Global Recognition',
      description: 'Blockchain verification accepted worldwide by employers and institutions.'
    }
  ];

  const stats = [
    { number: '100%', label: 'Tamper-Proof' },
    { number: '24/7', label: 'Verification' },
    { number: '∞', label: 'Validity Period' }
  ];

  return (
    <Box sx={{ backgroundColor: '#fafbfc' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 12, md: 16 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            {/* Badge */}
            <Box sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              backgroundColor: '#eff6ff',
              borderRadius: '20px',
              mb: 4
            }}>
              <SecurityIcon sx={{ fontSize: 16, color: '#2563eb' }} />
              <Typography sx={{ color: '#2563eb', fontSize: '14px', fontWeight: 500 }}>
                Powered by Ethereum Blockchain
              </Typography>
            </Box>

            {/* Heading */}
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '36px', md: '56px' },
              fontWeight: 800,
              color: '#111827',
              lineHeight: 1.1,
              mb: 3
            }}>
              Academic Certificates,{' '}
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Verified Forever
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography sx={{ 
              fontSize: { xs: '16px', md: '20px' },
              color: '#6b7280',
              lineHeight: 1.6,
              mb: 5,
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Issue tamper-proof certificates on the blockchain. Verify authenticity instantly. Eliminate fraud permanently.
            </Typography>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {userData?.userId ? (
                <Button
                  href="/submitDoc"
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                    }
                  }}
                >
                  Submit Document →
                </Button>
              ) : (
                <Button
                  href="/signup"
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                    }
                  }}
                >
                  Get Started Free →
                </Button>
              )}
              <Button
                href="/verify"
                sx={{
                  backgroundColor: 'white',
                  color: '#374151',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#d1d5db'
                  }
                }}
              >
                Verify Certificate
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Quick Verify Section */}
      <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          p: { xs: 3, md: 5 },
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <VerifiedIcon sx={{ color: '#2563eb' }} />
            <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Quick Verify
            </Typography>
          </Box>
          <Typography sx={{ color: '#6b7280', mb: 3, fontSize: '15px' }}>
            Enter a transaction hash to instantly verify any certificate
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              placeholder="Enter transaction hash (0x...)"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#fafbfc',
                  '&:hover fieldset': { borderColor: '#2563eb' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                }
              }}
            />
            <Button
              onClick={handleQuickVerify}
              sx={{
                backgroundColor: '#111827',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1f2937' }
              }}
            >
              Verify
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ 
                  fontSize: '48px', 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stat.number}
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '16px', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ 
              fontSize: { xs: '28px', md: '36px' }, 
              fontWeight: 700, 
              color: '#111827',
              mb: 2
            }}>
              Why Choose BACV?
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '18px' }}>
              Built for institutions that demand the highest standards
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ 
                  p: 4,
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#111827', mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography sx={{ 
            fontSize: { xs: '28px', md: '36px' }, 
            fontWeight: 700, 
            color: '#111827',
            mb: 2
          }}>
            How It Works
          </Typography>
          <Typography sx={{ color: '#6b7280', fontSize: '18px' }}>
            Simple process for institutions and verifiers
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { step: '01', title: 'Register Institution', desc: 'Create your institution account and deploy your smart contract' },
            { step: '02', title: 'Issue Certificate', desc: 'Upload certificate PDF and student details to the blockchain' },
            { step: '03', title: 'Share & Verify', desc: 'Students share QR code or link for instant verification' }
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ 
                  fontSize: '64px', 
                  fontWeight: 800, 
                  color: '#e5e7eb',
                  lineHeight: 1
                }}>
                  {item.step}
                </Typography>
                <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#111827', mt: 2, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: '#6b7280' }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        py: 10
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
            <Typography sx={{ 
              fontSize: { xs: '28px', md: '36px' }, 
              fontWeight: 700, 
              color: 'white',
              mb: 2
            }}>
              Ready to Secure Your Certificates?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', mb: 4 }}>
              Join institutions worldwide using blockchain for tamper-proof credentials
            </Typography>
            <Button
              href="/signup"
              sx={{
                backgroundColor: 'white',
                color: '#2563eb',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              Get Started Free →
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Homepage;