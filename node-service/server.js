const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Hidden flag in environment variable simulation
process.env.HIDDEN_FLAG = 'FLAG{c0d3_1nj3ct10n_pwn3d}';
process.env.JWT_FLAG = 'FLAG{jwt_alg0r1thm_c0nfus10n}';

// Obfuscated admin check
const _0x5a6b = (s) => Buffer.from(s, 'base64').toString('utf-8');
const _0x7c8d = _0x5a6b('YWRtaW4tc2VjcmV0LXRva2VuLTEyMzQ1'); // admin-secret-token-12345

app.get('/', (req, res) => {
    res.json({
        service: 'Node.js Service',
        'version': '1.0',
        endpoints: ['/calc', '/auth/login', '/auth/verify', '/profile'],
        hint: 'Need help? GET http://localhost/api/flask/hints?vuln=code_injection&level=1'
    });
});

// JWT Authentication - Vulnerable to algorithm confusion
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        // Vulnerable JWT - using HS256 but public key might be accessible
        const token = jwt.sign(
            { 
                username: username,
                role: 'admin',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60)
            },
            JWT_SECRET,
            { algorithm: 'HS256' }
        );
        
        return res.json({
            success: true,
            token: token,
            message: 'Login successful'
        });
    } else if (username === 'user' && password === 'user123') {
        const token = jwt.sign(
            { 
                username: username,
                role: 'user',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60)
            },
            JWT_SECRET,
            { algorithm: 'HS256' }
        );
        
        return res.json({
            success: true,
            token: token,
            message: 'Login successful'
        });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Vulnerable JWT verification - accepts 'none' algorithm
app.post('/auth/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }
    
    try {
        // Vulnerable: doesn't specify algorithms, accepts 'none'
        const decoded = jwt.decode(token, { complete: true });
        
        // If algorithm is 'none', skip verification
        if (decoded.header.alg === 'none') {
            return res.json({
                success: true,
                decoded: decoded.payload,
                flag: process.env.JWT_FLAG,
                message: 'Token verified with none algorithm!'
            });
        }
        
        // Normal verification
        const verified = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            decoded: verified,
            message: 'Token is valid'
        });
    } catch (err) {
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token',
            message: err.message 
        });
    }
});

// Code Injection vulnerability
app.post('/calc', (req, res) => {
    const { expression } = req.body;
    
    if (!expression) {
        return res.status(400).json({ error: 'Expression required' });
    }
    
    try {
        // VULNERABLE: Using eval() - allows code injection
        const result = eval(expression);
        
        res.json({
            expression: expression,
            result: result,
            message: 'Calculation successful'
        });
    } catch (err) {
        res.status(400).json({
            error: 'Invalid expression',
            message: err.message
        });
    }
});

// Profile endpoint - requires JWT
app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        username: req.user.username,
        role: req.user.role,
        message: 'Profile data',
        flag: req.user.role === 'admin' ? 'FLAG{jwt_auth_byp4ss}' : 'You need admin role'
    });
});

// Public key endpoint (for JWT algorithm confusion attack)
app.get('/public-key', (req, res) => {
    // Exposing the secret as if it's a public key - misconfiguration
    res.json({
        publicKey: JWT_SECRET,
        algorithm: 'RS256',
        note: 'Use this for JWT verification'
    });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        // Vulnerable: accepts any algorithm
        const decoded = jwt.decode(token, { complete: true });
        
        if (decoded.header.alg === 'none') {
            req.user = decoded.payload;
            return next();
        }
        
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'node-service' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node.js service running on port ${PORT}`);
    console.log(`Hidden flag: ${process.env.HIDDEN_FLAG}`);
});
