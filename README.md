# 🏁 JOB_CTF – Plaidnox Security Challenge

Welcome to the Plaidnox Job CTF assessment!  
This small challenge is designed to evaluate your practical security skills, ability to analyze vulnerabilities, write reports, and present a clear Proof-of-Concept (PoC).

> **This CTF is part of the interview round for security engineering, automation, and cloud roles at Plaidnox.**

---

## 🏗️ CTF Architecture

This challenge includes multiple services with various vulnerabilities:

- **Flask Backend** (Port 5000): SQLi, SSRF vulnerabilities
- **Node.js Service** (Port 3000): JWT, Code Injection
- **Nginx Proxy** (Port 80, 8080): Request Smuggling, Cache Poisoning
- **Frontend** (Port 8081): XSS vulnerability
- **Mock Cloud Service** (Port 8000): Simulates AWS metadata endpoint

### 🚀 Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 💡 Need Hints?

Stuck on a challenge? Use the built-in progressive hints system:

```bash
# Get a hint via API
curl "http://localhost/api/flask/hints?vuln=sqli&level=1"

# Or use the web UI - click "💡 Hints" in the navigation
```

**Hint Levels:** 1 (gentle) → 2 (technique) → 3 (details) → 4 (solution)  
See **[HINTS.md](HINTS.md)** for complete documentation.

## 🎯 Objective

Your goal is to:

- Identify vulnerabilities hidden in this challenge.
- Capture the flags (`FLAG{...}` format).
- Create a findings report (DOCX preferred, PDF also accepted).
- Include PoCs for each vulnerability.
- Submit your report to our review team.

---

## 📄 What You Need to Submit

### 1. Flags

List **all** the flags you found in the format:

```
FLAG 1: FLAG{...}
FLAG 2: FLAG{...}
(There are 8 total flags to find)
```

### 2. Findings Report (Word Document)

Your report should include:

- **A. Vulnerability Title**  
  _Short and clear (e.g., SQL Injection in Login Endpoint)_

- **B. Description**  
  _Simple explanation of the issue and where it exists._

- **C. Impact (One-Line)**  
  _e.g., “Account takeover possible”, “Data leakage”, “Privilege escalation”._

- **D. Proof of Concept (PoC)**  
  _Any format accepted:_
    - Screenshot
    - Curl command
    - Code snippet
    - Reproduction steps

- **E. Remediation**  
  _Clear fix recommendations in 2–3 lines._

---

## Report Format Template (Copy This)

```
## Vulnerability #1 – <Name>

### Description
<Explain the vulnerability in simple words.>

### Impact
<One line impact – what could happen if exploited?>

### Proof of Concept (PoC)
<Show screenshots, steps, curl requests, payload, etc.>

### Remediation
<Explain how to fix it.>
```

_Repeat this for all vulnerabilities you find._

---

## 🧪 Testing & Automation

### Automated Testing Scripts

Three Python scripts are provided for testing:

1. **test_exploits.py** - Tests all 8 vulnerabilities automatically
   ```bash
   python3 test_exploits.py
   ```

2. **exploit_toolkit.py** - Advanced exploitation framework
   ```bash
   python3 exploit_toolkit.py
   ```

3. **test_hints.py** - Tests the hints system (NEW)
   ```bash
   python3 test_hints.py
   ```

### Manual Testing

Access the web interface:
- **Frontend**: http://localhost
- **Hints UI**: Click "💡 Hints" button in navigation

## 📤 Submission Instructions

Email your final report to:

- **Email**: info@plaidnox.com  
- **Subject**: `JOB_CTF Submission – <Your Name>`

**Attach:**
- DOCX report (mandatory)
- Any PoC files, screenshots, code snippets
- List of Flags

---

## 📚 Additional Resources

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - ⚡ One-page cheat sheet for all commands
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed installation and configuration
- **[VULNERABILITIES.md](VULNERABILITIES.md)** - Complete exploitation reference
- **[HINTS.md](HINTS.md)** - Progressive hints when you're stuck
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing scripts documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview
- **[COMMANDS.md](COMMANDS.md)** - Comprehensive command reference
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide

## Rules

- Do **not** use automated tools only—manual understanding matters.
- Do **not** attack domains outside the CTF environment.
- Write your report clearly and professionally.
- Partial findings are still accepted—submit whatever you complete.

---

## 🏆 Evaluation Criteria

We review based on:

| Category              | Weight       |
|-----------------------|:-----------:|
| Correct Flags         | ⭐⭐⭐⭐        |
| Quality of Report     | ⭐⭐⭐⭐⭐       |
| Clarity of Explanation| ⭐⭐⭐         |
| PoC Depth             | ⭐⭐⭐⭐        |
| Remediation Accuracy  | ⭐⭐          |
| Professionalism       | ⭐⭐⭐⭐⭐       |

---

## 🚀 Good Luck!

Show us your best problem-solving, curiosity, and practical security skills.  
We’re excited to review your submission!
