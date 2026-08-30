param(
  [int]$WaitTimeoutSeconds = 180,
  [switch]$Build
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path

function Test-DockerEngineReady {
  try {
    docker version --format '{{.Server.Version}}' *> $null
    return $true
  } catch {
    return $false
  }
}

function Ensure-DockerCli {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI was not found in PATH. Install Docker Desktop and reopen PowerShell."
  }
}

function Start-DockerDesktopIfNeeded {
  if (Test-DockerEngineReady) {
    Write-Host "Docker engine is already running."
    return
  }

  $desktopExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  if (Test-Path $desktopExe) {
    Write-Host "Starting Docker Desktop..."
    Start-Process -FilePath $desktopExe | Out-Null
  } else {
    Write-Warning "Docker Desktop executable not found at: $desktopExe"
    Write-Warning "If Docker Desktop is installed elsewhere, start it manually."
  }

  $deadline = (Get-Date).AddSeconds($WaitTimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-DockerEngineReady) {
      Write-Host "Docker engine is ready."
      return
    }
    Start-Sleep -Seconds 2
  }

  throw "Docker engine did not become ready within $WaitTimeoutSeconds seconds."
}

Ensure-DockerCli
Start-DockerDesktopIfNeeded

Push-Location $projectRoot
try {
  $composeArgs = @("compose", "up", "-d")
  if ($Build) {
    $composeArgs += "--build"
  }

  Write-Host "Running: docker $($composeArgs -join ' ')"
  docker @composeArgs

  if ($LASTEXITCODE -ne 0) {
    throw "docker compose up failed with exit code $LASTEXITCODE"
  }

  Write-Host ""
  Write-Host "Stack started."
  Write-Host "Frontend: http://localhost:3000"
  Write-Host "Backend health: http://localhost:8000/health"
  Write-Host ""
  Write-Host "Current service status:"
  docker compose ps
} finally {
  Pop-Location
}
