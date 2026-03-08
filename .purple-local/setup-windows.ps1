# setup-windows.ps1
# Purple CLI - Setup for Windows
# Run from PowerShell: .\setup-windows.ps1

$ErrorActionPreference = "Stop"
$PURPLE_DIR = "$env:USERPROFILE\.purple"

Write-Host ""
Write-Host "=== Purple CLI - Windows Setup ===" -ForegroundColor Magenta
Write-Host ""

# --- Pre-requisites check ---
Write-Host "[1/7] Verification des prerequis..." -ForegroundColor Cyan

# Python
try {
    $pyVersion = python --version 2>&1
    if ($pyVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$Matches[1]; $minor = [int]$Matches[2]
        if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 11)) {
            Write-Host "  ERREUR: Python 3.11+ requis (trouve: $pyVersion)" -ForegroundColor Red
            Write-Host "  Telecharger: https://www.python.org/downloads/" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "  OK: $pyVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERREUR: Python non trouve" -ForegroundColor Red
    Write-Host "  Telecharger: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANT: Cocher Add Python to PATH lors de installation" -ForegroundColor Yellow
    exit 1
}

# Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "  OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR: Git non trouve" -ForegroundColor Red
    Write-Host "  Telecharger: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Ollama
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "  OK: Ollama installe" -ForegroundColor Green
} catch {
    Write-Host "  ATTENTION: Ollama non trouve" -ForegroundColor Yellow
    Write-Host "  Telecharger: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "  On continue, tu pourras installer Ollama apres..." -ForegroundColor Yellow
}

# Node.js (pour sequential-thinking MCP server)
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ATTENTION: Node.js non trouve (requis pour sequential-thinking)" -ForegroundColor Yellow
    Write-Host "  Telecharger: https://nodejs.org/" -ForegroundColor Yellow
}

# --- Clone ---
Write-Host ""
Write-Host "[2/7] Clonage du repository..." -ForegroundColor Cyan
if (Test-Path $PURPLE_DIR) {
    Write-Host "  $PURPLE_DIR existe deja. Mise a jour..." -ForegroundColor Yellow
    Push-Location $PURPLE_DIR
    git pull 2>&1 | Out-Null
    Pop-Location
} else {
    git clone https://github.com/PurpleDirective/purple-directive-cli.git $PURPLE_DIR
}
Write-Host "  OK: Clone dans $PURPLE_DIR" -ForegroundColor Green

# --- Virtual environment ---
Write-Host ""
Write-Host "[3/7] Creation de environnement virtuel..." -ForegroundColor Cyan
Push-Location $PURPLE_DIR

if (-not (Test-Path "venv")) {
    python -m venv venv
}

# Activate and install
& "$PURPLE_DIR\venv\Scripts\Activate.ps1"
Write-Host "  Installation des dependances..." -ForegroundColor Cyan
pip install -q -r requirements.txt
Write-Host "  OK: Dependances installees" -ForegroundColor Green

# --- Config files ---
Write-Host ""
Write-Host "[4/7] Configuration MCP..." -ForegroundColor Cyan

$PYTHON_VENV = "$PURPLE_DIR\venv\Scripts\python.exe" -replace "\\", "/"

# Create Windows-adapted mcp.json using ConvertTo-Json
$mcpContent = @{
    servers = @{
        "purple-brain" = @{
            command = @($PYTHON_VENV, "brain/server.py")
            enabled = $true
        }
        "purple-docs" = @{
            command = @($PYTHON_VENV, "docs/server.py")
            enabled = $true
        }
        "sequential-thinking" = @{
            command = @("npx", "-y", "@modelcontextprotocol/server-sequential-thinking")
            enabled = $true
        }
    }
}
# IMPORTANT: WriteAllText writes UTF-8 WITHOUT BOM (Out-File adds BOM which breaks json.loads)
$mcpJson = $mcpContent | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText("$PURPLE_DIR\config\mcp.json", $mcpJson)
Write-Host "  OK: config/mcp.json cree avec chemins Windows" -ForegroundColor Green

# --- Create data directories ---
Write-Host ""
Write-Host "[5/7] Creation des repertoires de donnees..." -ForegroundColor Cyan
$dirs = @("sessions", "memory", "knowledge")
$teachingDirs = @("queue", "compiled", "audit", "verify", "finetune")
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
foreach ($d in $teachingDirs) {
    New-Item -ItemType Directory -Path "teaching\$d" -Force | Out-Null
}
Write-Host "  OK: Repertoires crees" -ForegroundColor Green

# --- Identity file ---
Write-Host ""
Write-Host "[6/7] Configuration de identite Violet..." -ForegroundColor Cyan
if (-not (Test-Path "identity\identity.md")) {
    Copy-Item "identity\identity.example.md" "identity\identity.md"
    Write-Host "  OK: identity/identity.md cree (default)" -ForegroundColor Green
    Write-Host "  NOTE: Remplace-le par identite Violet Daggerheart - voir guide" -ForegroundColor Yellow
} else {
    Write-Host "  OK: identity/identity.md existe deja" -ForegroundColor Green
}

# --- Ollama model ---
Write-Host ""
Write-Host "[7/7] Configuration du modele Ollama..." -ForegroundColor Cyan
try {
    $models = ollama list 2>&1
    if ($models -match "qwen3-coder") {
        Write-Host "  OK: qwen3-coder detecte" -ForegroundColor Green
    } else {
        Write-Host "  Aucun modele qwen3-coder trouve." -ForegroundColor Yellow
        Write-Host "  Pour telecharger: ollama pull qwen3-coder:30b" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Ollama non disponible - configure-le plus tard" -ForegroundColor Yellow
}

Pop-Location

# --- Summary ---
Write-Host ""
Write-Host "=== Setup termine ! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Installer Ollama si pas fait: https://ollama.com/download/windows" -ForegroundColor White
Write-Host "  2. Telecharger un modele:  ollama pull qwen3-coder:30b" -ForegroundColor White
Write-Host "  3. Optionnel - Creer le modele Purple:" -ForegroundColor White
Write-Host "     ollama create purple -f $PURPLE_DIR\config\Modelfile" -ForegroundColor White
Write-Host "  4. Copier identite Violet - voir guide installation" -ForegroundColor White
Write-Host ""
Write-Host "Pour lancer Purple CLI:" -ForegroundColor Cyan
Write-Host "  cd $PURPLE_DIR" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python cli\purple.py" -ForegroundColor White
Write-Host ""
Write-Host "Avec un modele specifique:" -ForegroundColor Cyan
$launchCmd = '  $env:OLLAMA_MODEL="qwen3-coder:30b"; python cli\purple.py'
Write-Host $launchCmd -ForegroundColor White
Write-Host ""
