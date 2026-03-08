# Purple CLI — Guide d'Installation Windows

## Vue d'ensemble

**Purple CLI** est un agent IA local avec inférence via Ollama et appel d'outils MCP. Il fonctionne comme le runtime local du système multi-agents Purple Directive Violet qu'on a mis en place dans le repo Daggerheart Companion.

```
Cloud (Claude Code)                    Local (Purple CLI + Ollama)
  └── CLAUDE.md + .violet/               └── identity.md + brain + MCP tools
      ├── E.I.K. Advisory                    ├── purple-brain (mémoire + recherche)
      ├── 4 Operational Agents               ├── purple-docs (PDF, Excel, Word)
      └── Memory/shared/                     └── sequential-thinking (raisonnement)
                    │                                       │
                    └──────── même projet repo ─────────────┘
```

Le CLI local peut lire les fichiers du projet, interroger sa mémoire SQLite, chercher sur le web, et créer des documents — le tout en offline via Ollama.

---

## Prérequis

| Outil | Version | Téléchargement | Notes |
|-------|---------|----------------|-------|
| **Python** | 3.11+ | python.org/downloads | **Cocher "Add to PATH"** à l'installation |
| **Git** | Récent | git-scm.com/download/win | Git Bash inclus |
| **Ollama** | Récent | ollama.com/download/windows | Service Windows auto-start |
| **Node.js** | 18+ | nodejs.org | Pour le serveur MCP sequential-thinking |

### Vérification rapide (PowerShell)

```powershell
python --version    # Python 3.11+
git --version       # git version 2.x
ollama --version    # ollama version 0.x
node --version      # v18+ ou v20+
```

---

## Installation

### Option A : Script automatique

```powershell
# 1. Copier le script depuis le repo Daggerheart
#    (fichier .purple-local/setup-windows.ps1)

# 2. Lancer depuis PowerShell (en mode admin si nécessaire)
cd C:\chemin\vers\daggerheart-companion\.purple-local
.\setup-windows.ps1
```

### Option B : Installation manuelle

```powershell
# 1. Cloner le CLI dans ~/.purple
git clone https://github.com/PurpleDirective/purple-directive-cli.git $env:USERPROFILE\.purple

# 2. Créer l'environnement virtuel
cd $env:USERPROFILE\.purple
python -m venv venv

# 3. Activer et installer les dépendances
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 4. Créer les répertoires
mkdir sessions, memory, knowledge -Force
mkdir teaching\queue, teaching\compiled, teaching\audit, teaching\verify, teaching\finetune -Force

# 5. Configurer MCP (voir section suivante)

# 6. Configurer l'identité (voir section suivante)
```

---

## Configuration

### 1. MCP Servers (`config/mcp.json`)

Le fichier `config/mcp.json` doit pointer vers le Python du venv **avec des forward slashes** :

```json
{
  "servers": {
    "purple-brain": {
      "command": ["C:/Users/TON_USER/.purple/venv/Scripts/python.exe", "brain/server.py"],
      "enabled": true
    },
    "purple-docs": {
      "command": ["C:/Users/TON_USER/.purple/venv/Scripts/python.exe", "docs/server.py"],
      "enabled": true
    },
    "sequential-thinking": {
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "enabled": true
    }
  }
}
```

> **Important :** Remplace `TON_USER` par ton nom d'utilisateur Windows. Le script `setup-windows.ps1` fait ça automatiquement.

### 2. Identité Violet (`identity/identity.md`)

Copier l'identité adaptée au projet Daggerheart :

```powershell
copy .purple-local\identity-violet-daggerheart.md $env:USERPROFILE\.purple\identity\identity.md
```

Ou manuellement : copier le contenu de `.purple-local/identity-violet-daggerheart.md` dans `%USERPROFILE%\.purple\identity\identity.md`.

### 3. Modèle Ollama

```powershell
# Télécharger un modèle avec tool-calling
ollama pull qwen3-coder:30b

# OU créer le modèle "purple" personnalisé (context window étendu)
ollama create purple -f $env:USERPROFILE\.purple\config\Modelfile
```

**Modèles recommandés pour tool-calling :**

| Modèle | Taille | VRAM | Notes |
|--------|--------|------|-------|
| `qwen3-coder:30b` | ~18 GB | 24 GB+ | Meilleur tool-calling, recommandé |
| `qwen3-coder:8b` | ~5 GB | 8 GB+ | Plus léger, bon tool-calling |
| `qwen3.5:27b` | ~16 GB | 24 GB+ | Très bon aussi |
| `llama3.1:8b` | ~5 GB | 8 GB+ | Alternative Llama |

> **Note VRAM :** Si tu as un GPU NVIDIA avec assez de VRAM, Ollama l'utilisera automatiquement. Sinon, le modèle tourne en CPU (plus lent mais fonctionnel).

---

## Lancement

### Méthode 1 : Directe

```powershell
cd $env:USERPROFILE\.purple
.\venv\Scripts\Activate.ps1
python cli\purple.py
```

### Méthode 2 : Avec modèle spécifique

```powershell
cd $env:USERPROFILE\.purple
.\venv\Scripts\Activate.ps1
$env:OLLAMA_MODEL = "qwen3-coder:30b"
python cli\purple.py
```

### Méthode 3 : Raccourci batch

Copier `purple.bat` (depuis `.purple-local/`) sur le Bureau ou dans le PATH :

```powershell
copy .purple-local\purple.bat $env:USERPROFILE\Desktop\purple.bat
```

Double-clic pour lancer.

### Méthode 4 : One-shot (prompt unique)

```powershell
cd $env:USERPROFILE\.purple
.\venv\Scripts\Activate.ps1
python cli\purple.py "Liste les fichiers du projet Daggerheart"
```

---

## Commandes dans Purple CLI

| Commande | Action |
|----------|--------|
| `/help` | Aide |
| `/plan` | Mode planification (raisonnement pur, pas de tools) |
| `/build` | Retour au mode exécution |
| `/model` | Changer de modèle Ollama |
| `/history` | Historique de la session |
| `/knowledge` | Voir la base de connaissances |
| `/sessions` | Lister les sessions passées |
| `/exit` ou `Ctrl+C` | Quitter |

---

## Recherche Web (SearXNG — optionnel)

Purple CLI peut chercher sur le web via **SearXNG** (moteur auto-hébergé) ou **DuckDuckGo** (fallback automatique).

### Sans SearXNG (DuckDuckGo fallback)

Ça marche directement — DuckDuckGo est le fallback quand SearXNG n'est pas dispo. Pas de config nécessaire.

### Avec SearXNG (Docker Desktop)

Si tu veux un moteur de recherche local plus puissant :

```powershell
# 1. Installer Docker Desktop : https://www.docker.com/products/docker-desktop
# 2. Depuis le dossier Purple CLI :
cd $env:USERPROFILE\.purple\search
docker compose up -d

# SearXNG sera accessible sur http://localhost:8890
```

Puis modifier `brain/server.py` ligne 45 :
```python
SEARXNG_URL = "http://localhost:8890"  # Adapter depuis l'IP Tailscale d'origine
```

---

## Connexion au Projet Daggerheart

### Naviguer dans le projet

```
> Liste les fichiers dans C:/Users/MON_USER/projets/daggerheart-companion/src/modules/
```

Purple CLI peut lire les fichiers du projet via ses outils MCP (`list_directory`, `read_pdf`, etc.).

### Lire la mémoire partagée

```
> Lis le fichier C:/Users/MON_USER/projets/daggerheart-companion/.violet/Memory/shared/STATE.md
```

### Stocker des connaissances

Les connaissances persistent dans la base SQLite locale (`~/.purple/memory/purple.db`) :

```
> Retiens que le tag system utilise 4 catégories : Offensif, Défensif, Social, Utilitaire
```

---

## Résolution de Problèmes

| Problème | Solution |
|----------|---------|
| `python` non trouvé | Vérifier PATH. Réinstaller Python avec "Add to PATH" coché |
| `ollama` non trouvé | Installer depuis ollama.com, redémarrer le terminal |
| "Cannot connect to Ollama" | Lancer `ollama serve` dans un autre terminal |
| "model 'purple:latest' not found" | `ollama pull qwen3-coder:30b` ou `$env:OLLAMA_MODEL="qwen3-coder:30b"` |
| "No module named 'fastmcp'" | Activer le venv : `.\venv\Scripts\Activate.ps1` puis `pip install -r requirements.txt` |
| MCP server ne démarre pas | Vérifier les chemins Python dans `config/mcp.json` (forward slashes !) |
| `npx` non trouvé | Installer Node.js depuis nodejs.org |
| Erreur `chmod` | Normal sur Windows — le code les gère silencieusement |

---

## Architecture Locale

```
%USERPROFILE%\.purple\
  ├── cli\
  │     ├── purple.py          # CLI principal (~1500 lignes)
  │     ├── dashboard.py       # Affichage terminal
  │     └── tracker.py         # Suivi de performance
  ├── brain\server.py          # MCP: mémoire + connaissances + recherche web
  ├── docs\server.py           # MCP: PDF, Excel, Word, PowerPoint
  ├── config\
  │     ├── mcp.json           # Déclaration des serveurs MCP
  │     └── Modelfile          # Définition modèle Ollama
  ├── identity\identity.md     # Personnalité de l'agent (Violet Daggerheart)
  ├── memory\purple.db         # SQLite: mémoire persistante
  ├── knowledge\knowledge.db   # SQLite: base de connaissances
  ├── sessions\                # Transcriptions JSONL
  ├── teaching\                # Fragments d'apprentissage
  └── venv\                    # Environnement Python virtuel
```
