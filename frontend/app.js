// API Endpoints - Route through Nginx proxy on port 80
const FLASK_API = 'http://localhost/api/flask';
const NODE_API = 'http://localhost/api/node';

let authToken = null;

console.log('%c🚩 CTF Challenge Platform', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cAPI Endpoints:', 'color: #764ba2; font-size: 14px;');
console.log(`Flask Backend: ${FLASK_API}`);
console.log(`Node.js Service: ${NODE_API}`);
console.log('%cHint: Look for vulnerabilities in login, calculator, URL fetcher, and comments!', 'color: #e74c3c;');

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Login Function
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const resultDiv = document.getElementById('login-result');
    
    if (!username || !password) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Please enter username and password';
        return;
    }
    
    try {
        // Try Flask login
        const response = await fetch(`${FLASK_API}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>Login Successful!</strong><br>
                Token: ${data.token.substring(0, 50)}...<br>
                Role: ${data.role}
            `;
            
            // Store token
            localStorage.setItem('authToken', data.token);
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Error: ' + error.message;
    }
}

// Calculator Function (Code Injection Vulnerability)
async function calculate() {
    const expression = document.getElementById('calc-expression').value;
    const resultDiv = document.getElementById('calc-result');
    
    if (!expression) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Please enter an expression';
        return;
    }
    
    try {
        const response = await fetch(`${NODE_API}/api/calc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>Result:</strong> ${data.result}<br>
                <small>Expression: ${data.expression}</small>
            `;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = data.error || 'Calculation failed';
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Error: ' + error.message;
    }
}

// URL Fetcher Function (SSRF Vulnerability)
async function fetchUrl() {
    const url = document.getElementById('fetch-url').value;
    const resultDiv = document.getElementById('fetch-result');
    
    if (!url) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Please enter a URL';
        return;
    }
    
    try {
        const response = await fetch(`${FLASK_API}/api/fetch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>Status:</strong> ${data.status}<br>
                <strong>Content:</strong><br>
                <pre>${data.content.substring(0, 500)}${data.content.length > 500 ? '...' : ''}</pre>
            `;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = data.error || 'Fetch failed';
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Error: ' + error.message;
    }
}

// Comments Function (XSS Vulnerability)
function addComment() {
    const name = document.getElementById('comment-name').value;
    const text = document.getElementById('comment-text').value;
    const commentsList = document.getElementById('comments-list');
    
    if (!name || !text) {
        alert('Please enter name and comment');
        return;
    }
    
    // VULNERABLE: Directly inserting user input into innerHTML
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    // NO SANITIZATION - XSS VULNERABILITY
    commentDiv.innerHTML = `
        <div class="comment-name">${name}</div>
        <div class="comment-text">${text}</div>
    `;
    
    commentsList.insertBefore(commentDiv, commentsList.firstChild);
    
    // Clear inputs
    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    
    // Hidden flag for XSS
    if (text.includes('<script>') || text.includes('onerror')) {
        console.log('%c🚩 FLAG{xss_st0r3d_0wn3d}', 'color: #2ecc71; font-size: 16px; font-weight: bold;');
    }
}

// Profile Function
async function getProfile() {
    const resultDiv = document.getElementById('profile-result');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Please login first';
        return;
    }
    
    try {
        const response = await fetch(`${NODE_API}/api/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <strong>Username:</strong> ${data.username}<br>
                <strong>Role:</strong> ${data.role}<br>
                <strong>Message:</strong> ${data.message}<br>
                ${data.flag ? `<strong>🚩 Flag:</strong> ${data.flag}` : ''}
            `;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = data.error || 'Failed to load profile';
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Error: ' + error.message;
    }
}

// Hints Function
async function getHint(level) {
    const vuln = document.getElementById('hint-vuln').value;
    const resultDiv = document.getElementById('hint-result');
    
    if (!vuln) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Please select a challenge first!';
        return;
    }
    
    try {
        const response = await fetch(`${FLASK_API}/hints?vuln=${vuln}&level=${level}`);
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.className = 'result success hint-display';
            resultDiv.innerHTML = `
                <div class="hint-header">
                    <strong>Challenge:</strong> ${data.challenge.toUpperCase()}<br>
                    <strong>Level:</strong> ${data.level} / 4
                </div>
                <div class="hint-content">
                    ${data.hint}
                </div>
                ${data.next_level !== 'No more hints!' ? 
                    `<div class="hint-next">💡 Need more help? Try Level ${data.next_level}</div>` : 
                    '<div class="hint-complete">✅ You have all the technical details. Time to exploit it!</div>'}
            `;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = 'Failed to load hint';
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = 'Error: ' + error.message;
    }
}

// Load some sample comments on page load
window.addEventListener('DOMContentLoaded', () => {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = `
        <div class="comment">
            <div class="comment-name">Admin</div>
            <div class="comment-text">Welcome to the CTF challenge! Try to find all the vulnerabilities.</div>
        </div>
        <div class="comment">
            <div class="comment-name">Security Tester</div>
            <div class="comment-text">I heard there are multiple flags hidden in this application. Good luck!</div>
        </div>
    `;
});
