// ============================================================
// NovaPlay — Pure logic unit tests (Node.js runnable)
// Mirrors the pure helper functions in index.html
// ============================================================

/* ---- Pure helpers (copied from the player) ---- */

const fmt = s => {
    if (!isFinite(s) || s < 0) return '0:00';
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60, p = n => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${m}:${p(ss)}`;
};
const base = p => (p || '').split(/[\\/]/).pop() || p || '';
const uid = () => 'v' + Date.now() + Math.random().toString(36).slice(2, 7);
const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16); let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};
const EQ_PRESETS = {
    Flat: [0, 0, 0, 0, 0], 'Bass Boost': [9, 6, 0, -1, -2], 'Treble Boost': [-2, -1, 0, 6, 9], Rock: [6, 3, -2, 3, 6],
    Pop: [-1, 2, 4, 2, -1], Vocal: [-3, 0, 5, 4, 0], Classical: [4, 2, -2, 2, 4], Loudness: [8, 4, -4, 4, 8], Podcast: [-2, 1, 4, 2, -1]
};
function parseSubs(text) {
    const cues = [], blocks = text.replace(/\ufeff/, '').replace(/\r/g, '').split(/\n\s*\n/);
    for (const b of blocks) {
        const lines = b.trim().split('\n');
        const tl = lines.find(l => /\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}/.test(l));
        if (!tl) continue;
        const m = tl.match(/(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/);
        if (!m) continue;
        const t = (h, mi, s, ms) => +h * 3600 + +mi * 60 + +s + +ms.padEnd(3, '0') / 1000;
        const txt = lines.filter(l => l !== tl && !/^\d+$/.test(l.trim())).map(l => l.trim()).filter(Boolean).join(' ');
        cues.push({ start: t(m[1], m[2], m[3], m[4]), end: t(m[5], m[6], m[7], m[8]), text: txt });
    }
    return cues;
}
function reorder(pl, current, from, to) {
    const [it] = pl.splice(from, 1);
    pl.splice(to, 0, it);
    let c = current;
    if (c === from) c = to;
    else if (c > from && c <= to) c--;
    else if (c >= to && c < from) c++;
    return { playlist: pl, current: c };
}
function clampVolume(v) { return Math.max(0, Math.min(1, +v)); }

/* ---- Test runner ---- */
const tests = []; let pass = 0, fail = 0;
function test(name, fn) { tests.push({ name, fn }); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || ''}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function ok(c, msg) { if (!c) throw new Error(msg || 'assertion failed'); }

/* fmt */
test('fmt: 0', () => eq(fmt(0), '0:00'));
test('fmt: 5', () => eq(fmt(5), '0:05'));
test('fmt: 90', () => eq(fmt(90), '1:30'));
test('fmt: 3661', () => eq(fmt(3661), '1:01:01'));
test('fmt: 7200', () => eq(fmt(7200), '2:00:00'));
test('fmt: negative', () => eq(fmt(-3), '0:00'));
test('fmt: NaN', () => eq(fmt(NaN), '0:00'));
test('fmt: Infinity', () => eq(fmt(Infinity), '0:00'));

/* base */
test('base: windows path', () => eq(base('C:\\a\\b\\movie.mp4'), 'movie.mp4'));
test('base: unix path', () => eq(base('/x/y/clip.mkv'), 'clip.mkv'));
test('base: url', () => eq(base('https://site.com/f/v.webm'), 'v.webm'));
test('base: plain', () => eq(base('file.mp4'), 'file.mp4'));
test('base: empty', () => eq(base(''), ''));

/* shade */
test('shade: lighten', () => eq(shade('#000000', 40), '#282828'));
test('shade: clamp white', () => eq(shade('#ffffff', 40), '#ffffff'));
test('shade: darken', () => eq(shade('#808080', -40), '#585858'));

/* uid */
test('uid: unique & prefixed', () => { const a = uid(), b = uid(); ok(a !== b, 'unique'); ok(a.startsWith('v'), 'prefix'); });

/* clampVolume */
test('clampVolume: above 1', () => eq(clampVolume(1.5), 1));
test('clampVolume: below 0', () => eq(clampVolume(-0.5), 0));
test('clampVolume: mid', () => eq(clampVolume(0.65), 0.65));

/* parseSubs */
test('parseSubs: SRT', () => {
    const srt = `1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n2\n00:00:05,000 --> 00:00:09,500\nSecond line\n`;
    const c = parseSubs(srt);
    eq(c.length, 2, 'count');
    eq(c[0].start, 1); eq(c[0].end, 4); eq(c[0].text, 'Hello world');
    eq(c[1].start, 5); eq(c[1].end, 9.5); eq(c[1].text, 'Second line');
});
test('parseSubs: VTT dot separators', () => {
    const vtt = `WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHi\n`;
    const c = parseSubs(vtt);
    eq(c.length, 1); eq(c[0].start, 1); eq(c[0].end, 4); eq(c[0].text, 'Hi');
});
test('parseSubs: two-digit hours', () => {
    const s = `1\n01:02:03,400 --> 01:02:05,000\nLate\n`;
    const c = parseSubs(s);
    eq(c[0].start, 3723.4); eq(c[0].end, 3725);
});
test('parseSubs: short ms (1 digit)', () => {
    const s = `1\n00:00:01,5 --> 00:00:04,25\nX\n`;
    const c = parseSubs(s);
    eq(c[0].start, 1.5); eq(c[0].end, 4.25);
});
test('parseSubs: multi-line cue text joined', () => {
    const s = `1\n00:00:01,000 --> 00:00:04,000\nLine one\nLine two\n`;
    const c = parseSubs(s);
    eq(c[0].text, 'Line one Line two');
});
test('parseSubs: empty', () => eq(parseSubs('').length, 0));
test('parseSubs: garbage', () => eq(parseSubs('no cues here at all').length, 0));
test('parseSubs: CRLF handled', () => {
    const s = `1\r\n00:00:01,000 --> 00:00:02,000\r\nCRLF\r\n`;
    const c = parseSubs(s);
    eq(c.length, 1); eq(c[0].text, 'CRLF');
});

/* reorder */
test('reorder: first to last', () => {
    const r = reorder(['a', 'b', 'c'], 0, 0, 2);
    eq(r.playlist.join(','), 'b,c,a'); eq(r.current, 2);
});
test('reorder: last to first', () => {
    const r = reorder(['a', 'b', 'c'], 2, 2, 0);
    eq(r.playlist.join(','), 'c,a,b'); eq(r.current, 0);
});
test('reorder: middle shifts down', () => {
    const r = reorder(['a', 'b', 'c', 'd'], 0, 1, 3);
    eq(r.playlist.join(','), 'a,c,d,b'); eq(r.current, 0);
});
test('reorder: current shifts up', () => {
    const r = reorder(['a', 'b', 'c', 'd'], 3, 3, 1);
    eq(r.playlist.join(','), 'a,d,b,c'); eq(r.current, 1);
});

/* EQ presets integrity */
test('EQ presets: all have 5 bands', () => {
    Object.values(EQ_PRESETS).forEach(v => eq(v.length, 5, 'bands'));
});
test('EQ presets: values within -12..12', () => {
    Object.values(EQ_PRESETS).forEach(v => v.forEach(g => ok(g >= -12 && g <= 12, 'range ' + g)));
});
test('EQ presets: Flat is all zeros', () => eq(EQ_PRESETS.Flat.join(','), '0,0,0,0,0'));

/* ---- Run ---- */
for (const t of tests) {
    try { t.fn(); pass++; console.log('PASS: ' + t.name); }
    catch (e) { fail++; console.error('FAIL: ' + t.name + '\n  ' + e.message); }
}
console.log(`\n${pass} passed, ${fail} failed, ${tests.length} total`);
process.exit(fail > 0 ? 1 : 0);
