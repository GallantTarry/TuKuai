<#
.SYNOPSIS
    TuKuai OS - One-Click Cloudflare R2 Handheld ROM Uploader & Game List Updater
.DESCRIPTION
    Uploads .gba / .sfc / .smc / .nds / .nes / .gb / .gbc ROM files to Cloudflare R2
    bucket `tukuai-roms` (served at https://roms.xn--udsye.art), archives a local copy
    in Desktop\tukuai-roms, normalizes filenames to lowercase English snake_case/kebab-case,
    and automatically appends new games to `assets/js/app/data/resources.js`.

.EXAMPLE
    # 1. GUI Mode: Right-click -> "Run with PowerShell" (or run with no arguments)
    .\upload-rom.ps1

    # 2. CLI Upload with explicit title & emoji:
    .\upload-rom.ps1 -Files "D:\ROMs\metal_slug.gba" -Title "合金弹头 Advance" -Emoji "🔫"

    # 3. Full Folder Sync (sync all ROMs in Desktop\tukuai-roms to R2):
    .\upload-rom.ps1 -SyncArchive
#>
param(
    [Parameter(Position = 0)]
    [string[]]$Files,

    [string]$Title = "",

    [string]$Emoji = "🕹️",

    [string]$ArchiveDir = (Join-Path ([Environment]::GetFolderPath("Desktop")) "tukuai-roms"),

    [string]$Bucket = "tukuai-roms",

    [switch]$SyncArchive
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoRoot    = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$ResourcesJs = Join-Path $RepoRoot "assets\js\app\data\resources.js"
$ValidExts   = @("gba", "sfc", "smc", "nds", "nes", "gb", "gbc")

if (-not (Test-Path $ResourcesJs)) {
    throw "Cannot locate resources.js at: $ResourcesJs"
}

function ConvertTo-RomSlug([string]$InputText) {
    $clean = $InputText.Trim() -replace "['’]", ""
    $slug  = ($clean.ToLowerInvariant() -replace "[^a-z0-9_-]+", "_").Trim("_-")
    return $slug
}

function Invoke-R2Command([string[]]$WranglerArgs) {
    $cachedWrangler = Get-ChildItem "$env:LOCALAPPDATA\npm-cache\_npx" -Recurse -Filter "wrangler.js" -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
    if ($cachedWrangler) {
        & node $cachedWrangler @WranglerArgs
    } else {
        & npx --yes wrangler@latest @WranglerArgs
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Wrangler R2 command failed (exit code $LASTEXITCODE): $($WranglerArgs -join ' ')"
    }
}

$interactiveGui = $false
if ((-not $Files -or $Files.Count -eq 0) -and (-not $SyncArchive)) {
    $interactiveGui = $true
    Add-Type -AssemblyName System.Windows.Forms
    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = "Select Handheld ROM Files to Upload to TuKuai OS R2"
    $dialog.Filter = "Handheld ROMs (*.gba;*.sfc;*.smc;*.nds;*.nes;*.gb;*.gbc)|*.gba;*.sfc;*.smc;*.nds;*.nes;*.gb;*.gbc|All Files (*.*)|*.*"
    $dialog.Multiselect = $true
    if (Test-Path $ArchiveDir) {
        $dialog.InitialDirectory = $ArchiveDir
    }
    if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
    $Files = $dialog.FileNames
}

if ($SyncArchive) {
    if (-not (Test-Path $ArchiveDir)) {
        throw "Archive directory not found: $ArchiveDir"
    }
    $Files = Get-ChildItem -Path $ArchiveDir -File |
        Where-Object { $ValidExts -contains $_.Extension.TrimStart('.').ToLowerInvariant() } |
        Select-Object -ExpandProperty FullName
}

if (-not (Test-Path $ArchiveDir)) {
    New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
}

$resContent = Get-Content -Path $ResourcesJs -Raw -Encoding UTF8
$updatedRes = $false

foreach ($srcFile in $Files) {
    $item = Get-Item -LiteralPath $srcFile
    $ext  = $item.Extension.TrimStart('.').ToLowerInvariant()
    if ($ext -notin $ValidExts) {
        Write-Warning "Skipping unsupported ROM format: $($item.Name)"
        continue
    }

    $stem = [System.IO.Path]::GetFileNameWithoutExtension($item.Name)
    $slug = ConvertTo-RomSlug $stem
    if ([string]::IsNullOrWhiteSpace($slug)) {
        $slug = Read-Host "Filename '$($item.Name)' is non-English. Enter an English slug (e.g. metal_slug)"
        $slug = ConvertTo-RomSlug $slug
        if ([string]::IsNullOrWhiteSpace($slug)) {
            throw "English ROM filename slug cannot be empty."
        }
    }

    $targetName = "$slug.$ext"
    $archiveDst = Join-Path $ArchiveDir $targetName
    if ($item.FullName -ne $archiveDst) {
        Copy-Item -LiteralPath $item.FullName -Destination $archiveDst -Force
    }

    Write-Host "[UPLOAD] $targetName -> r2://$Bucket/$targetName" -ForegroundColor Cyan
    Invoke-R2Command @(
        "r2", "object", "put", "$Bucket/$targetName",
        "--file", $archiveDst,
        "--content-type", "application/octet-stream",
        "--cache-control", "public, max-age=31536000, immutable",
        "--storage-class", "Standard",
        "--remote", "-y"
    )

    $escapedFile = [Regex]::Escape($targetName)
    if ($resContent -notmatch "rom\([^)]*['""]$escapedFile['""]\s*\)") {
        $gameTitle = if ($Title -and $Files.Count -eq 1) {
            $Title
        } elseif ($interactiveGui) {
            $inputTitle = Read-Host "Enter display title for '$targetName' (press Enter to use '$stem')"
            if ([string]::IsNullOrWhiteSpace($inputTitle)) { $stem } else { $inputTitle }
        } else {
            $stem
        }
        $safeTitle = $gameTitle -replace "'", "\'"
        $newLine   = "        rom('$Emoji', '$safeTitle', '$targetName'),"
        $resContent = [Regex]::Replace(
            $resContent,
            "(TK\.data\.games\s*=\s*\[[\s\S]*?)(\r?\n\s*\];)",
            "`$1`r`n$newLine`$2",
            1
        )
        $updatedRes = $true
        Write-Host "[ADD] Appended rom('$Emoji', '$gameTitle', '$targetName') to resources.js" -ForegroundColor Green
    }
}

if ($updatedRes) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($ResourcesJs, $resContent, $utf8NoBom)
    Write-Host "`nSaved updated game list to: $ResourcesJs" -ForegroundColor Green
    Write-Host "Remember to commit & push resources.js so the live website displays the new game card!" -ForegroundColor Yellow
} else {
    Write-Host "`nAll selected ROMs uploaded to R2!" -ForegroundColor Green
}
