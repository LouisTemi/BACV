import React, {useState, useReducer} from 'react';
import {reducer} from '../utils/reducer';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const initialState = {    
    email: '',
    password: ''    
};  

export default function LoginPage({setLogin}) {
    const [formInputs, dispatch] = useReducer(reducer, initialState);
    const [errors, setErrors] = useState({});    
    const [backEndErrorMsg, setBackEndErrorMsg] = useState({
        email: '',
        password: ''
    });

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
        const {email, password} = formInputs;
        const newErrors = {};
        const verifyEmail = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;        
        
        if ( !email || email === '' ) {
            newErrors.email = 'Email cannot be blank';
            newErrors.emailError = true;
        } else if ( verifyEmail.test(email) === false ) {
            newErrors.email = 'Please enter a valid email address';
            newErrors.emailError = true;
        }

        if ( !password || password === '' ) {
            newErrors.password = 'Password cannot be blank'; 
            newErrors.passwordError = true;
        } else if ( password.length < 8 ) {
            newErrors.password = 'Password must be at least 8 characters';
            newErrors.passwordError = true;
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
            const response = await fetch("https://bacv-backend.onrender.com/api/users/login", {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formInputs)
            });            

            const data = await response.json();
            
            if(data.userId) {
                setLogin(true);
                window.location.assign('/');
            } else if (data.errors) {                        
                setBackEndErrorMsg(data.errors);
            }
        }
    };

    return (
        <Box sx={{ 
            minHeight: 'calc(100vh - 140px)', 
            backgroundColor: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
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
                            <LockOutlinedIcon sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', mb: 1 }}>
                            Welcome back
                        </Typography>
                        <Typography sx={{ color: '#6b7280' }}>
                            Sign in to your BACV account
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {(backEndErrorMsg.password || backEndErrorMsg.email) && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                            {backEndErrorMsg.password || backEndErrorMsg.email}
                        </Alert>
                    )}

                    {/* Form */}
                    <form noValidate autoComplete="off">
                        <TextField
                            fullWidth
                            id="email-input"
                            name="email"
                            label="Email Address"
                            variant="outlined"
                            type="email"
                            required
                            onChange={handleInputChange}
                            error={errors?.emailError}
                            helperText={errors?.email || ''}
                            sx={{ 
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    '&:hover fieldset': { borderColor: '#2563eb' },
                                    '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            id="password-input"
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            required
                            onChange={handleInputChange}
                            error={errors?.passwordError}
                            helperText={errors?.password || ''}
                            sx={{ 
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    '&:hover fieldset': { borderColor: '#2563eb' },
                                    '&.Mui-focused fieldset': { borderColor: '#2563eb' }
                                }
                            }}
                        />

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
                            Sign In
                        </Button>
                    </form>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography sx={{ color: '#6b7280', fontSize: '15px' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ 
                                color: '#2563eb', 
                                fontWeight: 600, 
                                textDecoration: 'none' 
                            }}>
                                Create one
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}