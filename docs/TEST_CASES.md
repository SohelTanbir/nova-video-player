# NovaPlay — Test Plan

Covers all features of the PotPlayer-inspired web video player.

## Test Environment
- Browser: Chrome / Edge / Firefox (latest)
- Device: Desktop (mouse + keyboard)
- Files: Open `index.html` directly (file://) or serve via local HTTP

---

## 1. Playlist Management

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PL-01 | Add single video file | File → Open File → select 1 video | File appears in playlist panel; count = 1 |
| PL-02 | Add multiple video files | File → Open File → select multiple videos | All files appear in playlist; count updates |
| PL-03 | Add folder | File → Open Folder → select folder with videos | All videos in folder added recursively |
| PL-04 | Drag & drop files | Drag video files onto player window | Files added to playlist |
| PL-05 | Open URL | File → Open URL → paste valid video URL | URL item added to playlist |
| PL-06 | Click playlist item to play | Click any playlist item | Video loads; item highlighted as active |
| PL-07 | Remove playlist item | Hover item → click X remove button | Item removed; count decrements; if it was playing, player stops |
| PL-08 | Clear playlist | Playback → Clear Playlist (or button) | Playlist emptied; video stops; count = 0 |
| PL-09 | Drag reorder playlist | Drag item A above item B → drop | Order changes; active index follows item |
| PL-10 | Search playlist | Type in playlist search box | Only matching items visible |
| PL-11 | Save playlist | File → Save Playlist | Playlist persisted in localStorage |
| PL-12 | Load playlist | File → Load Playlist | Previously saved playlist restored |
| PL-13 | Playlist persistence | Refresh browser | Playlist items still present |

## 2. Playback Controls

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PB-01 | Play video | Click Play button or Space | Video starts; button shows Pause |
| PB-02 | Pause video | Click Pause or Space | Video pauses; button shows Play |
| PB-03 | Stop video | Click Stop or S | Video stops; currentTime = 0; poster shows |
| PB-04 | Next video | Click Next / N / Right | Loads next playlist item; loops if repeat-all |
| PB-05 | Previous video | Click Prev / P / Left | Loads previous item; restarts if >3s played |
| PB-06 | End of playlist (no repeat) | Play last item to end | Stops; "End of playlist" status |
| PB-07 | Repeat One | Toggle Repeat until "Repeat One" | Same video replays automatically on end |
| PB-08 | Repeat All | Toggle Repeat until "Repeat All" | Loops from last to first item |
| PB-09 | Shuffle on | Toggle Shuffle | Next/Prev picks random non-current item |
| PB-10 | Shuffle off | Toggle Shuffle off | Next/Prev follows linear order |

## 3. Progress Bar & Seeking

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SK-01 | Progress updates | Play video | Progress bar moves; current time updates |
| SK-02 | Seek via progress click | Click middle of progress bar | Video jumps to that time |
| SK-03 | Seek via progress drag | Drag progress thumb | Video seeks to dragged position |
| SK-04 | Seek forward 5s | Press Right arrow | currentTime + 5s |
| SK-05 | Seek backward 5s | Press Left arrow | currentTime - 5s |
| SK-06 | Seek forward 60s | Ctrl + Right | currentTime + 60s |
| SK-07 | Seek backward 60s | Ctrl + Left | currentTime - 60s |
| SK-08 | Jump to percent | Press 0–9 | Jumps to 0%–90% of duration |
| SK-09 | Tooltip on progress | Hover over progress bar | Time tooltip appears |

## 4. Volume & Mute

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| VOL-01 | Volume slider | Drag volume slider | Volume changes; icon updates |
| VOL-02 | Mute | Press M or click volume icon | Volume = 0; mute icon shown |
| VOL-03 | Unmute | Press M again | Previous volume restored; unmute icon |
| VOL-04 | Volume up/down | Up / Down arrow | Volume increases/decreases by 5% |
| VOL-05 | Volume persistence | Refresh browser | Last volume setting restored |

## 5. Playback Speed

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SP-01 | Open speed menu | Click speed button | Modal opens with speed options |
| SP-02 | Change speed | Click 1.5x | Video plays at 1.5x; button shows 1.5x |
| SP-03 | Speed options | 0.5, 0.75, 1, 1.25, 1.5, 2, 3 | All speeds apply correctly |
| SP-04 | Speed persistence | Refresh browser | Last speed restored |

## 6. Fullscreen & Picture-in-Picture

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| FS-01 | Enter fullscreen | Press F or click fullscreen | Video fills screen; controls adapt |
| FS-02 | Exit fullscreen | Press Esc | Returns to windowed mode |
| FS-03 | Double-click video | Double-click video area | Toggles fullscreen |
| PiP-01 | Enter PiP | Click PiP button | Video floats in small window |
| PiP-02 | Exit PiP | Close PiP window | Returns to main player |

## 7. Aspect Ratio

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AR-01 | Cycle aspect | Click aspect button repeatedly | Cycles: Fit → Fill → 16:9 → 4:3 → Stretch → Fit |
| AR-02 | Video fills container | Select Fill | Video stretches to fill container |
| AR-03 | Video contains | Select Fit | Video maintains aspect ratio with letterboxing |

## 8. Subtitles

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SUB-01 | Load subtitle | Subtitle → Load Subtitle File → select .vtt/.srt | Subtitle track loaded; status message |
| SUB-02 | Toggle subtitle | Press C | Subtitles show/hide |
| SUB-03 | Subtitle offset | Subtitle → Subtitle Settings → set offset ms → Apply | Subtitle timing shifted |
| SUB-04 | Invalid subtitle | Load non-subtitle file | Error / no cues added |

## 9. Audio & Equalizer

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AU-01 | Open EQ | Audio → Audio Effects | EQ modal opens with Bass/Mid/Treble sliders |
| AU-02 | Adjust EQ | Move sliders | Audio tone changes (if audio graph available) |
| AU-03 | Reset EQ | Click Reset | All sliders return to 0 |
| AU-04 | Mute | Audio → Mute | Audio silenced |

## 10. Library (Recent / Bookmarks / History)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| LIB-01 | Recent files | Library → Recent | Recently played files listed |
| LIB-02 | Bookmark current | Play video → press B | Video added to bookmarks |
| LIB-03 | Play bookmark | Library → Bookmarks → click item | Video loads and plays from bookmarked time |
| LIB-04 | Remove bookmark | Click bookmark again / B again | Bookmark removed |
| LIB-05 | History | Library → History | Playback history listed with timestamps |

## 11. Keyboard Shortcuts

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| KB-01 | Play/Pause | Space | Toggles play/pause |
| KB-02 | Stop | S | Stops video |
| KB-03 | Previous | P / Left | Previous item |
| KB-04 | Next | N / Right | Next item |
| KB-05 | Mute | M | Toggles mute |
| KB-06 | Fullscreen | F | Toggles fullscreen |
| KB-07 | Volume | Up/Down | Volume ±5% |
| KB-08 | Open file | O | File picker opens |
| KB-09 | Add to playlist | Ctrl + A | File picker opens for playlist |
| KB-10 | Toggle subtitle | C | Subtitles on/off |
| KB-11 | Bookmark | B | Bookmarks current video |
| KB-12 | Show shortcuts | ? | Shortcuts modal opens |

## 12. UI & Persistence

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| UI-01 | Controls hide | Play video, stop moving mouse | Controls fade after 3s |
| UI-02 | Controls show | Move mouse | Controls reappear |
| UI-03 | Chip notification | Load new video | Title chip appears briefly |
| UI-04 | Tooltip | Hover buttons | Tooltips appear |
| UI-05 | Settings persist | Change volume/speed/repeat → refresh | Settings restored |
| UI-06 | Playlist persists | Add items → refresh | Playlist items remain |
| UI-07 | Responsive | Resize window | Layout adapts; sidebar/playlist toggle |

## 13. Error Handling

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ERR-01 | Invalid video file | Open corrupted/non-video file | Error status; no crash |
| ERR-02 | Empty playlist | Press Play with no items | "Playlist is empty" status |
| ERR-03 | Blocked autoplay | Load video (browser blocks autoplay) | "Click play to start" status; manual play works |

## 14. Advanced Playback (v2)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ADV-01 | Resume playback | Play a video to ~30s, reload, replay it | Toast "Resumed from 0:30"; playback starts there |
| ADV-02 | Resume cleared near end | Play to within 3s of the end, reload | No resume offered |
| ADV-03 | A–B loop | Press `[` at 10s, `]` at 20s | Yellow range shown; video loops 10–20s |
| ADV-04 | A–B clear | Press `\` | Range removed; button deactivates |
| ADV-05 | Frame step | Pause, press `.` / `,` | Advances/rewinds one frame |
| ADV-06 | Volume boost | Set boost to 200% | Louder output (Web Audio gain) |
| ADV-07 | Snapshot | Click camera button | PNG of current frame downloads |
| ADV-08 | Theater mode | Press `T` | Sidebar + playlist hide; video expands |
| ADV-09 | Statistics overlay | Press `I` | Overlay shows resolution/speed/buffered |

## 15. Equalizer & Color (v2)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| EQ-01 | Open equalizer | Click sliders button | Drawer opens, scrolled to EQ |
| EQ-02 | Change band | Drag a band slider | Audio tone changes; value persists |
| EQ-03 | Apply preset | Click "Bass Boost" | Sliders jump to preset values |
| EQ-04 | Brightness | Drag brightness slider | Video gets brighter/darker |
| EQ-05 | Contrast / saturation | Drag sliders | Video adjusts accordingly |
| EQ-06 | Rotate | Click rotate left/right | Video rotates 90° each click |
| EQ-07 | Flip | Click flip H / V | Video mirrors |
| EQ-08 | Reset video | Click "Reset video adjustments" | All filters/rotation restored |

## 16. Playlist Upgrade (v2)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PLU-01 | Drag reorder | Drag an item above another | Order changes; toast confirms |
| PLU-02 | Context menu | Right-click an item | Menu appears (Play, Play next, Bookmark, Copy, Remove) |
| PLU-03 | Play next | Context → Play next | Item moves right after current |
| PLU-04 | Copy title | Context → Copy title | Title copied; toast confirms |
| PLU-05 | Grid view | Click grid toggle | Playlist switches to 2-column grid |
| PLU-06 | Export m3u | Click export | `playlist.m3u` downloads |
| PLU-07 | Import m3u | Click import, pick file | Entries added to playlist |
| PLU-08 | Auto thumbnail | Play a video | Playlist thumb shows a frame |
| PLU-09 | Search | Type in search | Playlist filters live |

## 17. Subtitles & Chapters (v2)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SC-01 | Load subtitle | Settings → Load subtitles | Cues appear; toast with cue count |
| SC-02 | Font size | Change font size | Subtitle text resizes |
| SC-03 | Text color | Pick a color | Subtitle color changes |
| SC-04 | Background | Change background | Subtitle box style changes |
| SC-05 | Sync offset | Drag offset slider | Subtitle timing shifts |
| SC-06 | Toggle subtitles | Press `C` | Subtitles on/off |
| SC-07 | Load chapters | Settings → Load chapters (VTT) | Markers appear on timeline |

## 18. Scrub Previews & UI (v2)

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SP-01 | Scrub preview | Play a video, hover the timeline | Thumbnail popup + time follows cursor |
| SP-02 | Buffered range | Play a video | Lighter buffered bar visible ahead |
| SP-03 | Theme switch | Settings → Light / OLED | Whole UI re-themes instantly |
| SP-04 | Accent color | Click a swatch | Accent updates (buttons, timeline) |
| SP-05 | Toast | Trigger any action | Toast slides in top-right |
| SP-06 | Media keys | Press keyboard media play/pause | Playback toggles (Media Session) |
| SP-07 | Auto-hide controls | Play, stop moving mouse | Controls fade after ~3s |

---

## How to Run Automated Tests

### Unit tests (Node.js)
```bash
cd "H:/Full Stack Web Development/My Projects/Players/Video Player"
node tests/unit/logic.test.js
```

### Browser integration tests
1. Serve the folder (`npx serve`) and open `tests/integration/runner.html`
2. Open the browser Console (F12)
3. Test results print automatically; a pass/fail summary is shown

### Manual tests
Follow the step-by-step cases above and mark each ID as Pass/Fail.