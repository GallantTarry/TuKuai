# PyKuai v1.2.7 — User Manual & Changelog

Official PyPI Package: `https://pypi.org/project/pykuai/`  
Source Repository: `https://github.com/GallantTarry/pykuai`  
Author: **TuKuai (GallantTarry)**  

> *"First, solve the problem. Then, write the code."* — John Johnson

---

## Manifesto & Architecture Philosophy

Built upon ideas and breakthroughs shared by the global open-source community, **PyKuai** adopts **pure English**—the universal language of computing—and a **single official international upstream** (`PyPI` + `GitHub`) so it can give back to developers worldwide rather than remain isolated.

Moving away from bloated, catch-all GUI script bundles, PyKuai is engineered as a **Micro-Kernel + Plug-and-Play 3-Letter Engine Workbench** anchored by four principles:
1. **Minimalism** — Zero heavy runtime bloat; ships clean on PyPI and resolves or SHA256-verifies external tools on demand.
2. **Quality** — Atomic file writes, EXIF orientation fixes, Windows Terminal state watchdog protection, and resilient download/auth flows.
3. **Precision** — Strict two-tier ergonomics (`tt`, `pp`, `vv`, `cc`, `hh`, `gg` global commands + isolated `^[a-z]{3}$` engine namespaces).
4. **Visual Clarity** — Mouse-clickable **Rich / Textual** Cyber-Dark Studios with built-in `?` / `F1` guides, plus full headless CLI scriptability.

---

## 1. Requirements & Installation

- **Python**: `>= 3.9` (`OS Independent` core console & TUI; Windows bundles `yt-dlp.exe` and `UnRAR.exe` for convenience).
- **Local State Directory**: User preferences (`settings.json`), verified FFmpeg binaries (`tools/`), isolated Chromium session (`yt-session/`), and captured YouTube cookies (`cookies.txt`) live under `~/.pykuai/`.

### Install from PyPI

```bash
# 1. Core workbench (installs rich, textual, openpyxl, Pillow, pypdf)
pip install pykuai

# 2. Optional extras by domain
pip install "pykuai[media]"    # yt-dlp + yt-dlp-ejs
pip install "pykuai[office]"   # pandas
pip install "pykuai[cv]"       # opencv-python + img2pdf
pip install "pykuai[archive]"  # rarfile
pip install "pykuai[ui]"       # PySide6

# 3. Full workbench with all optional extras
pip install "pykuai[all]"
```

> **Mirror Sync Note**: If your regional `pip` mirror lags right after a new PyPI release, bypass the cache via the official upstream:
> ```bash
> pip install -U pykuai -i https://pypi.org/simple
> ```

### Install from Source (Developers)

```bash
git clone https://github.com/GallantTarry/pykuai.git
cd pykuai
pip install -e ".[all]"
```

---

## 2. Launching & Global Commands

PyKuai installs the global `pykuai` script entrypoint (`pykuai.cli:main`) and supports `python -m pykuai`.

### Launch Flags

| Command | Behavior |
| :--- | :--- |
| `pykuai` | Launch full REPL console with high-DPI pixel-snake intro + Cyber-Dark banner |
| `pykuai --fast` (or `--no-intro`, `-f`) | Launch REPL immediately, skipping the intro animation |
| `python -m pykuai` | Module-based launch equivalent |
| `pykuai --version` | Print version string (`pykuai version 1.2.7`) and exit |

> **REPL UX Highlights**: Live keyboard/cursor/paste retro CC0 sound effects, drag-and-drop or pasted image path auto-detection (launches `ifc` pre-loaded with the dropped image), and a background Windows Terminal `watchdog` process that cleanly restores your original tab title & icon on exit.

### Six Doubled-Letter Global Commands

Inside the REPL prompt (or prefixed with `pykuai` from your shell):

| Command | Name | Action |
| :--- | :--- | :--- |
| `tt` | **Tool Tray** | Open the interactive Tool Tray Studio (or run `tt <tool> [args]`) |
| `pp` | **Pull Packages** | Scan engine dependencies and inspect/install/upgrade via `pip` |
| `vv` | **View Version** | Display version (`v1.2.7`), author signature, and open-source audio credits |
| `cc` | **Clear Console** | Clear terminal viewport and redraw the ASCII welcome banner |
| `hh` | **Help Hub** | Display the global command quick-reference table |
| `gg` | **Good Game** | Exit cleanly and trigger terminal identity restoration |

### In-Studio Shortcuts & Controls

- **`?` or `F1`** (or click `?` top-right): Open the floating `HelpModalScreen` manual inside `tt`, `pp`, `ifc`, or `ytd`.
- **`SFX ON / SFX OFF`** chip (bottom-right of Tool Tray): Toggle retro CC0 WAV sound effects and persist preference to `~/.pykuai/settings.json`.
- **`Esc` / `Ctrl+C`**: Return from an active Studio or exit safely.

---

## 3. Built-In Engine 01: `ifc` — Image Format Converter

Convert raster/icon images cleanly and package multi-resolution `.ico` containers.

### Capabilities
- **Target Formats (`-t / --to`)**: `ico`, `png`, `jpg`, `webp`, `bmp`, `gif`, `tiff`, `avif` (also auto-inferred from `-o` extension; defaults to `ico`).
- **Broad Input Support**: Accepts `PNG`, `JPG/JPEG`, `WEBP`, `BMP`, `GIF`, `TIFF/TIF`, `ICO`, `ICNS`, `AVIF`, `TGA`, `PPM`, `DDS`, `PSD`, and more via Pillow.
- **Image Safety Pipeline**:
  - Automatically applies EXIF orientation normalization before processing.
  - Extracts the highest-resolution layer from `ICO`/`ICNS` sources or first frame from animated images.
  - Composites transparency cleanly over solid white when exporting to non-alpha targets (`JPG` / `BMP`).
  - Performs atomic temp-file writes to avoid file corruption or partial overwrites.
- **Multi-Resolution `.ico` Packing**:
  - Studio presets (`Std`, `All`, `Web`) or free selection across `8..256 px`.
  - Non-square artwork is centered cleanly on a transparent square canvas without distortion.
  - Gentle `UnsharpMask` edge sharpening is applied on small icon layers (`<= 32 px`) unless `--no-sharpen` is specified.

### CLI Usage & Options

```bash
# Open interactive Image Studio
pykuai tt ifc

# Convert PNG to WebP at 90% quality
pykuai tt ifc logo.png -t webp -q 90

# Build multi-resolution Windows app icon
pykuai tt ifc logo.png -t ico -s 16,32,48,64,128,256 -o app.ico

# Disable small-layer edge sharpening
pykuai tt ifc sprite.png -t ico -s 16,32 -o icon.ico --no-sharpen
```

| Flag | Default | Description |
| :--- | :--- | :--- |
| `image` | `""` | Source image path (triggers interactive Studio if omitted) |
| `-t, --to` | `""` | Target format (`ico`, `png`, `jpg`, `webp`, `bmp`, `gif`, `tiff`, `avif`) |
| `-s, --sizes` | `16,32,48,64,128,256` | Comma-separated `.ico` layer sizes (`8..256` px) |
| `-q, --quality` | `92` | Lossy quality (`1..100`) for `jpg`, `webp`, and `avif` |
| `-o, --output` | Auto | Output file path |
| `--no-sharpen` | `False` | Disable edge sharpening on `<= 32 px` ICO layers |

---

## 4. Built-In Engine 02: `ytd` — YouTube & Media Downloader

Download streams or extract high-quality audio via `yt-dlp` and `FFmpeg`, engineered specifically to handle modern Windows browser cookie locks and YouTube challenge gates.

### Format Profiles & Aliases

| `-f / --format` | Description | CLI Aliases |
| :--- | :--- | :--- |
| `best` *(default)* | Best video + audio auto-muxed into `.mp4` | `video`, `mp4` |
| `1080p` | Up to 1080p video + audio muxed into `.mp4` | — |
| `720p` | Up to 720p video + audio muxed into `.mp4` | — |
| `mp3` | Extract highest-quality `.mp3` (`--audio-quality 0`) | `audio` |
| `m4a` | Extract native/transcoded `.m4a` audio | — |

### Key Features

1. **Extension-Free One-Click `Login YouTube` (`--login`)**  
   Modern Chromium browsers on Windows (`Chrome/Edge 127+`) lock active SQLite cookie files (`yt-dlp #7271`) and enforce App-Bound Encryption (`#10927`).  
   Click **`Login YouTube`** in Studio (or run `pykuai tt ytd --login`) to launch an isolated Chromium session under `~/.pykuai/yt-session`. Once you complete official YouTube sign-in, PyKuai automatically exports session cookies to `~/.pykuai/cookies.txt` — leaving your personal browser profile untouched and requiring zero browser extensions.  
   Interactive downloads blocked by YouTube's sign-in / anti-bot check also offer to launch `--login` immediately and retry.

2. **Automatic Cookie Discovery**  
   Even without `--cookies`, `ytd` automatically scans your target output folder, current working directory, `~/.pykuai/cookies.txt`, and `~/Downloads/cookies.txt`.

3. **On-Demand SHA256-Verified FFmpeg Installer (`--install-ffmpeg`)**  
   To keep PyPI packages compact (~24.5 MB rather than 200+ MB), FFmpeg binaries are resolved from `PATH` or `~/.pykuai/tools/`. When missing on Windows, run `pykuai tt ytd --install-ffmpeg` (or accept the interactive prompt) to download official FFmpeg/FFprobe essentials with SHA256 verification and automatic `urllib` / `curl` / direct network fallbacks.

4. **JS Challenge & Runtime Resilience**  
   Automatically enables `ejs:github` solving when Node.js or Deno is present, and prefers the bundled Windows `yt-dlp.exe` (`2026.10.26`) whenever Python's `yt-dlp` lacks `curl_cffi`.

### CLI Usage & Options

```bash
# Launch interactive Media Downloader Studio
pykuai tt ytd

# Download best MP4 single video (ignores &list= unless -p is passed)
pykuai tt ytd "https://www.youtube.com/watch?v=..." -f best

# Extract MP3 with bilingual subtitles embedded into a target directory
pykuai tt ytd "https://www.youtube.com/watch?v=..." -f mp3 --subs -o ./music

# Inspect all available video/audio streams without downloading
pykuai tt ytd "https://www.youtube.com/watch?v=..." -F

# Authenticate YouTube session cleanly into ~/.pykuai/cookies.txt
pykuai tt ytd --login

# Download and verify official Windows FFmpeg/FFprobe binaries into ~/.pykuai/tools/
pykuai tt ytd --install-ffmpeg
```

| Flag | Default | Description |
| :--- | :--- | :--- |
| `url` | `""` | Target video, Shorts, playlist, or supported stream URL |
| `-f, --format` | `best` | `best`, `1080p`, `720p`, `mp3`, `m4a` (`video`/`mp4`/`audio` aliases) |
| `-p, --playlist` | `False` | Download full playlist / collection (`--yes-playlist`) |
| `--subs` | `False` | Download EN/ZH subtitles and embed when FFmpeg is present |
| `--cookies-from-browser` | `none` | `none`, `chrome`, `edge`, `firefox`, `brave` |
| `--cookies` | `""` | Explicit path to Netscape `cookies.txt` |
| `--proxy` | `""` | Custom HTTP / SOCKS proxy URL |
| `-F, --list-formats` | `False` | List available formats/streams only |
| `--login` | `False` | Open isolated Chromium YouTube login flow -> `~/.pykuai/cookies.txt` |
| `--install-ffmpeg` | `False` | Install SHA256-verified FFmpeg/FFprobe into `~/.pykuai/tools/` |
| `-o, --output-dir` | `.` | Destination directory |

---

## 5. Dependency Auditor: `pp` — Pull Packages

`pp` combines declared core/extra requirements, active engine `requires` lists, and AST third-party import scanning across active modules to verify environment health.

```bash
# Open interactive dependency selector TUI
pykuai pp

# Audit dependency status without installing
pykuai pp --check

# Non-interactively install missing core/discovered packages
pykuai pp -y

# Upgrade all tracked dependencies
pykuai pp -y --all -U
```

---

## 6. Extending PyKuai (Plugin Contract)

To add a custom utility, drop a `.py` file named with **three lowercase letters** (`^[a-z]{3}\.py$`, e.g. `pykuai/engines/pdf.py`) subclassing `pykuai.core.base.BaseEngine`:

```python
# -*- coding: utf-8 -*-
import argparse
from rich.console import Console
from pykuai.core.base import BaseEngine


class PdfToolEngine(BaseEngine):
    name = "pdf"
    description = "Merge or split PDF documents"
    usage = "tt pdf | tt pdf <files> [-o output]"
    category = "Document"
    requires = ["pypdf>=3.0.0"]
    help_text = "Choose Merge or Split interactively, or pass PDF paths via CLI."

    def register_args(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("files", nargs="*", help="Input PDF file paths")
        parser.add_argument("-o", "--output", default="merged.pdf", help="Output file path")

    def run_direct(self, args: argparse.Namespace, console: Console) -> int:
        if not args.files:
            return self.run_interactive(console)
        console.print(f"[#00FF00]Processing {len(args.files)} file(s)...[/#00FF00]")
        return 0

    def run_interactive(self, console: Console) -> int:
        from pykuai.core.tui import pick_one
        mode = pick_one("Select PDF Action", [("Merge PDFs", "merge"), ("Split PDF", "split")])
        if mode:
            console.print(f"[#00FF00]Selected mode: {mode}[/#00FF00]")
        return 0
```

Restart `pykuai`: the micro-kernel automatically discovers `pdf` in `tt`, wires `pykuai tt pdf ...`, and tracks `requires` + imports inside `pp`.

---

## 7. Changelog — v1.2.7

- **PyPI Production Release (`1.2.7`)**: Published clean wheel (`pykuai-1.2.7-py3-none-any.whl`) and source distribution (`pykuai-1.2.7.tar.gz`) via GitHub Actions OIDC Trusted Publishing.
- **Built-In `Login YouTube` (`--login`)**: Added isolated Chromium profile auth flow (`yt_auth.py`) saving `~/.pykuai/cookies.txt` without extensions or locking your personal browser, plus interactive bot-check recovery retries in `ytd`.
- **Lean Packaging & Auto FFmpeg Installer (`--install-ffmpeg`)**: Stripped 200+ MiB FFmpeg executables from Git/PyPI distributions and introduced SHA256-verified on-demand installation into `~/.pykuai/tools/`.
- **Universal `?` / `F1` Studio Manuals**: Added interactive `HelpModalScreen` documentation dialogs and clickable top-right `?` buttons across `tt`, `pp`, `ifc`, and `ytd`.
- **Toolchain & Console Polish**: Updated portable Windows `yt-dlp.exe` (`2026.10.26`) and `UnRAR.exe` (`7.30 beta 2`), preferred bundled `yt-dlp.exe` when Python `yt-dlp` lacks `curl_cffi`, hardened narrow-terminal UI layouts, and synchronized pure-English CLI/documentation.

---

## 8. Upstream Open-Source Credits

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — Media stream extraction powering `ytd`
- **[FFmpeg](https://ffmpeg.org/)** — Stream muxing & audio transcoding
- **[Pillow](https://python-pillow.org/)** — Multi-format raster/ICO processing powering `ifc`
- **[Textual](https://textual.textualize.io/)** & **[Rich](https://github.com/Textualize/rich)** — Cyber-Dark interactive TUI widgets and console UI
- **[Kenney Audio](https://kenney.nl/)** & **[CC0 Public Domain Sounds](https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds)** — Retro CC0 arcade SFX assets

---

© 2026 Created by **TuKuai (GallantTarry)**. All rights reserved.
