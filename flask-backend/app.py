import os
import sqlite3
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import time

app = Flask(__name__)
CORS(app)

# Secret key for JWT
SECRET_KEY = os.environ.get('SECRET_KEY', 'ctf_secret_key_2024')
NODE_SERVICE_URL = os.environ.get('NODE_SERVICE_URL', 'http://node-service:3000')

# Obfuscated admin credentials
_0x1a2b = lambda x: ''.join([chr(ord(c) ^ 42) for c in x])
_0x3c4d = _0x1a2b('\x7f\x7e\x73\x76\x74\x1e\x7f\x7e\x73\x76\x74')  # admin:admin

# Initialize database
def init_db():
    try:
        # Ensure data directory exists
        os.makedirs('/app/data', exist_ok=True)
        
        conn = sqlite3.connect('/app/data/ctf.db')
        cursor = conn.cursor()
        
        # Users table with Blind SQLi vulnerability
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            )
        ''')
        
        # Secrets table with flags
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS secrets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flag TEXT NOT NULL,
                description TEXT
            )
        ''')
        
        # Insert default data
        try:
            cursor.execute("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')")
            cursor.execute("INSERT INTO users (username, password, role) VALUES ('guest', 'guest123', 'user')")
            cursor.execute("INSERT INTO secrets (flag, description) VALUES ('FLAG{bl1nd_sql1_m4st3r}', 'SQL Injection Flag')")
            cursor.execute("INSERT INTO secrets (flag, description) VALUES ('FLAG{ssrf_cl0ud_pwn3d}', 'SSRF Flag')")
        except sqlite3.IntegrityError:
            pass
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

init_db()

@app.route('/')
def index():
    return jsonify({
        'service': 'Flask Backend',
        'version': '1.0',
        'endpoints': ['/login', '/fetch', '/health', '/hints'],
        'hint': 'Stuck? Try /hints?vuln=sqli&level=1'
    })

# Blind SQL Injection vulnerability
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    # Vulnerable SQL query - Blind SQLi
    conn = sqlite3.connect('/app/data/ctf.db')
    cursor = conn.cursor()
    
    # Intentionally vulnerable query
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    
    try:
        cursor.execute(query)
        user = cursor.fetchone()
        conn.close()
        
        if user:
            # Generate JWT token
            token = jwt.encode({
                'user_id': user[0],
                'username': user[1],
                'role': user[3],
                'exp': time.time() + 3600
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'token': token,
                'role': user[3]
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
    except Exception as e:
        conn.close()
        # Don't reveal the error - Blind SQLi
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

# SSRF vulnerability
@app.route('/fetch', methods=['POST'])
def fetch_url():
    data = request.get_json()
    url = data.get('url', '')
    
    if not url:
        return jsonify({'error': 'URL parameter required'}), 400
    
    # Vulnerable SSRF - no URL validation
    try:
        # Intentionally vulnerable - allows internal requests
        response = requests.get(url, timeout=5)
        return jsonify({
            'status': response.status_code,
            'content': response.text,
            'headers': dict(response.headers)
        })
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

# Admin endpoint (requires admin role)
@app.route('/admin', methods=['GET'])
def admin_panel():
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return jsonify({
            'message': 'Welcome to admin panel',
            'flag': 'FLAG{http_r3qu3st_smug1ing_pwn}',
            'admin_data': 'Sensitive information here'
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

# Get secrets (for testing)
@app.route('/secrets', methods=['GET'])
def get_secrets():
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        conn = sqlite3.connect('/app/data/ctf.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM secrets")
        secrets = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'secrets': [{'id': s[0], 'flag': s[1], 'description': s[2]} for s in secrets]
        })
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'flask-backend'})

@app.route('/hints', methods=['GET'])
def get_hints():
    """Progressive hints for CTF challenges"""
    vuln = request.args.get('vuln', '').lower()
    level = request.args.get('level', '1')
    
    hints = {
        'sqli': {
            '1': "🔍 The login endpoint doesn't sanitize user input. Try testing with a single quote (') character.",
            '2': "💡 Boolean-based blind SQLi works here. Try: admin' OR '1'='1' --",
            '3': "🎯 There's a 'secrets' table with a 'flag' column. Use UNION SELECT to extract it.",
            '4': "🎯 Technical Details: The query has 4 columns. Table name is 'secrets', column name is 'flag'. Research UNION SELECT syntax to extract data with proper column alignment."
        },
        'ssrf': {
            '1': "🔍 The /fetch endpoint makes HTTP requests to any URL. Can you reach internal services?",
            '2': "💡 Try targeting internal Docker services: http://mock-cloud:8000/metadata",
            '3': "🎯 The mock cloud metadata service contains AWS-style secrets and flags.",
            '4': "🎯 Technical Details: Internal service URL is http://mock-cloud:8000/metadata. Send POST request to /api/fetch with JSON payload containing 'url' field. Research SSRF POST request structure."
        },
        'code_injection': {
            '1': "🔍 The calculator endpoint in Node service evaluates expressions. What if you send more than math?",
            '2': "💡 JavaScript eval() is dangerous. Try accessing: process.env",
            '3': "🎯 Environment variables often contain secrets. Try: process.env.HIDDEN_FLAG",
            '4': "🎯 Technical Details: Environment variable name is HIDDEN_FLAG. Endpoint is /api/calc accepting 'expression' field. Research how to access process.env properties in JavaScript."
        },
        'jwt': {
            '1': "🔍 JWT tokens can be forged if the algorithm isn't strictly validated.",
            '2': "💡 Try creating a JWT with 'alg': 'none in the header.",
            '3': "🎯 The verification endpoint accepts tokens with no signature when algorithm is 'none'.",
            '4': "🎯 Technical Details: Use /api/auth/verify endpoint. Required claims: 'username' and 'role'. Research JWT 'none' algorithm structure: base64(header).base64(payload). (note the trailing dot)"
        },
        'xss': {
            '1': "🔍 The comments section directly renders HTML without sanitization.",
            '2': "💡 Try injecting: <script>alert('XSS')</script>",
            '3': "🎯 Stored XSS persists across page reloads. Your payload will execute for all users.",
            '4': "🎯 Technical Details: After successful XSS, check browser's JavaScript console (F12). The flag is logged via console.log(). Research how to trigger and inspect console output."
        },
        'smuggling': {
            '1': "🔍 HTTP request smuggling exploits differences in how proxies and backends parse requests.",
            '2': "💡 Try sending conflicting Content-Length and Transfer-Encoding headers.",
            '3': "🎯 Nginx proxy and Flask backend disagree on message boundaries (CL.TE).",
            '4': "🎯 Technical Details: Target endpoint is /api/admin. Use CL.TE technique with Transfer-Encoding: chunked. Research how to embed 'GET /api/admin HTTP/1.1' in chunked body."
        },
        'cache_poisoning': {
            '1': "🔍 Nginx uses X-Forwarded-Host header in its cache key without validation.",
            '2': "💡 Send a request with custom X-Forwarded-Host header to poison the cache.",
            '3': "🎯 Subsequent requests will receive the poisoned cached response.",
            '4': "🎯 Technical Details: Header name is 'X-Forwarded-Host'. Check 'X-Cache-Status' in response to verify caching. Flag appears in response body after cache is poisoned. Research curl -H syntax."
        },
        'cloud_metadata': {
            '1': "🔍 Cloud platforms expose metadata at 169.254.169.254. Can you access it via SSRF?",
            '2': "💡 Combine SSRF vulnerability with cloud metadata endpoint access.",
            '3': "🎯 The mock-cloud service simulates AWS metadata API with IAM credentials.",
            '4': "🎯 Technical Details: Use SSRF at /api/fetch to reach http://mock-cloud:8000/metadata. The service runs on internal Docker network. Research chaining SSRF exploits."
        }
    }
    
    if vuln not in hints:
        return jsonify({
            'available_challenges': list(hints.keys()),
            'usage': '/hints?vuln=sqli&level=1',
            'levels': '1 (easiest) to 4 (advanced guidance)'
        })
    
    if level not in hints[vuln]:
        level = '1'
    
    return jsonify({
        'challenge': vuln,
        'level': level,
        'hint': hints[vuln][level],
        'next_level': str(int(level) + 1) if int(level) < 4 else 'No more hints!'
    })

if __name__ == '__main__':
    print("Starting Flask Backend on port 5000...")
    print(f"SECRET_KEY: {SECRET_KEY[:20]}...")
    print(f"NODE_SERVICE_URL: {NODE_SERVICE_URL}")
    app.run(host='0.0.0.0', port=5000, debug=False)
