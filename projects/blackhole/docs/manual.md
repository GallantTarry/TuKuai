# BlackHole User Manual & Changelog

Official Website: `https://土块.art`  
Purchase & Download: `https://wolverine624.gumroad.com/l/blackhole`

---

> ### 🛡️ Security & Commercial License Notice
> **1. Windows SmartScreen & Digital Signature**  
> **BlackHole v1.2.5** is digitally signed with an Authenticode certificate and DigiCert SHA-256 trusted timestamp. If Windows Defender SmartScreen displays an *"Windows protected your PC"* prompt on first launch, click **"More info"** and then click **"Run anyway"**.  
> **2. Commercial Proprietary Software**  
> BlackHole is a closed-source commercial software product. All rights are reserved by the author (`TuKuai / 土块`). Redistribution, reverse engineering, decompilation, or unauthorized commercial sharing of the installer or binaries is strictly prohibited.  
> **3. 100% Local Privacy Guarantee**  
> All file sorting, screenshots, sticky notes, and todo reminders are processed **100% locally on your device**. BlackHole never uploads your personal files or private notes to any external server.

---

# BlackHole User Manual (v1.2.5)

**BlackHole** is a cosmic desktop productivity companion for Windows 10 & Windows 11. It floats quietly on your desktop as an interactive singularity and combines **Drag-and-Drop Smart File Archiving**, **Flash Notes & Web Image Capture**, **Lossless Region Snipping & Screen Pinning**, **Scheduled Todo Reminders**, **Quick Bookmarks**, **Edge Auto-Docking**, **Bilingual Switching (English & 中文)**, and **One-Click Deep RAM Purge**.

---

## 1. Quick Start & Basic Controls

1. **Move Position**: Hold the **Left Mouse Button** on BlackHole and drag it anywhere on your screen.
2. **Open Main Context Menu**: **Right-click** directly on the BlackHole widget.
3. **Quick RAM Purge**: **Double-click** the BlackHole widget with the Left Mouse Button to immediately free dormant system memory.
4. **Swallow & Archive Anything**: Drag files, folders, selected text, URLs, or web images toward the center of BlackHole and release.
5. **Quick Region Snipping**: Press `Ctrl + Alt + Q` at any time.
6. **Hide / Wake BlackHole**: Press `Ctrl + Alt + E` at any time.
7. **System Tray Menu**: Right-click the BlackHole icon in the bottom-right Windows System Tray to access:
   - **Open BlackHole Portal**: Immediately open the archive root folder in Windows File Explorer.
   - **System Health**: View live CPU & RAM load (with hardware gauge icons) and trigger a deep RAM purge.
   - **Completed Todos**: Review or clear completed todo tasks.
   - **Settings**: Access **Language** (`English` / `中文`), **Reshape Size**, **Adjust Opacity**, **Snipping Tool**, and **Autostart (On/Off)**.
   - **Quit BlackHole**: Safely exit the application.

---

## 2. Smart File & Folder Archiving (Core Feature)

### 2.1 Where Do Swallowed Files Go?

When you first run BlackHole, it automatically creates a dedicated portal directory inside your Windows `Documents` folder:

- **English Mode Default**: `%USERPROFILE%\Documents\BlackHole_Portal` (e.g., `C:\Users\<YourUsername>\Documents\BlackHole_Portal`)
- **Chinese Mode Default**: `%USERPROFILE%\Documents\黑洞入口`

Inside the portal directory, BlackHole maintains **9 categorized matter realms** and routes every dropped item automatically based on its file type:

| Category Folder (English) | Category Folder (中文) | Supported File Types & Extensions |
| :--- | :--- | :--- |
| `001_Master_Folders` | `001_总文件夹` | Any folder dragged and dropped into BlackHole |
| `002_Spreadsheets` | `002_数据报表` | `.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods`, `.numbers`, `.db`, `.sqlite`, `.sql`, `.accdb`, `.mdb`, `.parquet`, `.feather` |
| `003_Daily_Docs` | `003_日常文档` | `.txt`, `.md`, `.markdown`, `.rst`, `.doc`, `.docx`, `.wps`, `.rtf`, `.odt`, `.pages`, `.pdf`, `.epub`, `.mobi`, `.azw3`, `.djvu`, `.chm`, `.log`, `.tex`, `.ppt`, `.pptx`, `.key`, `.odp`, `.pps`, `.ppsx` (plus Flash Notes `Accretion_*.md`) |
| `004_Applications` | `004_软件应用` | `.exe`, `.msi`, `.bat`, `.cmd`, `.ps1`, `.vbs`, `.wsf`, `.apk`, `.aab`, `.ipa`, `.dmg`, `.pkg`, `.deb`, `.rpm`, `.appimage`, `.jar`, `.gadget`, `.scr` |
| `005_Archives` | `005_压缩归档` | `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.tgz`, `.bz2`, `.tbz2`, `.xz`, `.txz`, `.zst`, `.lz`, `.lzma`, `.cab`, `.iso`, `.img`, `.vhd`, `.vhdx`, `.wim`, `.udf`, `.ace`, `.arj`, `.lzh`, `.uue`, `.z` |
| `006_Image_Assets` | `006_图像素材` | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`, `.ico`, `.tif`, `.tiff`, `.psd`, `.psb`, `.ai`, `.eps`, `.cdr`, `.indd`, `.raw`, `.cr2`, `.cr3`, `.nef`, `.arw`, `.dng`, `.orf`, `.rw2`, `.pef`, `.heic`, `.heif`, `.avif`, `.jxl`, `.dds`, `.tga`, `.exr`, `.hdr` |
| `007_Video_Media` | `007_视频媒体` | `.mp4`, `.mkv`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.m4v`, `.mpg`, `.mpeg`, `.3gp`, `.3g2`, `.ts`, `.mts`, `.m2ts`, `.vob`, `.ogv`, `.rm`, `.rmvb`, `.asf`, `.divx`, `.f4v`, `.swf`, `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.m4a`, `.wma`, `.ape`, `.alac`, `.opus`, `.aiff`, `.mid`, `.midi`, `.amr` |
| `008_Source_Code` | `008_工程代码` | `.py`, `.pyw`, `.ipynb`, `.js`, `.mjs`, `.cjs`, `.ts`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.html`, `.htm`, `.css`, `.scss`, `.sass`, `.less`, `.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx`, `.cs`, `.java`, `.kt`, `.kts`, `.scala`, `.groovy`, `.go`, `.rs`, `.rb`, `.php`, `.swift`, `.m`, `.mm`, `.dart`, `.lua`, `.r`, `.jl`, `.pl`, `.pm`, `.sh`, `.bash`, `.zsh`, `.fish`, `.asm`, `.s`, `.vb`, `.vbs`, `.pas`, `.f90`, `.f95`, `.clj`, `.ex`, `.exs`, `.erl`, `.hrl`, `.hs`, `.ml`, `.fs`, `.fsx`, `.v`, `.sv`, `.vhd`, `.vhdl`, `.sol`, `.json`, `.jsonc`, `.json5`, `.xml`, `.yaml`, `.yml`, `.toml`, `.ini`, `.cfg`, `.conf`, `.env`, `.properties`, `.gradle`, `.cmake`, `.mk`, `.dockerfile`, `.lock` |
| `009_Unknown_Matter` | `009_不明物质` | Any other file extension or extensionless file not listed above |

### 2.2 What Happens When a File Is Swallowed?

1. The file or folder is **moved** (not duplicated) from its original location into its matching category folder inside `BlackHole_Portal`.
2. If a file with the same name already exists in the destination folder, BlackHole never overwrites your existing file. Instead, it automatically appends a timestamp suffix:
   - Example: `Report_20260405_153012.xlsx`
3. You can drag and drop a **single file**, **multiple files at once**, or **entire folders**.

### 2.3 How to Retrieve Your Archived Files

- **Method 1**: Right-click BlackHole -> `Open BlackHole Portal` (or right-click the System Tray icon -> `Open BlackHole Portal`) to open the archive directory directly.
- **Method 2**: Right-click BlackHole -> hover over `Recent Swallowed`:
  - **Left-click a recent item**: Opens the file or folder immediately.
  - **Right-click a recent item**: Opens Windows File Explorer and highlights the exact file location.
- **Method 3**: Open `Documents\BlackHole_Portal` directly in Windows File Explorer.

---

## 3. Flash Notes, Web Links & Web Images

BlackHole can absorb more than local files—you can also drag text selections, web URLs, and images straight from your browser or other apps.

### 3.1 Dragging Text or Web URLs (Accretion Notes)

1. Highlight a paragraph of text in any browser, document, or chat window, or drag a URL from your browser's address bar.
2. Drag it into the center of BlackHole and release.
3. BlackHole automatically generates a Markdown note inside `003_Daily_Docs` (or `003_日常文档`):
   - Filename format: `Accretion_YYYYMMDD_HHMMSS.md`

### 3.2 Dragging Images & Dynamic Web Images

1. Drag an image from your browser (including dynamic WebP images, Baidu image results, or `data:image/...` base64 images) or another app into BlackHole.
2. BlackHole automatically inspects the binary magic bytes and HTTP `Content-Type` headers to preserve the true image format and saves it into `006_Image_Assets` (or `006_图像素材`):
   - Direct/Clipboard Image Data: `Image_YYYYMMDD_HHMMSS.png`
   - Downloaded Web Image: `WebImage_YYYYMMDD_HHMMSS.<ext>` (`.png`, `.jpg`, `.webp`, `.gif`, `.bmp`, or `.svg`)
3. If a remote web image blocks direct downloading, BlackHole automatically falls back to saving its source link inside `003_Daily_Docs` as `Accretion_YYYYMMDD_HHMMSS.md` so you never lose the reference.

---

## 4. Lossless Region Snipping Tool (`Horizon` Capture)

### 4.1 How to Start a Screenshot

- **Global Hotkey**: Press `Ctrl + Alt + Q` at any time.
- **Tray Menu**: Right-click the System Tray icon -> `Settings` -> `Snipping Tool`.

### 4.2 Snipping Controls

1. After triggering the snipping tool, the screen dims slightly.
2. **Hold Left Mouse Button and drag** to select the capture region.
3. Once a region is selected, choose your action:
   - Press `Enter`: Copies the screenshot to your **Clipboard** AND automatically saves a lossless PNG file to your **Desktop** named `Horizon_YYYYMMDD_HHMMSS.png`.
   - Press `Ctrl + T`: Turns the selected region into a floating **Screen Sticky Note (Pin)** directly on your screen.
   - Press `Esc` or **Right-click**: Cancels and exits snipping mode.

---

## 5. Screen Pinning (Floating Sticky Notes)

After pressing `Ctrl + T` during snipping, your capture stays pinned above all windows as a borderless reference card:

1. **Move Pin**: Hold the **Left Mouse Button** and drag it anywhere.
2. **Zoom In / Out**: Scroll the **Mouse Wheel** over the pinned image (scales smoothly by 10% per step).
3. **Right-Click Pin Menu**:
   - `Copy Image`: Copy the pinned image to the system clipboard.
   - `Save As...`: Save the pinned image to a custom path (defaults to `Horizon_YYYYMMDD_HHMMSS.png`).
   - `Close`: Dismiss the pinned sticky note.

---

## 6. Scheduled Todo Reminders

### 6.1 Adding a Todo Task

1. Right-click BlackHole -> click `Add Todo Task...`.
2. Enter the **Task Description** and select a **Reminder Time** (defaults to 10 minutes from now).
3. Click `OK` to save.

### 6.2 What Happens When a Task Is Due?

1. When the scheduled time arrives, BlackHole triggers an **event horizon alert animation** and pops up a system notification.
2. In the right-click menu, due tasks are highlighted with a red alert bell icon.

### 6.3 Completing, Deleting & Viewing History

1. Right-click BlackHole to view up to 5 active pending tasks right inside the main menu:
   - **Left-click a task**: Marks it as **Completed** and moves it to history.
   - **Right-click a task**: Permanently **Shreds (Deletes)** the task.
2. To review completed tasks: Right-click the **System Tray Icon** -> `Completed Todos`.
3. To clear history: Click `Clear Records` at the bottom of the `Completed Todos` submenu.

---

## 7. Quick Links (Cosmic Bookmarks)

Keep your most-visited websites one click away from your desktop singularity:

1. **Open a Link**: Right-click BlackHole -> `Quick Links` -> click any bookmark to open it in your default browser.
2. **Add a Link**: Right-click BlackHole -> `Quick Links` -> `Add Link`, then enter the **Title** and **URL** (if `http://` or `https://` is omitted, BlackHole automatically prefixes `https://`).
3. **Batch Edit / Delete Links**: Right-click BlackHole -> `Quick Links` -> `Edit Links`. This opens `bookmarks.txt` in Notepad.
   - Format: One bookmark per line as `Title|URL`, for example:
     ```text
     TuKuai Official|https://土块.art
     BlackHole Store|https://wolverine624.gumroad.com/l/blackhole
     ```
   - Save `bookmarks.txt` and your menu updates automatically.

---

## 8. Edge Auto-Docking, Appearance & Bilingual Switch

### 8.1 Smart 3-Edge Auto-Docking & Taskbar Avoidance

1. Drag BlackHole near the **Left, Right, Top, or Bottom edge** of your monitor and release.
2. BlackHole automatically tucks itself into the screen border, leaving only a sleek strip visible.
3. Move your mouse cursor over the exposed strip and BlackHole smoothly slides out; move your cursor away and it tucks back in automatically.
4. **Smart Windows Taskbar Avoidance**: BlackHole automatically detects whether your Windows Taskbar is docked at the **Bottom, Top, Left, or Right** of your screen and disables auto-hiding on that specific edge so the widget is never blocked by the taskbar.

### 8.2 Reshape Size & Adjust Opacity

Right-click the **System Tray Icon** -> `Settings`:
- **Reshape Size**: Adjust the diameter of BlackHole from `80` to `200` (default is `80`).
- **Adjust Opacity**: Adjust transparency from `20%` to `100%` (default is `100%`).

### 8.3 Launch on Windows Startup (`Autostart`)

- Right-click the **System Tray Icon** -> `Settings` -> `Autostart (On)` / `Autostart (Off)`.
- Autostart is **enabled by default** (`Autostart (On)`) so BlackHole is always ready when you boot into Windows.

### 8.4 Instant Bilingual Switch (`English` / `中文`)

1. Right-click the **System Tray Icon** -> `Settings` -> `Language` (globe icon).
2. Choose between **`English`** and **`中文`**.
3. When switched, BlackHole automatically renames the portal folder (`BlackHole_Portal` ↔ `黑洞入口`) and all 9 category folders (`001_Master_Folders`..`009_Unknown_Matter` ↔ `001_总文件夹`..`009_不明物质`) while keeping every single file intact, and seamlessly restarts the application in the selected language.

---

## 9. System Health & Deep RAM Purge

1. **Live Hardware Telemetry**: Right-click the **System Tray Icon** -> hover over `System Health` to inspect real-time **CPU Usage** and **Memory (RAM) Usage**, refreshed every 2 seconds with dedicated hardware icons.
2. **Deep RAM Purge**:
   - **Method 1**: **Double-click** the BlackHole widget on your desktop.
   - **Method 2**: Right-click the **System Tray Icon** -> `System Health` -> `Purge System RAM`.
   - BlackHole safely trims redundant background working sets across Windows processes and displays a cosmic notification showing the exact amount of memory reclaimed (in `MB`).

---

## 10. Hide / Wake, Exit & Data Backup

1. **Hide / Wake (`Ctrl + Alt + E`)**:
   - Press `Ctrl + Alt + E` at any time to hide BlackHole completely; press `Ctrl + Alt + E` again to summon it back.
   - Powered by a gaming-grade triple-layer Win32 hotkey filter (`MOD_NOREPEAT` + `GetAsyncKeyState` verification) so it never causes key-repeat loops or interferes with full-screen games.
2. **Quit Application**:
   - Right-click the **System Tray Icon** -> `Quit BlackHole`.
3. **Configuration & Data Files**:
   - In the application directory, BlackHole stores your personal preferences in three lightweight files:
     - `config.json`: Widget size, opacity, coordinates, autostart state, language preference, and recent swallowed file list.
     - `todos.json`: Pending and completed todo items.
     - `bookmarks.txt`: Custom quick links.
   - Backing up these three files preserves all of your custom settings across updates or PC migrations.

---

# BlackHole Changelog (Release Notes)

## V1.2.5 (Latest Commercial Release)

1. **Bilingual Interface & Smart Folder Migration (`English` & `中文`)**:
   - Added a `Language` switcher with a globe icon inside `System Tray -> Settings`.
   - Switching between `English` and `中文` automatically migrates and renames the archive portal (`BlackHole_Portal` ↔ `黑洞入口`) and all 9 category folders (`001_Master_Folders`..`009_Unknown_Matter` ↔ `001_总文件夹`..`009_不明物质`), then restarts BlackHole cleanly without menu freezes.
2. **Flawless Edge Auto-Docking & Automatic Taskbar Avoidance**:
   - Fixed the 1px dark border line artifact that could appear when BlackHole tucked into screen edges.
   - Added automatic Windows Taskbar edge detection (supporting Bottom, Top, Left, and Right taskbars). BlackHole now prevents docking on the taskbar edge while allowing smooth auto-docking on the other three screen borders.
3. **Enhanced Web Image Drag-and-Drop Engine**:
   - Added binary magic-byte inspection (`PNG`, `JPEG`, `GIF`, `WebP`, `BMP`, `SVG`) and HTTP `Content-Type` header parsing with browser `User-Agent`/`Referer` headers. Dragging dynamic WebP or Baidu images from browsers now saves them accurately into `006_Image_Assets` instead of falling back to markdown notes.
4. **Unified Cosmic File Naming**:
   - Region screenshots saved to Desktop or via Sticky Note `Save As...` now use the `Horizon_{timestamp}.png` naming scheme.
   - Dragged text snippets and flash notes saved to `003_Daily_Docs` now use the `Accretion_{timestamp}.md` naming scheme.
5. **Streamlined System Tray Menu & Hardware Icons**:
   - Consolidated configuration options into a clean `Settings` submenu in the System Tray.
   - Added vector hardware icons (`chip` & `gauge`) to live CPU and RAM telemetry inside `System Health`.
6. **Official Code Signing & Setup Wizard**:
   - Signed both the main executable and Windows installer (`BlackHolev1.2.5.exe`) with an Authenticode certificate and DigiCert SHA-256 timestamp, and added detached PKCS#7 verification (`BlackHolev1.2.5.zip.p7s`).

---

## V1.2.4

1. **Full-Screen Gaming Anti-Conflict Hotkey Engine**:
   - Upgraded global hotkeys (`Ctrl+Alt+E` and `Ctrl+Alt+Q`) to a triple-layer Win32 hardware filter: `RegisterHotKey` with `MOD_NOREPEAT` (`0x4000`) + real-time `GetAsyncKeyState` physical key verification + 400ms cooldown debounce, eliminating accidental triggers in full-screen games.
2. **4x Supersampled Anti-Aliasing & Per-Monitor V2 High-DPI**:
   - Enabled Windows `Per-Monitor V2` DPI awareness and `QImage` 4x supersampled offscreen rendering for razor-sharp visuals on 1080p, 2K, and 4K displays (100%–250% scaling).
   - Changed default widget size from `150` to a compact `80` (`80–200` adjustable range).
3. **Expanded 9-Category Sorter & Default Autostart**:
   - Expanded file classification rules to cover **170+ file extensions** across 9 categories.
   - Enabled `Autostart (On)` by default on first run with automatic registry path self-healing.
4. **Menu & Tray Refinement**:
   - Moved `Completed Todos`, `Reshape Size`, `Adjust Opacity`, `Snipping Tool`, and `Autostart` into the System Tray menu to keep the right-click BlackHole menu ultra-compact.
   - Added right-click support on `Recent Swallowed` items to reveal and highlight files directly in Windows File Explorer.

---

## V1.2.2

1. **Architecture Refactoring**:
   - Decoupled core physics, rendering, file routing, and system telemetry modules from `BlackHole.py` into `core.py` for faster startup and cleaner maintainability.
2. **Code Cleanup**:
   - Removed legacy experimental hooks and redundant dead code paths.

---

## V1.2.0

1. **System Health Telemetry & Deep RAM Purge**:
   - Added live CPU and Memory usage monitoring in the System Tray menu (updated every 2 seconds).
   - Added one-click / double-click `Purge System RAM` to reclaim background working set memory and display the exact MB freed.
2. **Quick Links & Recent Swallowed History**:
   - Added customizable `Quick Links` (`bookmarks.txt`) and `Recent Swallowed` history (stores up to 10 recent items).
3. **Top & Bottom Edge Auto-Docking**:
   - Extended edge auto-hiding from left/right borders to support top and bottom screen edges as well.

---

## V1.1.0

1. **Core Event Horizon Release**:
   - Desktop floating black hole widget with custom gravitational particle rendering and 9-category drag-and-drop automatic file sorting (`001`–`009`).
   - Built-in Region Snipping Tool (`Ctrl + Alt + Q`), Screen Pinning (`Ctrl + T`), Scheduled Todo Reminders, Size/Opacity adjustment, and Global Hide/Wake (`Ctrl + Alt + E`).
