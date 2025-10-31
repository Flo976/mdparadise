#!/usr/bin/env python3
"""
Markdown Server - Serveur local pour visualiser et éditer des fichiers Markdown
Lancer avec: python md_server.py
Accéder à: http://localhost:4444 ou http://<votre-ip>:4444
"""

from flask import Flask, render_template_string, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import glob
import markdown
from pathlib import Path
import socket

app = Flask(__name__)
CORS(app)

# Configuration
PORT = 4444
BASE_DIR = os.getcwd()

def get_local_ip():
    """Obtient l'IP locale pour l'accès LAN"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def get_all_markdown_files():
    """Récupère tous les fichiers .md du dossier courant et sous-dossiers"""
    md_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.venv', 'venv']]

        for file in files:
            if file.endswith('.md'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BASE_DIR)
                md_files.append({
                    'name': file,
                    'path': rel_path,
                    'dir': os.path.dirname(rel_path) or '.',
                    'size': os.path.getsize(full_path)
                })

    return sorted(md_files, key=lambda x: x['path'])

@app.route('/')
def index():
    """Page principale"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/files')
def list_files():
    """Liste tous les fichiers markdown"""
    try:
        files = get_all_markdown_files()
        return jsonify({'success': True, 'files': files, 'base_dir': BASE_DIR})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file/<path:filepath>')
def get_file(filepath):
    """Récupère le contenu d'un fichier"""
    try:
        full_path = os.path.join(BASE_DIR, filepath)

        # Sécurité: vérifier que le fichier est dans BASE_DIR
        if not os.path.abspath(full_path).startswith(os.path.abspath(BASE_DIR)):
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        if not os.path.exists(full_path):
            return jsonify({'success': False, 'error': 'Fichier non trouvé'}), 404

        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Convertir en HTML
        html = markdown.markdown(
            content,
            extensions=[
                'fenced_code',
                'tables',
                'toc',
                'nl2br',
                'codehilite',
                'extra'
            ]
        )

        return jsonify({
            'success': True,
            'content': content,
            'html': html,
            'path': filepath
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/file/<path:filepath>', methods=['POST'])
def save_file(filepath):
    """Sauvegarde le contenu d'un fichier"""
    try:
        full_path = os.path.join(BASE_DIR, filepath)

        # Sécurité
        if not os.path.abspath(full_path).startswith(os.path.abspath(BASE_DIR)):
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        data = request.get_json()
        content = data.get('content', '')

        # Créer les dossiers si nécessaire
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return jsonify({'success': True, 'message': 'Fichier sauvegardé'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Template HTML (voir ci-dessous)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Server</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/markdown/markdown.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/11.1.1/marked.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            overflow: hidden;
        }

        .container {
            display: flex;
            height: 100vh;
            background: white;
            margin: 20px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
            width: 300px;
            background: #2d3748;
            color: white;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #4a5568;
        }

        .sidebar-header {
            padding: 20px;
            background: #1a202c;
            border-bottom: 1px solid #4a5568;
        }

        .sidebar-header h1 {
            font-size: 1.5rem;
            margin-bottom: 5px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .sidebar-header .base-dir {
            font-size: 0.75rem;
            color: #a0aec0;
            word-break: break-all;
        }

        .search-box {
            padding: 15px;
            border-bottom: 1px solid #4a5568;
        }

        .search-box input {
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 6px;
            background: #1a202c;
            color: white;
            font-size: 0.9rem;
        }

        .search-box input::placeholder {
            color: #718096;
        }

        .files-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }

        .file-item {
            padding: 12px;
            margin-bottom: 5px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .file-item:hover {
            background: #374151;
            border-left-color: #667eea;
        }

        .file-item.active {
            background: #374151;
            border-left-color: #764ba2;
        }

        .file-name {
            font-weight: 500;
            margin-bottom: 3px;
        }

        .file-path {
            font-size: 0.75rem;
            color: #a0aec0;
        }

        /* Main content */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .toolbar {
            padding: 15px 20px;
            background: #f7fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .toolbar-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d3748;
        }

        .toolbar-actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #2d3748;
        }

        .btn-secondary:hover {
            background: #cbd5e0;
        }

        .content-area {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .editor-pane, .preview-pane {
            flex: 1;
            overflow-y: auto;
        }

        .editor-pane {
            border-right: 1px solid #e2e8f0;
        }

        .CodeMirror {
            height: 100% !important;
            font-size: 14px;
        }

        .preview-pane {
            padding: 30px;
            background: #ffffff;
        }

        .markdown-body {
            max-width: 100%;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #718096;
        }

        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }

        .save-indicator {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.3s;
        }

        .save-indicator.saved {
            background: #c6f6d5;
            color: #22543d;
        }

        .save-indicator.unsaved {
            background: #fed7d7;
            color: #742a2a;
        }

        .save-indicator.saving {
            background: #feebc8;
            color: #7c2d12;
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 250px;
            }

            .content-area {
                flex-direction: column;
            }

            .editor-pane, .preview-pane {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h1>📝 Markdown Server</h1>
                <div class="base-dir" id="baseDir">Chargement...</div>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="🔍 Rechercher un fichier...">
            </div>
            <div class="files-list" id="filesList">
                <div class="empty-state">
                    <div class="empty-state-icon">📂</div>
                    <div>Chargement des fichiers...</div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <div class="main-content">
            <div class="toolbar">
                <div class="toolbar-title" id="currentFile">Aucun fichier sélectionné</div>
                <div class="toolbar-actions">
                    <div class="save-indicator saved" id="saveIndicator">✓ Sauvegardé</div>
                    <button class="btn btn-secondary" id="toggleViewBtn">👁️ Vue seule</button>
                    <button class="btn btn-primary" id="saveBtn">💾 Sauvegarder</button>
                </div>
            </div>
            <div class="content-area">
                <div class="editor-pane" id="editorPane">
                    <textarea id="editor"></textarea>
                </div>
                <div class="preview-pane">
                    <div class="markdown-body" id="preview">
                        <div class="empty-state">
                            <div class="empty-state-icon">✨</div>
                            <h2>Bienvenue sur Markdown Server</h2>
                            <p>Sélectionnez un fichier pour commencer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentFilePath = null;
        let editor = null;
        let allFiles = [];
        let hasUnsavedChanges = false;

        // Initialiser CodeMirror
        function initEditor() {
            editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
                mode: 'markdown',
                theme: 'dracula',
                lineNumbers: true,
                lineWrapping: true,
                autofocus: true,
                extraKeys: {
                    "Ctrl-S": function() { saveCurrentFile(); },
                    "Cmd-S": function() { saveCurrentFile(); }
                }
            });

            editor.on('change', function() {
                if (currentFilePath) {
                    hasUnsavedChanges = true;
                    updateSaveIndicator('unsaved');
                    updatePreview();
                }
            });
        }

        // Charger la liste des fichiers
        async function loadFilesList() {
            try {
                const response = await fetch('/api/files');
                const data = await response.json();

                if (data.success) {
                    allFiles = data.files;
                    document.getElementById('baseDir').textContent = data.base_dir;
                    renderFilesList(allFiles);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }

        // Afficher la liste des fichiers
        function renderFilesList(files) {
            const filesList = document.getElementById('filesList');

            if (files.length === 0) {
                filesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div>Aucun fichier .md trouvé</div></div>';
                return;
            }

            filesList.innerHTML = files.map(file => `
                <div class="file-item" data-path="${file.path}">
                    <div class="file-name">📄 ${file.name}</div>
                    <div class="file-path">${file.dir}</div>
                </div>
            `).join('');

            // Ajouter les événements click
            document.querySelectorAll('.file-item').forEach(item => {
                item.addEventListener('click', () => loadFile(item.dataset.path));
            });
        }

        // Charger un fichier
        async function loadFile(filepath) {
            if (hasUnsavedChanges && !confirm('Vous avez des modifications non sauvegardées. Continuer ?')) {
                return;
            }

            try {
                const response = await fetch(`/api/file/${filepath}`);
                const data = await response.json();

                if (data.success) {
                    currentFilePath = filepath;
                    editor.setValue(data.content);
                    document.getElementById('currentFile').textContent = filepath;
                    document.getElementById('preview').innerHTML = data.html;

                    // Mettre à jour l'UI
                    document.querySelectorAll('.file-item').forEach(item => {
                        item.classList.toggle('active', item.dataset.path === filepath);
                    });

                    hasUnsavedChanges = false;
                    updateSaveIndicator('saved');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors du chargement du fichier');
            }
        }

        // Sauvegarder le fichier
        async function saveCurrentFile() {
            if (!currentFilePath) return;

            updateSaveIndicator('saving');

            try {
                const response = await fetch(`/api/file/${currentFilePath}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: editor.getValue() })
                });

                const data = await response.json();

                if (data.success) {
                    hasUnsavedChanges = false;
                    updateSaveIndicator('saved');
                } else {
                    alert('Erreur: ' + data.error);
                    updateSaveIndicator('unsaved');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la sauvegarde');
                updateSaveIndicator('unsaved');
            }
        }

        // Mettre à jour l'indicateur de sauvegarde
        function updateSaveIndicator(state) {
            const indicator = document.getElementById('saveIndicator');
            indicator.className = 'save-indicator ' + state;

            if (state === 'saved') {
                indicator.textContent = '✓ Sauvegardé';
            } else if (state === 'unsaved') {
                indicator.textContent = '● Non sauvegardé';
            } else if (state === 'saving') {
                indicator.textContent = '⏳ Sauvegarde...';
            }
        }

        // Mettre à jour la préview
        function updatePreview() {
            const content = editor.getValue();
            document.getElementById('preview').innerHTML = marked.parse(content);
        }

        // Toggle vue éditeur/preview
        let viewMode = 'both';
        document.getElementById('toggleViewBtn').addEventListener('click', function() {
            const editorPane = document.getElementById('editorPane');
            const btn = this;

            if (viewMode === 'both') {
                editorPane.style.display = 'none';
                viewMode = 'preview';
                btn.textContent = '✏️ Éditer';
            } else if (viewMode === 'preview') {
                editorPane.style.display = 'flex';
                editorPane.style.flex = '1';
                document.querySelector('.preview-pane').style.display = 'none';
                viewMode = 'editor';
                btn.textContent = '👁️ Preview';
            } else {
                editorPane.style.display = 'flex';
                editorPane.style.flex = '1';
                document.querySelector('.preview-pane').style.display = 'block';
                viewMode = 'both';
                btn.textContent = '👁️ Vue seule';
            }
        });

        // Recherche
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const search = e.target.value.toLowerCase();
            const filtered = allFiles.filter(file =>
                file.name.toLowerCase().includes(search) ||
                file.path.toLowerCase().includes(search)
            );
            renderFilesList(filtered);
        });

        // Bouton sauvegarder
        document.getElementById('saveBtn').addEventListener('click', saveCurrentFile);

        // Avertir avant de quitter avec des changements non sauvegardés
        window.addEventListener('beforeunload', function(e) {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Initialisation
        initEditor();
        loadFilesList();
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    local_ip = get_local_ip()
    print("\n" + "="*60)
    print("🚀 Markdown Server démarré !")
    print("="*60)
    print(f"\n📁 Dossier: {BASE_DIR}")
    print(f"\n🌐 Accès local:")
    print(f"   http://localhost:{PORT}")
    print(f"\n🌍 Accès réseau LAN:")
    print(f"   http://{local_ip}:{PORT}")
    print(f"\n💡 Conseil: Partagez l'URL réseau pour y accéder depuis d'autres appareils")
    print("\n⚠️  Appuyez sur Ctrl+C pour arrêter le serveur\n")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=PORT, debug=True)
