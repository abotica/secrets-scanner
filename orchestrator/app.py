import os
import tempfile
import shutil
from multiprocessing import Pool
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

import requests
from git import Repo
from git.exc import GitCommandError
from google import genai

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024 

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File is too large. Maximum allowed size is 10MB."}), 413

DATA_DIR = os.getenv('DATA_DIR', '/app/data')
SCANNER_URL = os.getenv('SCANNER_URL', 'http://scanner:8001')
MAX_WORKERS = 10  # Parallel scanning workers
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
DB_PATH = os.path.join(DATA_DIR, "scan_history.db")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

# --- DATABASE HELPERS ---
def get_db_connection():
    """Get a database connection with proper settings."""
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    """Initialize the SQLite database."""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            scan_type TEXT,
            target TEXT,
            summary TEXT,
            full_result TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB at module load (before Gunicorn forks workers with --preload)
init_db()

def save_scan_to_history(scan_type, target, result_dict):
    """Save a finished scan to the DB."""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # We save the summary separately for easy display in the list
        summary_json = json.dumps(result_dict.get('summary', {}))
        full_result_json = json.dumps(result_dict)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        c.execute('''
            INSERT INTO history (timestamp, scan_type, target, summary, full_result)
            VALUES (?, ?, ?, ?, ?)
        ''', (timestamp, scan_type, target, summary_json, full_result_json))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

# --- LLM HELPERS ---

def generate_mitigation_report(findings):
    """
    Send findings to Google Gemini API to generate a mitigation report.
    """
    if not GOOGLE_API_KEY:
        return "AI Report unavailable: API Key is missing."

    if not findings:
        return "No secrets found. Great job! No mitigation required."

    # Optimization: Take the first 15 to avoid using too many tokens
    limited_findings = findings[:15]
    
    prompt = f"""
You are a Senior Cyber Security Engineer. A static analysis tool found the following potential secrets in a codebase.

DATA DETECTED:
{str(limited_findings)}

TASK:
Generate a concise professional report in Markdown format. Be brief and focus only on the most critical information. Use clear headings and short paragraphs instead of numbered lists. Never show raw secrets in the report.

CONTENT:
- **Executive Summary**: One sentence describing the severity and scope.
- **Critical Files**: Only mention the most dangerous files with their secret types.
- **Immediate Actions**: Concise remediation steps (e.g., "Rotate the key", "Add to .gitignore").
- **Quote**: End with an inspiring cybersecurity quote in a blockquote (start with >).

Use markdown formatting with proper headings (##, ###) and emphasis. Keep text brief and actionable. No numbered lists.
    """

    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        
        return response.text
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Error generating AI report: {str(e)}"
    
# --- SCANNING HELPERS ---

def is_scannable_file(file_path: Path) -> bool:
    """Check if a file should be scanned."""
    # Skip hidden files and directories (like .git)
    return not any(part.startswith('.') for part in file_path.parts)


def scan_file(args: tuple) -> dict:
    """Send a file to the scanner service."""
    file_path, scanner_url = args
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        response = requests.post(
            f'{scanner_url}/scan',
            json={
                'filename': str(file_path),
                'content': content
            },
            timeout=30
        )

        if response.status_code == 200:
            return response.json()
        else:
            return {
                'filename': str(file_path),
                'error': f'Scanner returned status {response.status_code}'
            }
    except Exception as e:
        return {
            'filename': str(file_path),
            'error': str(e)
        }

def scan_local_path(local_path: str, scanner_url: str) -> dict:
    """Scan a local directory for secrets."""
    repo_path = Path(local_path)

    if not repo_path.exists():
        raise ValueError(f"Path does not exist: {local_path}")

    if not repo_path.is_dir():
        raise ValueError(f"Path is not a directory: {local_path}")

    # Find all scannable files
    files_to_scan = [
        f for f in repo_path.rglob('*')
        if f.is_file() and is_scannable_file(f.relative_to(repo_path))
    ]

    print(f"Found {len(files_to_scan)} files to scan")

    # Scan files in parallel using multiprocessing
    scan_args = [(file_path, scanner_url) for file_path in files_to_scan]
    with Pool(processes=MAX_WORKERS) as pool:
        results = pool.map(scan_file, scan_args)

    # Strip the base path from filenames to show relative paths only
    for result in results:
        if 'filename' in result:
            result['filename'] = str(Path(result['filename']).relative_to(repo_path))

    # Aggregate results
    files_with_secrets = [r for r in results if r.get('has_secrets', False)]
    files_with_errors = sum(1 for r in results if 'error' in r)
    files_scanned = len(results) - files_with_errors

#  Generate AI report based on findings
    print("Generating AI Report...")
    ai_report_text = generate_mitigation_report(files_with_secrets)

    return {
        'path': local_path,
        'summary': {
            'total_files_scanned': files_scanned,
            'files_with_secrets': len(files_with_secrets),
            'files_with_errors': files_with_errors
        },
        'findings': files_with_secrets,
        'all_results': results,
        'ai_report': ai_report_text
    }

def clone_and_scan_repo(repo_url: str, scanner_url: str) -> dict:
    """Clone a repository and scan all files."""
    temp_dir = tempfile.mkdtemp()

    try:
        # Clone the repository
        print(f"Cloning repository: {repo_url}")
        repo = Repo.clone_from(repo_url, temp_dir, depth=1)

        # Use the local scan function
        result = scan_local_path(temp_dir, scanner_url)
        result['repo_url'] = repo_url
        result.pop('path', None)
        return result

    except GitCommandError as e:
        raise PermissionError("This is a private repository or does not exist. Provide a GitHub token or check URL.")

    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

# --- ENDPOINTS ---

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    # Check if scanner is reachable
    try:
        response = requests.get(f'{SCANNER_URL}/health', timeout=5)
        scanner_healthy = response.status_code == 200
    except:
        scanner_healthy = False

    return jsonify({
        "status": "healthy" if scanner_healthy else "degraded",
        "scanner_status": "healthy" if scanner_healthy else "unhealthy"
    }), 200

@app.route('/scan-repo', methods=['POST'])
def scan_repo():
    """
    Scan a GitHub repository for secrets.

    Expected JSON body:
    {
        "repo_url": "https://github.com/user/repo.git",
        "github_token": "optional_token_for_private_repos"
    }
    """
    data = request.get_json()

    if not data or 'repo_url' not in data:
        return jsonify({"error": "Missing 'repo_url' field"}), 400

    repo_url = data['repo_url']
    github_token = data['github_token'] if 'github_token' in data else None

    # Validate URL
    if not repo_url.startswith(('https://github.com/', 'git@github.com:')):
        return jsonify({"error": "Only GitHub repositories are supported"}), 400


    try:
        auth_repo_url = repo_url

        if github_token:
            auth_repo_url = repo_url.replace('https://', f'https://{github_token}@')
        
        result = clone_and_scan_repo(auth_repo_url, SCANNER_URL)
        save_scan_to_history('git', repo_url, result)
        return jsonify(result), 200

    except PermissionError as e:
        return jsonify({"error": str(e)}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/scan-local', methods=['POST'])
def scan_local():
    """
    Scan a local directory for secrets.

    Expected JSON body:
    {
        "path": "/path/to/local/directory"
    }
    """
    data = request.get_json()

    if not data or 'path' not in data:
        return jsonify({"error": "Missing 'path' field"}), 400

    local_path = data['path']

    try:
        results = scan_local_path(local_path, SCANNER_URL)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/scan-upload', methods=['POST'])
def scan_upload():
    """
    Accepts a file upload, saves it temporarily, and uses existing scan_local_path logic.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '' or file.filename is None:
        return jsonify({"error": "No selected file"}), 400

    # Create a temporary directory to hold the uploaded file
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Save the uploaded file to the temp directory
        filename = file.filename
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        print(f"Scanning uploaded file at: {file_path}")

        # Scan the saved file using existing logic
        results = scan_local_path(temp_dir, SCANNER_URL)
        
        # Annotate results to indicate it was an uploaded file
        results['repo_url'] = f"Uploaded File: {filename}"
        
        # Remove internal path info
        results.pop('path', None)

        save_scan_to_history('upload', filename, results)
        return jsonify(results), 200

    except Exception as e:
        print(f"Error scanning upload: {e}")
        return jsonify({"error": str(e)}), 500
        
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.route('/scan-history', methods=['GET'])
def get_history():
    try:
        conn = get_db_connection()
        # Return results as dictionary
        conn.row_factory = sqlite3.Row 
        c = conn.cursor()
        
        # Get last 10 scans, newest first
        c.execute('SELECT id, timestamp, scan_type, target, summary, full_result FROM history ORDER BY id DESC LIMIT 10')
        rows = c.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "type": row["scan_type"],
                "target": row["target"],
                "summary": json.loads(row["summary"]),
                # We send the full result so clicking it loads it instantly
                "full_result": json.loads(row["full_result"]) 
            })
            
        conn.close()
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
