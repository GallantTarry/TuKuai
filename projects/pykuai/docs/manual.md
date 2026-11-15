<a id="en"></a>
English | [繁體中文](#zh-tw)

# PyKuai v1.2.8 — User Manual & Changelog

Official PyPI Package: `https://pypi.org/project/pykuai/`  
Source Repository: `https://github.com/GallantTarry/pykuai`  
Author: **TuKuai (GallantTarry)**  

> *"First, solve the problem. Then, write the code."* — John Johnson

---

## Manifesto & Architecture Philosophy

Built upon ideas and breakthroughs shared by the global open-source community, **PyKuai** adopts **pure English**—the universal language of computing—and a **single official international upstream** (`PyPI` + `GitHub`) so it can give back to developers worldwide rather than remain isolated.

Moving away from bloated, catch-all GUI script bundles, PyKuai is engineered as a **Micro-Kernel + Plug-and-Play 3-Letter Engine Workbench** anchored by four principles:
1. **Minimalism** — Zero heavy runtime bloat; ships clean on PyPI (`numpy` included for fast Sixel projection) and resolves or SHA256-verifies external tools on demand.
2. **Quality** — Atomic file writes, EXIF orientation fixes, Windows Terminal state watchdog protection, and resilient download/auth flows.
3. **Precision** — Strict two-tier ergonomics (`tt`, `pp`, `xp`, `cc` global commands + `help` / `gg`, alongside isolated `^[a-z]{3}$` engine namespaces).
4. **Visual Clarity** — Mouse-clickable **Rich / Textual** Cyber-Dark Studios with built-in `?` / `F1` guides, full headless CLI scriptability, and the **XP Playground (`xp`)** virtual CRT featuring `HEX 3D` and a CDP-powered **IE 6 Real Browser** with **Sixel HD** projection.

---

## 1. Requirements & Installation

- **Python**: `>= 3.9` (`OS Independent` core console & TUI; Windows bundles `yt-dlp.exe` and `UnRAR.exe` for convenience).
- **Local State Directory**: User preferences (`settings.json`), verified FFmpeg binaries (`tools/`), isolated Chromium session (`yt-session/`), captured YouTube cookies (`cookies.txt`), IE 6 bookmarks (`ie6_bookmarks.json`), and `HEX 3D` quick-saves (`hex3d_save.json`) live under `~/.pykuai/`.

### Install from PyPI

```bash
# 1. Core workbench (installs rich, textual, openpyxl, Pillow, pypdf, numpy)
pip install pykuai

# 2. Optional extras by domain
pip install "pykuai[media]"    # yt-dlp + yt-dlp-ejs
pip install "pykuai[office]"   # pandas
pip install "pykuai[cv]"       # opencv-python + img2pdf
pip install "pykuai[archive]"  # rarfile
pip install "pykuai[ui]"       # PySide6

# 3. Full workbench with all optional extras (recommended)
pip install "pykuai[all]"
```

### Upgrade from an Existing Version (`v1.2.8`)

If you already installed an earlier release (such as `v1.2.7`), **always pass uppercase `-U` (`--upgrade`)** so `pip` replaces the installed package instead of stopping at `Requirement already satisfied`:

```bash
# Recommended: upgrade full workbench with all optional extras
pip install -U "pykuai[all]"

# Or upgrade core workbench only
pip install -U pykuai
```

> **Mirror Sync Note**: If your regional `pip` mirror lags right after a new PyPI release, bypass the cache via the official upstream:
> ```bash
> pip install -U "pykuai[all]" -i https://pypi.org/simple
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
| `pykuai` | Launch full REPL console with high-DPI pixel-snake intro + v1.2.8 side-by-side Cyber-Dark banner |
| `pykuai --fast` (or `--no-intro`, `-f`) | Launch REPL immediately, skipping the intro animation |
| `python -m pykuai` | Module-based launch equivalent |
| `pykuai xp` / `pykuai xp hex` | Launch XP Playground directly (or jump straight to `HEX 3D`) |
| `pykuai help` / `pykuai --help` | Print welcome banner and command reference table |
| `pykuai --version` | Print version string (`pykuai version 1.2.8`) and exit |

> **REPL UX Highlights**: The v1.2.8 home banner places version/author metadata (`pykuai v1.2.8`, `TuKuai | GallantTarry`) and a clickable **`🔊 SFX ON / 🔇 SFX OFF`** pill right alongside the `PYKUAI` ASCII logo (wrapping automatically on narrow terminals). Live keyboard/cursor/paste retro CC0 sound effects, drag-and-drop or pasted image path auto-detection (`ifc`), and a background Windows Terminal `watchdog` process restore your original tab title & icon cleanly on exit.

### Global Console Commands

Inside the REPL prompt (`pykuai ❯:`) or prefixed with `pykuai` from your shell:

| Command | Name | Action |
| :--- | :--- | :--- |
| `tt` | **Tool Tray** | Open the interactive Tool Tray Studio (or run `tt <tool> [args]`) |
| `pp` | **Pull Packages** | Scan engine dependencies and inspect/install/upgrade via `pip` |
| `xp` | **XP Playground** | Launch the 3D cutscene & Virtual Windows XP CRT (`HEX 3D` & `IE 6` browser) |
| `cc` | **Clear Console** | Clear terminal viewport and redraw the side-by-side welcome banner |
| `help` | **Command Reference** | Display the global command quick-reference table |
| `gg` | **Good Game** | Exit cleanly and trigger terminal identity restoration |

### In-Studio Shortcuts & Controls

- **`?` or `F1`** (or click `?` top-right): Open the floating `HelpModalScreen` manual inside `tt`, `pp`, `ifc`, `ytd`, or `xp`.
- **`SFX ON / SFX OFF`** pill (right of the REPL welcome banner and bottom-right of Tool Tray): Click to toggle retro CC0 WAV sound effects and persist preference to `~/.pykuai/settings.json`.
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
   To keep PyPI packages compact (~24 MB rather than 200+ MB), FFmpeg binaries are resolved from `PATH` or `~/.pykuai/tools/`. When missing on Windows, run `pykuai tt ytd --install-ffmpeg` (or accept the interactive prompt) to download official FFmpeg/FFprobe essentials with SHA256 verification and automatic `urllib` / `curl` / direct network fallbacks.

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

## 6. Interactive CRT Playground: `xp` — XP Playground

Launch a 3D bedroom sneak-in cutscene leading into a simulated **Windows XP Bliss CRT Desktop** right inside your terminal:

```bash
# Play the 3D cutscene & boot into the Virtual Windows XP Desktop
pykuai xp

# Boot straight into HEX 3D inside the CRT
pykuai xp hex

# Display XP Playground summary table & high scores
pykuai xp help
```

### Capabilities & Controls

1. **3D Opening Cutscene & XP Boot Splash**:  
   Plays a synthesized retro cutscene and E-flat major XP startup chime. Press `Space`, `Enter`, or click during the cutscene/splash to skip ahead to the `Bliss` desktop.
2. **Native IE 6 Real Browser (`pykuai/arcade/ie6.py`)**:  
   - Click/double-click the **`IE 6`** desktop icon to browse real web pages driven by local Chrome/Edge CDP (`Page.startScreencast`) with automatic local system proxy inheritance.
   - **Sixel HD & Automatic Fallback**: Detects terminal cell pixel dimensions via `CSI 16t` / `DA1` and renders real-time `numpy`-accelerated `128`-color Sixel HD (`HD·Six`), seamlessly falling back to 24-bit TrueColor Half-Block (`HB·Blk`) when Sixel is unavailable, plus `View` / `Txt` reading-mode toggling.
   - **Direct Address Bar & Live Interaction**: Type any URL or bare domain in `Addr` (direct navigation without search-portal hijacking), click/scroll/type directly onto the live page with dynamic hardware cursor anchoring for accurate OS/IME popups, and manage personal bookmarks (`★ Save` / `Del`, saved to `~/.pykuai/ie6_bookmarks.json`, auto-hidden when empty).
3. **Built-In `HEX 3D` Game (`xp hex`)**:  
   - Multicolored 3D Hex & Spotted Snake rendered on a 2x2 sub-pixel canvas with the **Broken Left D-Pad** rule (`D` / `Right` turns clockwise; `W` / `Up` quick-steps forward).
   - Supports instant state save/load (`F5` / `F8` to `~/.pykuai/hex3d_save.json`), restart/pause (`R` / `P`), `Space` / `Enter` start/pause, and `✕` / `Esc` / `Q` to return to the XP Desktop (shut down via `START -> OFF` to return to `pykuai ❯`).

---

## 7. Extending PyKuai (Plugin Contract)

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

## 8. Changelog — v1.2.8 & v1.2.7

### v1.2.8 (Latest)

- **PyPI Production Release (`1.2.8`)**: Published universal wheel (`pykuai-1.2.8-py3-none-any.whl`) and source distribution (`pykuai-1.2.8.tar.gz`) with `numpy>=1.24.0` promoted to core dependencies (`pip install -U "pykuai[all]"` to upgrade existing installs).
- **Side-by-Side Home Banner & Global `SFX` Pill**: Redesigned the terminal welcome banner (`ui.py`) with right-aligned version/author metadata (`pykuai v1.2.8`, `TuKuai | GallantTarry`) and a mouse-clickable `🔊 SFX ON / 🔇 SFX OFF` switch, paired with the crisp greeting (`Type help for commands — or gg to quit.`).
- **XP Playground (`xp`)**: Replaced the arcade stub with a 3D bedroom-to-CRT cutscene, Windows XP `Bliss` desktop with incremental silent refreshes, one-click icon launch, `START -> OFF` shutdown flow, and `HEX 3D` save/load (`F5` / `F8`).
- **Built-In Native IE 6 Real Browser (`ie6.py`)**: Embedded a Chromium/Edge CDP browser inside the XP CRT supporting direct URL/domain navigation, system proxy inheritance, `~/.pykuai/ie6_bookmarks.json` persistence, and `View` / `Txt` mode toggling.
- **Sixel HD Real-Time Projection & Smoothness Overhaul**: Added off-main-thread `numpy` `128`-color `P2=1` Sixel streaming via `CSI 16t` / `DA1` with automatic `HB·Blk` fallback, `\x1b[?2026h` atomic zero-flash compositing, dynamic webpage IME cursor anchoring, and minimalist auto-hiding browser toolbars.

### v1.2.7

- **PyPI Production Release (`1.2.7`)**: Published clean wheel (`pykuai-1.2.7-py3-none-any.whl`) and source distribution (`pykuai-1.2.7.tar.gz`) via GitHub Actions OIDC Trusted Publishing.
- **Built-In `Login YouTube` (`--login`)**: Added isolated Chromium profile auth flow (`yt_auth.py`) saving `~/.pykuai/cookies.txt` without extensions or locking your personal browser, plus interactive bot-check recovery retries in `ytd`.
- **Lean Packaging & Auto FFmpeg Installer (`--install-ffmpeg`)**: Stripped 200+ MiB FFmpeg executables from Git/PyPI distributions and introduced SHA256-verified on-demand installation into `~/.pykuai/tools/`.
- **Universal `?` / `F1` Studio Manuals**: Added interactive `HelpModalScreen` documentation dialogs and clickable top-right `?` buttons across `tt`, `pp`, `ifc`, and `ytd`.
- **Toolchain & Console Polish**: Updated portable Windows `yt-dlp.exe` (`2026.10.26`) and `UnRAR.exe` (`7.30 beta 2`), preferred bundled `yt-dlp.exe` when Python `yt-dlp` lacks `curl_cffi`, hardened narrow-terminal UI layouts, and synchronized pure-English CLI/documentation.

---

## 9. Upstream Open-Source Credits

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — Media stream extraction powering `ytd`
- **[FFmpeg](https://ffmpeg.org/)** — Stream muxing & audio transcoding
- **[Pillow](https://python-pillow.org/)** — Multi-format raster/ICO processing powering `ifc`
- **[Textual](https://textual.textualize.io/)** & **[Rich](https://github.com/Textualize/rich)** — Cyber-Dark interactive TUI widgets and console UI
- **[Kenney Audio](https://kenney.nl/)** & **[CC0 Public Domain Sounds](https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds)** — Retro CC0 arcade SFX assets

---

<a id="zh-tw"></a>
[English](#en) | 繁體中文

# PyKuai v1.2.8 — 使用說明書與更新日誌

官方 PyPI 套件：`https://pypi.org/project/pykuai/`  
開源倉庫：`https://github.com/GallantTarry/pykuai`  
作者：**TuKuai (GallantTarry)**  

> *"First, solve the problem. Then, write the code."* — John Johnson

---

## 設計理念與微內核架構

**PyKuai** 汲取全球開源社群的實踐經驗，採用**簡潔英文作為運行介面與指令標準**，並以 **PyPI + GitHub** 作為單一官方國際上游，讓實用的開發者腳本開箱即用並便於向全球社群分享。

不同於臃腫龐雜的一體化 GUI 工具箱，PyKuai 採用**「微內核 + 即插即用三字母引擎」**架構，秉持四大原則：
1. **極簡精煉** —— 零冗餘相依；於 PyPI 保持輕量化發布（核心已包含 `numpy` 以加速 Sixel 影像投影），外部重型執行檔按需經由 SHA256 校驗自動下載。
2. **可靠品質** —— 檔案寫入採用原子替換、圖片自動校正 EXIF 方向、Windows Terminal 狀態守護復原，並強化多平台下載與登入容錯。
3. **精準人機工學** —— 嚴格的雙層指令設計（`tt`、`pp`、`xp`、`cc` 全域疊字指令搭配 `help` / `gg`，以及互不衝突的 `^[a-z]{3}$` 獨立引擎命名空間）。
4. **視覺清晰** —— 支援滑鼠點擊的 **Rich / Textual** 賽博暗黑互動面板（內建 `?` / `F1` 操作說明），兼顧無頭 CLI 自動化腳本執行；並內建 **XP Playground (`xp`)** 虛擬 CRT，整合 `HEX 3D` 與基於 CDP 的 **IE 6 真實瀏覽器**（支援終端 **Sixel HD** 即時投影）。

---

## 1. 環境需求與安裝升級

- **Python 版本**：`>= 3.9`（跨作業系統執行；Windows 版本內附便攜式 `yt-dlp.exe` 與 `UnRAR.exe`）。
- **本地狀態目錄**：個人設定（`settings.json`）、已校驗 FFmpeg 工具（`tools/`）、獨立 Chromium 登入檔案（`yt-session/`）、擷取的 YouTube Cookie（`cookies.txt`）、IE 6 書籤（`ie6_bookmarks.json`）與 `HEX 3D` 即時存檔（`hex3d_save.json`）統一存放於 `~/.pykuai/`。

### 從 PyPI 全新安裝

```bash
# 1. 核心工作台（安裝 rich、textual、openpyxl、Pillow、pypdf、numpy）
pip install pykuai

# 2. 依功能領域選裝擴充模組
pip install "pykuai[media]"    # yt-dlp + yt-dlp-ejs
pip install "pykuai[office]"   # pandas
pip install "pykuai[cv]"       # opencv-python + img2pdf
pip install "pykuai[archive]"  # rarfile
pip install "pykuai[ui]"       # PySide6

# 3. 完整安裝工作台與全部可選擴充（建議）
pip install "pykuai[all]"
```

### 從舊版本升級更新至 v1.2.8

若本機先前已安裝舊版（例如 `v1.2.7`），**請務必加上大寫 `-U`（`--upgrade`）**，否則 `pip` 只會提示 `Requirement already satisfied` 而不會覆寫更新：

```bash
# 建議指令：升級完整版工作台與全部可選依賴
pip install -U "pykuai[all]"

# 若只需升級核心工作台
pip install -U pykuai
```

> **鏡像源同步提示**：若所在地區的 `pip` 鏡像站於新版剛發布後尚未同步完成，可暫時指定官方上游來源立即更新：
> ```bash
> pip install -U "pykuai[all]" -i https://pypi.org/simple
> ```

### 從原始碼安裝（開發者）

```bash
git clone https://github.com/GallantTarry/pykuai.git
cd pykuai
pip install -e ".[all]"
```

---

## 2. 啟動方式與全域指令

安裝 PyKuai 後會自動註冊全域 `pykuai` 指令入口（`pykuai.cli:main`），同時支援 `python -m pykuai` 執行。

### 啟動參數一覽

| 指令 | 執行行為 |
| :--- | :--- |
| `pykuai` | 啟動完整 REPL 互動主控台（高 DPI 像素貪吃蛇開場動畫 + v1.2.8 雙欄賽博橫幅） |
| `pykuai --fast`（或 `--no-intro`、`-f`） | 跳過開場動畫，立即進入 REPL 主控台 |
| `python -m pykuai` | 以 Python 模組形式等效啟動 |
| `pykuai xp` / `pykuai xp hex` | 直接進入 XP Playground 遊樂場（或直達 `HEX 3D` 遊戲） |
| `pykuai help` / `pykuai --help` | 輸出歡迎橫幅與內建指令參考表 |
| `pykuai --version` | 顯示目前版本號（`pykuai version 1.2.8`）後結束 |

> **REPL 操作體驗亮點**：v1.2.8 首頁橫幅採用左右並排設計，於 `PYKUAI` 標誌右側顯示版本與作者資訊（`pykuai v1.2.8`、`TuKuai | GallantTarry`）以及可直接用滑鼠點擊的 **`🔊 SFX ON / 🔇 SFX OFF`** 全域音效切換鍵（窄終端會自動換行）。同時具備即時按鍵/游標/貼上復古 CC0 音效、拖曳圖片路徑自動啟動 `ifc` 預載轉換，以及退出時由背景 Windows Terminal `watchdog` 安全還原視窗標題與圖示。

### 全域主控台指令

可在 REPL 提示符（`pykuai ❯:`）內直接輸入，或在系統終端加上 `pykuai` 前綴呼叫：

| 指令 | 名稱 | 功能說明 |
| :--- | :--- | :--- |
| `tt` | **Tool Tray** | 開啟互動式工具托盤面板（或直接執行 `tt <tool> [args]`） |
| `pp` | **Pull Packages** | 掃描引擎依賴並透過 `pip` 檢查、安裝或升級套件 |
| `xp` | **XP Playground** | 播放 3D 開機過場並進入虛擬 Windows XP CRT（內含 `HEX 3D` 與 `IE 6` 瀏覽器） |
| `cc` | **Clear Console** | 清空終端畫面並重繪雙欄歡迎橫幅 |
| `help` | **Command Reference** | 顯示全域指令速查表 |
| `gg` | **Good Game** | 安全退出主控台並還原終端視窗識別狀態 |

### 互動面板快捷鍵與控制項

- **`?` 或 `F1`**（或點擊右上角 `?`）：於 `tt`、`pp`、`ifc`、`ytd`、`xp` 內部開啟懸浮操作指南（`HelpModalScreen`）。
- **`🔊 SFX ON / 🔇 SFX OFF` 按鈕**（位於歡迎橫幅右側與工具托盤右下角）：點擊即時切換復古 CC0 音效，狀態自動儲存於 `~/.pykuai/settings.json`。
- **`Esc` / `Ctrl+C`**：自目前面板返回或安全離開。

---

## 3. 內建引擎 01：`ifc` — 影像格式轉換與圖示打包

快速轉換點陣圖常見格式，並打包多解析度 `.ico` Windows 應用程式圖示容器。

### 核心能力
- **目標輸出格式（`-t / --to`）**：支援 `ico`、`png`、`jpg`、`webp`、`bmp`、`gif`、`tiff`、`avif`（亦可依 `-o` 副檔名自動推斷；預設為 `ico`）。
- **廣泛輸入支援**：透過 Pillow 支援 `PNG`、`JPG/JPEG`、`WEBP`、`BMP`、`GIF`、`TIFF/TIF`、`ICO`、`ICNS`、`AVIF`、`TGA`、`PPM`、`DDS`、`PSD` 等格式。
- **影像安全處理管線**：
  - 轉換前自動依 EXIF 旋轉資訊正規化影像方向。
  - 從 `ICO`/`ICNS` 自動抽取最高解析度圖層，或讀取動畫檔第一幀。
  - 輸出無透明通道格式（`JPG` / `BMP`）時，自動將透明像素合成純白背景。
  - 寫檔採用同目錄暫存檔原子替換機制，避免中斷損毀或誤覆寫原檔。
- **多尺寸 `.ico` 封裝**：
  - 面板提供 `Std`、`All`、`Web` 快速預設，亦可於 `8..256 px` 範圍自由勾選尺寸組合。
  - 非正方形原圖會以等比例不變形方式居中置於透明正方形畫布。
  - 針對 `<= 32 px` 小尺寸圖層自動施加溫和的 `UnsharpMask` 邊緣銳化（可由介面關閉或傳入 `--no-sharpen`）。

### CLI 指令範例與參數

```bash
# 開啟互動式影像轉換面板
pykuai tt ifc

# 將 PNG 轉為 90% 畫質的 WebP
pykuai tt ifc logo.png -t webp -q 90

# 打包多解析度 Windows 應用程式圖示
pykuai tt ifc logo.png -t ico -s 16,32,48,64,128,256 -o app.ico

# 關閉小尺寸圖示邊緣銳化
pykuai tt ifc sprite.png -t ico -s 16,32 -o icon.ico --no-sharpen
```

| 參數 | 預設值 | 說明 |
| :--- | :--- | :--- |
| `image` | `""` | 來源影像路徑（留空則啟動互動式操作面板） |
| `-t, --to` | `""` | 目標格式（`ico`、`png`、`jpg`、`webp`、`bmp`、`gif`、`tiff`、`avif`） |
| `-s, --sizes` | `16,32,48,64,128,256` | 以逗號分隔的 `.ico` 圖層尺寸（`8..256` px） |
| `-q, --quality` | `92` | 適用於 `jpg`、`webp`、`avif` 的壓縮畫質（`1..100`） |
| `-o, --output` | 自動產生 | 輸出檔案路徑 |
| `--no-sharpen` | `False` | 停用 `<= 32 px` ICO 圖層銳化處理 |

---

## 4. 內建引擎 02：`ytd` — YouTube 與多平台影音下載器

整合 `yt-dlp` 與 `FFmpeg` 下載串流影片或擷取高音質音訊，針對現代 Windows 瀏覽器 Cookie 鎖庫與 YouTube 人機驗證進行深度適配。

### 格式預設與別名

| `-f / --format` | 說明 | CLI 別名 |
| :--- | :--- | :--- |
| `best` *（預設）* | 最佳畫質視訊與音訊自動混流為 `.mp4` | `video`、`mp4` |
| `1080p` | 最高 1080p 視訊與音訊混流為 `.mp4` | — |
| `720p` | 最高 720p 視訊與音訊混流為 `.mp4` | — |
| `mp3` | 擷取最高品質 `.mp3` 音訊（`--audio-quality 0`） | `audio` |
| `m4a` | 擷取原生／轉碼 `.m4a` 音訊 | — |

### 關鍵特性

1. **免擴充套件一鍵 `Login YouTube`（`--login`）**  
   新版 Windows Chromium 瀏覽器（`Chrome/Edge 127+`）會鎖定運作中的 SQLite Cookie 資料庫（`yt-dlp #7271`）並強制使用 App-Bound Encryption（`#10927`）。點擊面板中的 **`Login YouTube`**（或執行 `pykuai tt ytd --login`），即可啟動位於 `~/.pykuai/yt-session` 的隔離瀏覽器設定檔；於官方登入頁登入後會自動匯出 `~/.pykuai/cookies.txt`——完全不更動個人日常瀏覽器資料、無需任何第三方擴充功能。互動下載若遇登入或機器人驗證攔截，亦會主動提示開啟登入並自動續傳重試。

2. **自動探測本機 Cookie 檔案**  
   即使未指定 `--cookies`，`ytd` 也會自動掃描輸出目標資料夾、目前工作目錄、`~/.pykuai/cookies.txt` 與 `~/Downloads/cookies.txt`。

3. **按需下載並經 SHA256 校驗的 FFmpeg 安裝器（`--install-ffmpeg`）**  
   為保持 PyPI 套件精簡（約 24 MB 而非 200+ MB），FFmpeg 會先於系統 `PATH` 或 `~/.pykuai/tools/` 尋找。Windows 環境若缺少 FFmpeg，執行 `pykuai tt ytd --install-ffmpeg`（或接受互動提示）即可經由 `urllib` / `curl` / 直連多重回退機制下載官方精簡套件並進行 SHA256 校驗安裝。

4. **JS 挑戰解析與下載穩定性強化**  
   偵測到系統已安裝 Node.js 或 Deno 時自動啟用 `ejs:github` JS 挑戰解算；當 Python 環境的 `yt-dlp` 缺乏 `curl_cffi` 時優先改用隨附的便攜版 `yt-dlp.exe`（`2026.10.26`）。

### CLI 指令範例與參數

```bash
# 開啟互動式影音下載面板
pykuai tt ytd

# 下載最佳畫質單支 MP4 影片（預設忽略 &list=，除非傳入 -p）
pykuai tt ytd "https://www.youtube.com/watch?v=..." -f best

# 擷取 MP3 音訊或下載內嵌中英雙語字幕至指定資料夾
pykuai tt ytd "https://www.youtube.com/watch?v=..." -f mp3 --subs -o ./music

# 僅探測並列出可用視訊/音訊串流格式，不實際下載
pykuai tt ytd "https://www.youtube.com/watch?v=..." -F

# 透過隔離瀏覽器登入 YouTube 並匯出 ~/.pykuai/cookies.txt
pykuai tt ytd --login

# 在 Windows 自動下載並 SHA256 校驗安裝 FFmpeg/FFprobe 至 ~/.pykuai/tools/
pykuai tt ytd --install-ffmpeg
```

| 參數 | 預設值 | 說明 |
| :--- | :--- | :--- |
| `url` | `""` | 目標影片、Shorts、播放清單或支援平台網址 |
| `-f, --format` | `best` | `best`、`1080p`、`720p`、`mp3`、`m4a`（支援 `video`/`mp4`/`audio`） |
| `-p, --playlist` | `False` | 下載完整播放清單或合輯（`--yes-playlist`） |
| `--subs` | `False` | 下載中英雙語字幕並於具備 FFmpeg 時嵌入檔案 |
| `--cookies-from-browser` | `none` | `none`、`chrome`、`edge`、`firefox`、`brave` |
| `--cookies` | `""` | 手動指定 Netscape `cookies.txt` 路徑 |
| `--proxy` | `""` | 自訂 HTTP / SOCKS 代理網址 |
| `-F, --list-formats` | `False` | 僅列出所有可用格式與串流清單 |
| `--login` | `False` | 開啟隔離 Chromium 登入 YouTube 並寫入 `~/.pykuai/cookies.txt` |
| `--install-ffmpeg` | `False` | 安裝經 SHA256 校驗的 FFmpeg/FFprobe 至 `~/.pykuai/tools/` |
| `-o, --output-dir` | `.` | 輸出存放資料夾 |

---

## 5. 全域依賴檢查與安裝器：`pp` — Pull Packages

`pp` 結合 `pyproject.toml` 宣告、各活躍引擎的 `requires` 清單以及 AST 第三方模組匯入掃描，全面盤點並維護目前 Python 執行環境。

```bash
# 開啟互動式依賴管理 TUI 面板
pykuai pp

# 僅檢查依賴狀態，不進行安裝
pykuai pp --check

# 免確認自動安裝缺少的核心與掃描到的套件
pykuai pp -y

# 升級所有追蹤中的相依套件
pykuai pp -y --all -U
```

---

## 6. 虛擬 CRT 遊樂場：`xp` — XP Playground

從 3D 臥室潛行開機過場直達終端機內的 **虛擬 Windows XP Bliss CRT 桌面**：

```bash
# 播放 3D 開機過場並進入虛擬 Windows XP 桌面
pykuai xp

# 直接啟動 CRT 內的 HEX 3D 遊戲視窗
pykuai xp hex

# 輸出 XP Playground 內建項目與最高紀錄表格
pykuai xp help
```

### 核心玩法與功能

1. **3D 開機過場與 Windows XP 歡迎畫面**：  
   每次啟動自動播放 3D 透視房間潛行過場與合成降 E 大調 Windows XP 開機音效；過場期間可隨時按 `Space`、`Enter` 或滑鼠點擊快進直達 `Bliss` 桌面。
2. **原生樣式 IE 6 真實瀏覽器（`pykuai/arcade/ie6.py`）**：  
   - 點擊桌面 **`IE 6`** 圖示即可在終端視窗內瀏覽真實網頁，底層由本機 Chrome/Edge CDP（`Page.startScreencast`）驅動並自動繼承本地系統代理設定。
   - **Sixel HD 真像素即時投影與自動降級**：透過 `CSI 16t` / `DA1` 探測終端儲存格像素尺寸，支援由 `numpy` 非同步向量化加速的 `128` 色量化 `P2=1` Sixel 高清串流（`HD·Six`）；若終端不支援 Sixel 則自動無縫回退至 24-bit 真彩半字元畫（`HB·Blk`），並提供 `View` / `Txt` 純文字閱讀切換。
   - **直達網址與即時互動**：於 `Addr` 位址列輸入網址或裸網域即可直接開啟網頁（不劫持跳轉第三方搜尋引擎）；支援直接滑鼠點擊、滾輪捲動、網頁原生輸入與動態游標錨定（中文/系統輸入法候選框緊貼點擊位置不跑偏），個人書籤（`★ Save` / `Del`）儲存於 `~/.pykuai/ie6_bookmarks.json`，無書籤時工具列會自動收起保持極簡。
3. **內建 `HEX 3D` 小遊戲（`xp hex`）**：  
   - 採用 2×2 四象限亞像素畫布呈現 3D 彩色六邊形與斑點蛇，延續「壞掉的左鍵」經典規則（按 `D` / `方向右鍵` 順時針旋轉、`W` / `方向上鍵` 快速前進）。
   - 支援即時狀態存檔與讀檔（`F5` / `F8` 存於 `~/.pykuai/hex3d_save.json`）、重新開始或暫停（`R` / `P` / `Space` / `Enter`），以及按 `✕` / `Esc` / `Q` 返回 XP 桌面；於桌面選擇 `START -> OFF` 即可關機回到 `pykuai ❯` 主控台。

---

## 7. 擴充新引擎（三字母外掛規範）

只要在 `pykuai/engines/` 下放入以**三個純小寫英文字母**命名的 `.py` 模組（例如 `pykuai/engines/pdf.py`）並繼承 `pykuai.core.base.BaseEngine`：

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

無需修改核心程式，重新啟動 `pykuai` 後，微內核會自動於 `tt` 托盤註冊 `pdf`，綁定 `pykuai tt pdf ...` 指令路由，並讓 `pp` 自動追蹤其 `requires` 與匯入套件。

---

## 8. 更新日誌 — v1.2.8 與 v1.2.7

### v1.2.8（最新版本）

- **PyPI 正式發布（`1.2.8`）**：發布通用 Wheel（`pykuai-1.2.8-py3-none-any.whl`）與原始碼發行包（`pykuai-1.2.8.tar.gz`），並將 `numpy>=1.24.0` 提升為核心必選相依（已安裝舊版的使用者可執行 `pip install -U "pykuai[all]"` 升級）。
- **雙欄歡迎橫幅與全域 `SFX` 切換按鈕**：重新設計首頁終端橫幅（`ui.py`），將 `pykuai v1.2.8`、`Author: TuKuai | GallantTarry` 等中繼資訊與可滑鼠點擊切換的 `🔊 SFX ON / 🔇 SFX OFF` 膠囊開關置於 `PYKUAI` 圖樣右側，並搭配簡潔引導提示（`Type help for commands — or gg to quit.`）。
- **XP Playground 遊樂場（`xp`）**：加入 3D 臥室潛行開機過場與極簡 Windows XP `Bliss` 桌面，支援局部靜默增量更新、單擊啟動應用、`START -> OFF` 關機流程與 `HEX 3D` 即時存取檔（`F5` / `F8`）。
- **XP 桌面內建原生 IE 6 真實瀏覽器（`ie6.py`）**：於 XP CRT 視窗內整合由本機 Edge/Chrome CDP 驅動的真實瀏覽器，支援網址列直達跳轉、系統代理自動繼承、`~/.pykuai/ie6_bookmarks.json` 個人書籤與 `View` / `Txt` 檢視切換。
- **Sixel HD 真像素投影與無閃爍合成**：透過 `CSI 16t` / `DA1` 探測終端儲存格像素並於背景執行緒跑 `numpy` `128` 色量化 `P2=1` Sixel 串流，不支援時自動降級為 `HB·Blk` 半字元畫；導入 `\x1b[?2026h` 原子同步輸出消除焦點切換黑閃，並將細豎線游標動態錨定於網頁點擊座標以修正輸入法位置偏移，同時移除冗餘按鈕並於空書籤時自動隱藏書籤列。

### v1.2.7

- **PyPI 正式發布（`1.2.7`）**：透過 GitHub Actions OIDC Trusted Publishing 乾淨發布 Wheel 與原始碼套件。
- **免擴充一鍵登入 `Login YouTube`（`--login`）**：新增隔離瀏覽器設定檔登入流程（`yt_auth.py`），自動匯出 `~/.pykuai/cookies.txt`，不影響個人主瀏覽器並支援驗證攔截後自動重試。
- **輕量化封裝與按需安裝 FFmpeg（`--install-ffmpeg`）**：移除逾 200 MiB 的隨附 FFmpeg 二進位檔，改為缺失時提示並經 SHA256 校驗按需安裝至 `~/.pykuai/tools/`。
- **全域 `?` / `F1` 面板操作指南**：為 `tt`、`pp`、`ifc` 與 `ytd` 統一加上右上角 `?` 按鈕與 `HelpModalScreen` 說明視窗。
- **工具鏈與介面調校**：升級隨附便攜版 `yt-dlp.exe`（`2026.10.26`）與 `UnRAR.exe`（`7.30 beta 2`），於無 `curl_cffi` 環境優先調度隨附 `yt-dlp.exe`，並強化窄終端版面適配與純英文文件同步。

---

## 9. 上游開源致謝

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** —— 驅動 `ytd` 的串流媒體解析引擎
- **[FFmpeg](https://ffmpeg.org/)** —— 影音混流與高音質音訊轉碼核心
- **[Pillow](https://python-pillow.org/)** —— 驅動 `ifc` 的多格式點陣圖與 ICO 圖示處理庫
- **[Textual](https://textual.textualize.io/)** 與 **[Rich](https://github.com/Textualize/rich)** —— 賽博暗黑互動 TUI 元件與終端排版引擎
- **[Kenney Audio](https://kenney.nl/)** 與 **[CC0 Public Domain Sounds](https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds)** —— 復古 CC0 街機按鍵與點擊音效素材

---

© 2026 Created by **TuKuai (GallantTarry)**. All rights reserved.
