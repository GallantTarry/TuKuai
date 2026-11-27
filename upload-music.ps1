<#
.SYNOPSIS
    TuKuai OS - One-Click Cloudflare R2 Music Uploader & Playlist Updater
.DESCRIPTION
    Uploads .flac / .mp3 audio files to Cloudflare R2 bucket `tukuai-music`
    (served at https://music.xn--udsye.art), archives a copy in Desktop\tukuai-music,
    normalizes filenames to lowercase English kebab-case, cleans up superseded .mp3
    objects when upgrading a track to .flac, and updates `assets/js/app/data/media.js`.

.EXAMPLE
    # 1. GUI Mode: Right-click -> "Run with PowerShell" (or run with no arguments) to pick files in a dialog
    .\upload-music.ps1

    # 2. CLI Single/Multi File Upload:
    .\upload-music.ps1 -Files "D:\Downloads\Wind Poem.flac" -Title "Wind Poem"

    # 3. Full Folder Sync (sync all files in Desktop\tukuai-music to R2):
    .\upload-music.ps1 -SyncArchive
#>
param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $false)]
    [string[]]$Files,

    [string]$Title = "",

    [string]$ArchiveDir = (Join-Path ([Environment]::GetFolderPath("Desktop")) "tukuai-music"),

    [string]$Bucket = "tukuai-music",

    [switch]$SyncArchive
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$MediaJs  = Join-Path $RepoRoot "assets\js\app\data\media.js"

if (-not (Test-Path $MediaJs)) {
    throw "Cannot locate media.js at: $MediaJs"
}

function ConvertTo-KebabCase([string]$InputText) {
    $clean = $InputText.Trim() -replace "['’]", ""
    $slug  = ($clean.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
    return $slug
}

function ConvertTo-TitleCase([string]$Slug) {
    $words = $Slug -split "-" | Where-Object { $_ -ne "" }
    $ti = (Get-Culture).TextInfo
    return ($words | ForEach-Object { $ti.ToTitleCase($_) }) -join " "
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

# If neither -Files nor -SyncArchive is provided, open native Windows file picker
if ((-not $Files -or $Files.Count -eq 0) -and (-not $SyncArchive)) {
    Add-Type -AssemblyName System.Windows.Forms
    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = "Select Audio Files (.flac / .mp3) to Upload to TuKuai OS R2"
    $dialog.Filter = "Audio Files (*.flac;*.mp3)|*.flac;*.mp3|FLAC Lossless (*.flac)|*.flac|MP3 Audio (*.mp3)|*.mp3"
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
        Where-Object { $_.Extension -match '^\.(flac|mp3)$' } |
        Select-Object -ExpandProperty FullName
}

if (-not (Test-Path $ArchiveDir)) {
    New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
}

$mediaContent = Get-Content -Path $MediaJs -Raw -Encoding UTF8
$updatedMedia = $false

foreach ($srcFile in $Files) {
    $item = Get-Item -LiteralPath $srcFile
    $ext  = $item.Extension.TrimStart('.').ToLowerInvariant()
    if ($ext -notin @("flac", "mp3")) {
        Write-Warning "Skipping unsupported file: $($item.Name)"
        continue
    }

    $rawStem = if ($Title -and $Files.Count -eq 1) { $Title } else { [System.IO.Path]::GetFileNameWithoutExtension($item.Name) }
    $slug = ConvertTo-KebabCase $rawStem
    if ([string]::IsNullOrWhiteSpace($slug)) {
        $slug = Read-Host "Filename '$($item.Name)' is non-English. Enter an English kebab-case slug (e.g. wind-poem)"
        $slug = ConvertTo-KebabCase $slug
        if ([string]::IsNullOrWhiteSpace($slug)) {
            throw "English slug cannot be empty."
        }
    }

    $targetName = "$slug.$ext"
    $archiveDst = Join-Path $ArchiveDir $targetName
    if ($item.FullName -ne $archiveDst) {
        Copy-Item -LiteralPath $item.FullName -Destination $archiveDst -Force
    }

    $mime = if ($ext -eq "flac") { "audio/flac" } else { "audio/mpeg" }
    Write-Host "[UPLOAD] $targetName -> r2://$Bucket/$targetName ($mime)" -ForegroundColor Cyan
    Invoke-R2Command @(
        "r2", "object", "put", "$Bucket/$targetName",
        "--file", $archiveDst,
        "--content-type", $mime,
        "--cache-control", "public, max-age=31536000",
        "--storage-class", "Standard",
        "--remote", "-y"
    )

    # If upgrading .mp3 -> .flac, clean up superseded .mp3 locally and on R2
    if ($ext -eq "flac") {
        $oldMp3Local = Join-Path $ArchiveDir "$slug.mp3"
        if (Test-Path $oldMp3Local) {
            Remove-Item -LiteralPath $oldMp3Local -Force
        }
    }

    # Update media.js: replace existing slug extension if present, or append new track
    $escapedSlug = [Regex]::Escape($slug)
    $existingPattern = "(track\((['""])([^'""]+)\2,\s*['""])$escapedSlug\.(flac|mp3)(['""]\))"
    if ($mediaContent -match $existingPattern) {
        $oldExt = $Matches[4]
        if ($oldExt -ne $ext) {
            $mediaContent = [Regex]::Replace($mediaContent, $existingPattern, "`${1}$targetName`${5}")
            $updatedMedia = $true
            Write-Host "[UPDATE] Upgraded '$slug.$oldExt' -> '$targetName' in media.js" -ForegroundColor Green
            if ($oldExt -eq "mp3" -and $ext -eq "flac") {
                Write-Host "[CLEAN] Removing superseded '$slug.mp3' from R2..." -ForegroundColor DarkGray
                try { Invoke-R2Command @("r2", "object", "delete", "$Bucket/$slug.mp3", "--remote", "-y") } catch {}
            }
        }
    } else {
        $displayTitle = if ($Title -and $Files.Count -eq 1) { $Title } else { ConvertTo-TitleCase $slug }
        $safeTitle = $displayTitle -replace "'", "\'"
        $newLine = "        track('$safeTitle', '$targetName'),"
        $mediaContent = [Regex]::Replace(
            $mediaContent,
            "(TK\.data\.playlist\s*=\s*\[[\s\S]*?)(\r?\n\s*\];)",
            "`$1`r`n$newLine`$2",
            1
        )
        $updatedMedia = $true
        Write-Host "[ADD] Appended track('$displayTitle', '$targetName') to media.js" -ForegroundColor Green
    }
}

if ($updatedMedia) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($MediaJs, $mediaContent, $utf8NoBom)
    Write-Host "`nSaved updated playlist to: $MediaJs" -ForegroundColor Green
    Write-Host "Remember to commit & push media.js so the live website picks up the playlist change!" -ForegroundColor Yellow
} else {
    Write-Host "`nAll selected files uploaded to R2 (no playlist changes needed in media.js)." -ForegroundColor Green
}
