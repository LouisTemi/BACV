import React, { useContext } from 'react';
import { UserContext } from '../App.js';
import { Link, useHistory } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { useCookies } from 'react-cookie';

export default function Navbar() {
  const userData = useContext(UserContext);
  const [cookie, , removeCookie] = useCookies(['isLoggedIn']);
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await fetch('/api/users/logout', {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });
    removeCookie('isLoggedIn', { path: '/' });
    history.push('/');
    window.location.reload();
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 }, py: 1 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>B</Typography>
          </Box>
          <Typography sx={{ 
            fontWeight: 700, 
            fontSize: '22px', 
            color: '#111827',
            display: { xs: 'none', sm: 'block' }
          }}>
            BACV
          </Typography>
        </Link>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
          <Button 
            component={Link} 
            to="/"
            sx={{ 
              color: '#6b7280', 
              fontWeight: 500, 
              fontSize: '15px',
              textTransform: 'none',
              '&:hover': { color: '#111827', backgroundColor: 'transparent' }
            }}
          >
            Home
          </Button>
          <Button 
            component={Link} 
            to="/verify"
            sx={{ 
              color: '#6b7280', 
              fontWeight: 500, 
              fontSize: '15px',
              textTransform: 'none',
              '&:hover': { color: '#111827', backgroundColor: 'transparent' }
            }}
          >
            Verify
          </Button>

          {cookie.isLoggedIn ? (
            <>
              <Button 
                component={Link} 
                to="/submitDoc"
                sx={{ 
                  color: '#6b7280', 
                  fontWeight: 500, 
                  fontSize: '15px',
                  textTransform: 'none',
                  display: { xs: 'none', md: 'block' },
                  '&:hover': { color: '#111827', backgroundColor: 'transparent' }
                }}
              >
                Submit Doc
              </Button>
              <Button 
                component={Link} 
                to="/dashboard"
                sx={{ 
                  color: '#6b7280', 
                  fontWeight: 500, 
                  fontSize: '15px',
                  textTransform: 'none',
                  display: { xs: 'none', md: 'block' },
                  '&:hover': { color: '#111827', backgroundColor: 'transparent' }
                }}
              >
                Dashboard
              </Button>

              {/* User Menu */}
              <IconButton onClick={handleClick} sx={{ ml: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {getInitials(userData?.email)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    minWidth: '180px'
                  }
                }}
              >
                <MenuItem 
                  component={Link} 
                  to="/dashboard"
                  onClick={handleClose}
                  sx={{ py: 1.5, fontSize: '14px' }}
                >
                  Dashboard
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/submitDoc"
                  onClick={handleClose}
                  sx={{ py: 1.5, fontSize: '14px' }}
                >
                  Submit Document
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/settingPage"
                  onClick={handleClose}
                  sx={{ py: 1.5, fontSize: '14px' }}
                >
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={() => { handleClose(); handleLogout(); }}
                  sx={{ py: 1.5, fontSize: '14px', color: '#ef4444' }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login"
                sx={{ 
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { backgroundColor: '#f9fafb', borderColor: '#d1d5db' }
                }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/signup"
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                  }
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}