<div align="center">

# 🎬 NovaPlay

**An advanced, single-file web video player — playlist, equalizer, color correction, A–B loop, resume playback, scrub previews, and more.**

Built with vanilla HTML, CSS, and JavaScript. No build step. No dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?logo=javascript&logoColor=black)](#)
[![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#)
[![Single file](https://img.shields.io/badge/single--file-yes-success)](#)

<!-- Replace with your live demo URL after enabling GitHub Pages -->
**[▶ Live Demo](https://YOUR-USERNAME.github.io/novaplay/)**

</div>

---

## ✨ Features

### Playback
- Play / Pause / Stop, Previous / Next, Repeat (off · all · one), Shuffle
- **Resume playback** — remembers your position per video and offers to continue
- **A–B loop** — loop any selected range
- **Frame-by-frame** stepping
- Playback speed **0.25× – 4×**
- **Picture-in-Picture**, **Fullscreen**, and **Theater mode**
- Aspect ratio: Fit / Fill / Stretch

### Audio
- Volume + mute with per-session memory
- **Volume boost** up to **400%** (Web Audio gain)
- **5-band graphic equalizer** with 9 presets

### Video
- **Color correction** — brightness / contrast / saturation
- **Rotate 90°** and **flip** horizontal / vertical
- **Snapshot** — save the current frame as PNG
- **Scrub previews** — thumbnail popup on timeline hover
- Buffered-range indicator on the progress bar

### Subtitles & Chapters
- Load `.vtt` / `.srt` subtitles
- Subtitle **styling** (size, color, background) + **sync offset**
- **Chapter markers** on the timeline

### Playlist & Library
- Add files, **folder scan**, open URL, **drag & drop**
- **Drag-to-reorder**, live search, **list / grid view**
- **Right-click context menu** (play, play next, bookmark, copy, remove)
- **Import / export** `.m3u`
- Auto-generated **thumbnails**
- **Recent / Bookmarks / History** library tabs

### Interface
- Themes: **Dark / Light / OLED** + **accent color** picker
- Glassmorphism top bar, sliding settings drawer
- **Toast notifications**, keyboard-driven, responsive
- Fully **keyboard operable**

---

## 🚀 Quick start

Because NovaPlay is a single file, you can use it three ways:

**1. Just open it**
```bash
# double-click index.html — works for local files
```

**2. Serve locally** (recommended — blob URLs behave better over HTTP)
```bash
# Python
python -m http.server 8000

# or Node
npx serve
```
Then visit `http://localhost:8000/index.html`.

**3. GitHub Pages** — push this repo, then enable Pages (Settings → Pages → Deploy from branch → `main` / root). Your player goes live at `https://YOUR-USERNAME.github.io/novaplay/`.

---

## ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play / Pause |
| `S` | Stop |
| `←` / `→` | Seek back / forward (configurable step) |
| `Ctrl + ←` / `→` | Seek 60s |
| `J` / `L` | Seek −10s / +10s |
| `↑` / `↓` | Volume up / down |
| `,` / `.` | Frame back / forward |
| `P` / `PageUp` | Previous video |
| `N` / `PageDown` | Next video |
| `M` | Mute |
| `F` | Fullscreen |
| `T` | Theater mode |
| `C` | Toggle subtitles |
| `B` | Bookmark current time |
| `[` / `]` / `\` | Set A / Set B / Clear A–B loop |
| `+` / `-` | Speed up / down |
| `0`–`9` | Jump to 0%–90% |
| `O` | Open file |
| `G` | Settings drawer |
| `I` | Statistics overlay |
| `Esc` | Close overlays / exit fullscreen |
| `Ctrl + A` | Add files |

---

## 📁 Project structure

```
novaplay/
├── index.html                 # the entire player (single file)
├── README.md
├── LICENSE                    # MIT
├── TEST_CASES.md              # manual test plan (18 sections)
├── SUGGESTIONS.md             # feature / UI roadmap
└── tests/
    ├── unit-logic.js          # 35 pure-logic tests (Node.js)
    ├── test-suite.js          # browser integration tests
    └── run-browser-tests.html # test runner (loads the live player in an iframe)
```

---

## 🧪 Testing

**Unit tests** (pure logic — time formatting, subtitle parsing, playlist reorder, EQ presets):

```bash
node tests/unit-logic.js
# → 35 passed, 0 failed
```

**Integration tests** (runs ~90 assertions against the real player in an iframe):

```bash
npx serve
# then open http://localhost:3000/tests/run-browser-tests.html
```

The test runner also shows the live player side-by-side.

---

## 🛠️ Tech stack

- **HTML5 `<video>`** + Custom Controls
- **Web Audio API** — equalizer + volume boost
- **Canvas API** — snapshots + thumbnail generation
- **Media Session API** — OS media keys & lock-screen controls
- **Picture-in-Picture API**, **Fullscreen API**
- **VTTCue / TextTrack** — subtitles & chapters
- **localStorage** — persistence
- **FontAwesome** (CDN) — icons

---

## 🗺️ Roadmap

See [`SUGGESTIONS.md`](SUGGESTIONS.md) for the full list. Highlights not yet built:
HLS/live streaming, Chromecast, clip/GIF export, multi audio-track switching, online subtitle search.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2026 Sohel Rana

---

<div align="center">
Made with ❤️ and vanilla JavaScript
</div>
