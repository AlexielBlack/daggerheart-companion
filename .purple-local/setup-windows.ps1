# setup-windows.ps1
# Purple CLI — Setup for Windows
# Run from PowerShell: .\setup-windows.ps1

$ErrorActionPreference = "Stop"
$PURPLE_DIR = "$env:USERPROFILE\.purple"

Write-Host "`n=== Purple CLI — Windows Setup ===" -ForegroundColor Magenta
Write-Host ""

# --- Pre-requisites check ---
Write-Host "[1/7] Vérification des prérequis..." -ForegroundColor Cyan

# Python
try {
    $pyVersion = python --version 2>&1
    if ($pyVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$Matches[1]; $minor = [int]$Matches[2]
        if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 11)) {
            Write-Host "  ERREUR: Python 3.11+ requis (trouvé: $pyVersion)" -ForegroundColor Red
            Write-Host "  Télécharger: https://www.python.org/downloads/" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "  OK: $pyVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERREUR: Python non trouvé" -ForegroundColor Red
    Write-Host "  Télécharger: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANT: Cocher 'Add Python to PATH' lors de l'installation" -ForegroundColor Yellow
    exit 1
}

# Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "  OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR: Git non trouvé" -ForegroundColor Red
    Write-Host "  Télécharger: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Ollama
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "  OK: Ollama installé" -ForegroundColor Green
} catch {
    Write-Host "  ATTENTION: Ollama non trouvé" -ForegroundColor Yellow
    Write-Host "  Télécharger: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "  On continue quand même (tu pourras l'installer après)..." -ForegroundColor Yellow
}

# Node.js (pour sequential-thinking MCP server)
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ATTENTION: Node.js non trouvé (requis pour sequential-thinking)" -ForegroundColor Yellow
    Write-Host "  Télécharger: https://nodejs.org/" -ForegroundColor Yellow
}

# --- Clone ---
Write-Host "`n[2/7] Clonage du repository..." -ForegroundColor Cyan
if (Test-Path $PURPLE_DIR) {
    Write-Host "  $PURPLE_DIR existe déjà. Mise à jour..." -ForegroundColor Yellow
    Push-Location $PURPLE_DIR
    git pull 2>&1 | Out-Null
    Pop-Location
} else {
    git clone https://github.com/PurpleDirective/purple-directive-cli.git $PURPLE_DIR
}
Write-Host "  OK: Cloné dans $PURPLE_DIR" -ForegroundColor Green

# --- Virtual environment ---
Write-Host "`n[3/7] Création de l'environnement virtuel..." -ForegroundColor Cyan
Push-Location $PURPLE_DIR

if (-not (Test-Path "venv")) {
    python -m venv venv
}

# Activate and install
& "$PURPLE_DIR\venv\Scripts\Activate.ps1"
Write-Host "  Installation des dépendances..." -ForegroundColor Cyan
pip install -q -r requirements.txt
Write-Host "  OK: Dépendances installées" -ForegroundColor Green

# --- Config files ---
Write-Host "`n[4/7] Configuration MCP..." -ForegroundColor Cyan

$PYTHON_VENV = "$PURPLE_DIR\venv\Scripts\python.exe" -replace "\\", "/"

# Create Windows-adapted mcp.json
$mcpConfig = @"
{
  "servers": {
    "purple-brain": {
      "command": ["$PYTHON_VENV", "brain/server.py"],
      "enabled": true
    },
    "purple-docs": {
      "command": ["$PYTHON_VENV", "docs/server.py"],
      "enabled": true
    },
    "sequential-thinking": {
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "enabled": true
    }
  }
}
"@
$mcpConfig | Out-File -FilePath "config\mcp.json" -Encoding utf8
Write-Host "  OK: config/mcp.json créé (chemins Windows)" -ForegroundColor Green

# --- Create data directories ---
Write-Host "`n[5/7] Création des répertoires de données..." -ForegroundColor Cyan
$dirs = @("sessions", "teaching\queue", "teaching\compiled", "teaching\audit", "teaching\verify", "teaching\finetune", "memory", "knowledge")
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-Host "  OK: Répertoires créés" -ForegroundColor Green

# --- Identity file ---
Write-Host "`n[6/7] Configuration de l'identité Violet..." -ForegroundColor Cyan
if (-not (Test-Path "identity\identity.md")) {
    Copy-Item "identity\identity.example.md" "identity\identity.md"
    Write-Host "  OK: identity/identity.md créé (default)" -ForegroundColor Green
    Write-Host "  NOTE: Remplace-le par l'identité Violet Daggerheart (voir guide)" -ForegroundColor Yellow
} else {
    Write-Host "  OK: identity/identity.md existe déjà" -ForegroundColor Green
}

# --- Ollama model ---
Write-Host "`n[7/7] Configuration du modèle Ollama..." -ForegroundColor Cyan
try {
    $models = ollama list 2>&1
    if ($models -match "qwen3-coder") {
        Write-Host "  OK: qwen3-coder détecté" -ForegroundColor Green
    } else {
        Write-Host "  Téléchargement de qwen3-coder:30b (cela peut prendre du temps)..." -ForegroundColor Yellow
        Write-Host "  Tu peux aussi faire: ollama pull qwen3-coder:30b" -ForegroundColor Yellow
        # Don't auto-pull, let user decide
    }
} catch {
    Write-Host "  Ollama non disponible — configure-le plus tard" -ForegroundColor Yellow
}

Pop-Location

# --- Summary ---
Write-Host "`n=== Setup terminé ! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Installer Ollama si pas fait: https://ollama.com/download/windows" -ForegroundColor White
Write-Host "  2. Télécharger un modèle:  ollama pull qwen3-coder:30b" -ForegroundColor White
Write-Host "  3. (Optionnel) Créer le modèle Purple: ollama create purple -f $PURPLE_DIR\config\Modelfile" -ForegroundColor White
Write-Host "  4. Copier l'identité Violet (voir identity\identity-violet-daggerheart.md)" -ForegroundColor White
Write-Host ""
Write-Host "Pour lancer Purple CLI:" -ForegroundColor Cyan
Write-Host "  cd $PURPLE_DIR" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python cli\purple.py" -ForegroundColor White
Write-Host ""
Write-Host "Ou avec un modèle spécifique:" -ForegroundColor Cyan
Write-Host '  $env:OLLAMA_MODEL="qwen3-coder:30b"; python cli\purple.py' -ForegroundColor White
Write-Host ""
