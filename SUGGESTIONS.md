# NovaPlay — Feature & UI Roadmap

Ideas to take the player from "works" to "feels like a real desktop player".

Legend: 🟢 easy · 🟡 medium · 🔴 advanced

---

## 1. Playback Features

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 1 | **Resume playback** — remember last position per video, offer "Continue from 2:31?" | Huge QoL, expected in every player | 🟢 |
| 2 | **A–B loop** — set loop start/end points | Study/music practice | 🟢 |
| 3 | **Scrub previews** — thumbnail popup when hovering the progress bar | Pro feel, faster navigation | 🟡 |
| 4 | **Frame-by-frame** — step forward/back one frame (`,` / `.`) | Precise seeking | 🟢 |
| 5 | **Chapter support** — parse WebVTT chapters, marker dots on timeline | Long videos / courses | 🟡 |
| 6 | **Skip interval config** — user picks 5/10/30s seek step | Power users | 🟢 |
| 7 | **Sleep timer** — stop after N minutes | Watching in bed | 🟢 |
| 8 | **Loop count** — play a clip N times | Practice | 🟢 |

## 2. Audio

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 9 | **Volume boost** — amplify past 100% (up to 400%) via Web Audio gain | Quiet videos | 🟢 |
| 10 | **Graphic equalizer** — 5–10 band EQ with presets | PotPlayer signature | 🟡 |
| 11 | **Normalize volume** — dynamic range compression | Consistent loudness | 🟡 |
| 12 | **Audio track picker** — switch between multiple audio tracks | Multi-language files | 🔴 |
| 13 | **Per-video volume** — remember volume/mute per file | QoL | 🟢 |

## 3. Video & Visuals

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 14 | **Color controls** — brightness / contrast / saturation / gamma (CSS filters) | Poor lighting fix | 🟢 |
| 15 | **Rotate / flip** — 90° rotation and mirror | Phone-recorded clips | 🟢 |
| 16 | **Zoom & pan** — pinch/scroll to zoom into frame | Detail inspection | 🟡 |
| 17 | **Deinterlace toggle** | Old interlaced footage | 🟢 |
| 18 | **Snapshot** — capture current frame as PNG (save/download) | Thumbnails, memes | 🟢 |
| 19 | **Clip export** — save a segment as a short recording | Highlights | 🔴 |

## 4. Subtitles

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 20 | **Subtitle styling** — font, size, color, outline, background | Accessibility | 🟢 |
| 21 | **Multiple tracks** — load & switch several subtitle files | Multi-language | 🟡 |
| 22 | **Auto-load matching subtitle** — same-name `.srt` next to video | Convenience | 🟡 |
| 23 | **Sync controls** — nudge subtitle ±0.1s in real time | Timing fixes | 🟢 |
| 24 | **Search subtitles online** — via OpenSubtitles API | Huge convenience | 🔴 |

## 5. Playlist & Library

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 25 | **Drag-to-reorder** with visual drop indicator | Expected in playlists | 🟡 |
| 26 | **Auto-generated thumbnails** — capture a frame per video | Visual playlist | 🟡 |
| 27 | **Playlist import/export** — `.m3u` / `.m3u8` / `.pls` | Portability | 🟡 |
| 28 | **Folder scan** — pick a folder, auto-add all videos | Bulk add | 🟢 |
| 29 | **Watch later / queue** — separate upcoming queue | Session planning | 🟡 |
| 30 | **Search across library** — recent + bookmarks + history | Find things fast | 🟢 |
| 31 | **Context menu** — right-click item for Play / Remove / Reveal / Copy name | Pro UX | 🟢 |
| 32 | **Grid/list view toggle** | Browsing preference | 🟢 |

## 6. Integration & System

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 33 | **Media Session API** — OS media keys, lock-screen controls, notification art | Essential UX | 🟢 |
| 34 | **Cast / AirPlay** — send to TV | Living room | 🔴 |
| 35 | **Picture-in-Picture** (have it) + **mini floating player** in-page | Multitask | 🟡 |
| 36 | **Keyboard shortcut editor** — remap keys, save profile | Power users | 🟡 |
| 37 | **Open URL / stream** — HLS (`.m3u8`) live streams | Streaming | 🔴 |
| 38 | **Statistics overlay** — resolution, fps, bitrate, dropped frames | Diagnostics | 🟡 |

---

## UI / UX Redesign Proposal

### A. Visual style — "modern desktop player"
- **Glassmorphism control bar** — `backdrop-filter: blur(12px)` with a translucent panel instead of the hard gradient.
- **Softer geometry** — larger corner radii (10–14px), layered shadows, 1px hairline borders at low opacity.
- **Custom SVG icons** instead of emoji (▶ ⏭ 🔊) for a crisp, consistent look.
- **Gradient accent** — subtle blue→cyan accent, used on the progress-filled track and active states.
- **Motion** — 150–200ms ease transitions; controls slide in, playlist items have hover lift.

### B. Layout
- **Timeline with layered track**: buffered range (light gray) + played range (accent gradient) + a scrub handle that grows on hover + chapter markers.
- **Hover tooltip with thumbnail** on the progress bar.
- **Grouped control bar**: left = transport (prev/play/next), center = time/progress, right = volume/speed/fullscreen. Center controls auto-center.
- **Slide-out settings drawer** (right side) replacing the floating panel, with sections: Playback, Audio, Video, Subtitles, Interface.
- **Collapsible sidebar** with a mini icon rail when collapsed.
- **Playlist cards**: bigger 16:9 thumbnail, title, duration, and a subtle progress underline for the currently-playing item.

### C. Theming
- **Theme switcher**: Dark · Light · OLED Black · Auto (system).
- **Accent color picker** (blue / purple / green / orange / red).
- Persist theme + accent in localStorage.

### D. Feedback & states
- **Toast notifications** (top-right) for "Added 3 items", "Bookmarked", "Speed 1.5×" instead of the tiny status text.
- **Empty states** with friendly illustration + "Open File" / "Drag & drop" buttons.
- **Loading skeletons** while metadata/thumbnails generate.
- **Focus rings** + full keyboard navigation (accessibility).

### E. Mobile / touch
- **Responsive**: bottom sheet playlist on phones, controls scale to touch size.
- **Gesture controls**: double-tap left/right = ±10s, vertical swipe = volume/brightness, pinch = zoom, single tap = show/hide controls.
- **Landscape fullscreen** lock option.

### F. Progress bar ideas
- Show **buffered** vs **played** segments.
- **Live hover preview** thumbnail.
- **Snap to chapter** when within a few pixels of a marker.
- Show **remaining time** (−1:23) as an option, not just elapsed.

---

## Suggested implementation order (quick wins first)

1. Resume playback + per-video volume (🟢, big impact)
2. Media Session API + keyboard frame-step + snapshots (🟢)
3. Toasts + theme switcher + glassmorphism polish (🟢/🟡)
4. Playlist drag-reorder + context menu + thumbnails (🟡)
5. Color controls + rotate/flip + equalizer (🟢/🟡)
6. Scrub previews + chapters + settings drawer (🟡)
7. HLS/streaming + cast + clip export (🔴, optional)
