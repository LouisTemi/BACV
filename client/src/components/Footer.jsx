import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box 
      component="footer"
      sx={{ 
        mt: 'auto',
        py: 4,
        px: { xs: 3, md: 6 },
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}
    >
      <Box sx={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2
      }}>
        {/* Logo & Copyright */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>B</Typography>
          </Box>
          <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
            © {new Date().getFullYear()} BACV. All rights reserved.
          </Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            Home
          </Link>
          <Link to="/verify" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            Verify
          </Link>
          <Link to="/signup" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            Get Started
          </Link>
        </Box>

        {/* Tagline */}
        <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
          Blockchain Academic Certificate Verification
        </Typography>
      </Box>
    </Box>
  );
}