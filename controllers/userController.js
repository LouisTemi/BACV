require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const EthereumNet = require('../models/ethereumNet');
const { requireAuth } = require('../middleware/authMiddleware');

// Error handling function
const handleErrors = (err) => {
    console.log("handleErrors function is called");  
    let errors = { email: '', password: '', token: '', wallet: '' };

    // Incorrect username
    if (err.message === "incorrect email") {
        errors.email = "This email or password is wrong";
    }

    // Incorrect password
    if (err.message === "incorrect password") {
        errors.password = "This email or password is wrong";
    }

    // Duplicate wallet address
    if (err.message === "duplicate wallet") {
        errors.wallet = "This wallet address is already registered to another account";
    }

    // Duplicate error code 
    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    // Validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(item => {
            errors[item.properties.path] = item.properties.message;            
        });
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60; // in seconds
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
};

// Create a user with MetaMask wallet
router.post('/signup', async (req, res) => {
    try {
        const { email, password, domain, issuer, walletAddress } = req.body;
        
        // Validate wallet address is provided
        if (!walletAddress || walletAddress === '') {
            return res.status(400).json({ 
                errors: { wallet: 'Please connect your MetaMask wallet' } 
            });
        }

        // Check if wallet address is already registered
        const existingWallet = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (existingWallet) {
            throw Error('duplicate wallet');
        }
        
        // Create user with MetaMask wallet address
        const user = await User.create({
            email,
            password, 
            domain, 
            domainValidated: false, 
            issuer, 
            walletAddress: walletAddress.toLowerCase() // Store in lowercase for consistency
        });
        
        const token = createToken(user._id);
        
        // Send cookie to browser
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('isLoggedIn', true, { maxAge: maxAge * 1000 });
        
        res.status(201).json({ 
            data: 'Success',
            userId: user._id,
            walletAddress: user.walletAddress
        });   
    }
    catch (err) {   
        console.log(err);                         
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
});

// Fetch a user through jwt
router.get('/jwt', requireAuth, async (req, res) => {
    try {        
        const user = await User.findOne({ _id: req.profile.id });
        const ethereumAdd = await EthereumNet.find({ userId: req.profile.id });
        
        res.status(201).json({
            userId: user._id, 
            email: user.email, 
            domain: user.domain, 
            issuer: user.issuer, 
            domainValidated: user.domainValidated,
            walletAddress: user.walletAddress,
            contractAddress: ethereumAdd
        });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password); // static method                
        const token = createToken(user._id);
        
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.cookie('isLoggedIn', true, { maxAge: maxAge * 1000 });
        
        res.status(200).json({ 
            userId: user._id, 
            email: user.email, 
            domain: user.domain, 
            issuer: user.issuer, 
            domainValidated: user.domainValidated,
            walletAddress: user.walletAddress
        });        
    }
    catch (err) {
        const errors = handleErrors(err);
        console.log(errors);
        res.status(400).json({ errors });
    }
});

// User signout
router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('isLoggedIn', '', { maxAge: 1 });
    res.status(200).json({ data: 'signed out' });
});

module.exports = router;