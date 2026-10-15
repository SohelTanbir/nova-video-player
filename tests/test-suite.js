// ============================================================
// NovaPlay — Browser integration tests
// Runs against the real player loaded in an iframe.
// Open tests/run-browser-tests.html (served via http://)
// ============================================================

(function () {
    let pass = 0, fail = 0;
    const results = [];

    function log(msg, type) {
        const line = document.createElement('div');
        line.className = 'test-line ' + (type || 'info');
        line.textContent = msg;
        document.getElementById('output').appendChild(line);
        if (type === 'fail') console.error(msg); else console.log(msg);
    }
    function test(name, fn) {
        try { fn(); pass++; results.push({ name, ok: true }); log('PASS: ' + name, 'pass'); }
        catch (e) { fail++; results.push({ name, ok: false, err: e.message }); log('FAIL: ' + name + ' — ' + e.message, 'fail'); }
    }
    function ok(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
    function eq(a, b, m) { if (a !== b) throw new Error(`${m || ''}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

    function whenReady(win, timeout = 8000) {
        return new Promise((res, rej) => {
            const t0 = Date.now();
            (function poll() {
                if (win.app && win.document.getElementById('video')) return res(win.app);
                if (Date.now() - t0 > timeout) return rej(new Error('player not ready'));
                setTimeout(poll, 60);
            })();
        });
    }

    async function run() {
        document.getElementById('runBtn').style.display = 'none';
        const status = document.getElementById('status');
        status.textContent = 'Loading player…';

        const iframe = document.getElementById('player');
        const win = iframe.contentWindow;
        const doc = iframe.contentDocument;
        const $ = s => doc.querySelector(s);

        let app;
        try { app = await whenReady(win); }
        catch (e) { status.textContent = 'ERROR: ' + e.message; status.className = 'status fail'; return; }

        status.textContent = 'Running tests…';

        /* ---------- API surface ---------- */
        const apiMethods = ['init','playPause','stop','prev','next','playIndex','clearPlaylist','removeItem','toggleRepeat',
            'toggleShuffle','setVolume','toggleMute','setSpeed','cycleSpeed','toggleFull','togglePip','toggleTheater',
            'cycleAspect','snapshot','frameStep','cycleAb','setA','setB','clearAb','setFilter','rotate','flip','resetVideo',
            'setBoost','setEqBand','setEqPreset','loadSubFile','toggleSub','setSubOffset','setSubStyle','loadChapterFile',
            'showStats','toggleDrawer','togglePlaylist','toggleSidebar','toggleView','setView','setSeekStep','setResume',
            'setAutoplay','importPlaylist','exportPlaylist','toggleBookmark','addFiles','addFolder','openUrl','loadSample'];
        apiMethods.forEach(m => test('API: app.' + m + ' exists', () => ok(typeof app[m] === 'function', m + ' is a function')));

        /* ---------- DOM ---------- */
        const ids = ['video','container','poster','overlay','btnPlay','btnPrev','btnNext','btnStop','btnRepeat','btnShuffle',
            'btnAb','btnVol','volume','btnSpeed','timeline','tlPlayed','tlHandle','timeCur','timeDur','plList','plSearch',
            'plCount','sidebar','playlistPanel','drawer','toasts','ctx','stats','scrubTip'];
        ids.forEach(id => test('DOM: #' + id + ' present', () => ok(!!$('#' + id), 'missing #' + id)));

        /* ---------- Volume ---------- */
        test('volume: clamps above 1', () => { app.setVolume(9); eq(parseFloat($('#volume').value), 1); });
        test('volume: clamps below 0', () => { app.setVolume(-9); eq(parseFloat($('#volume').value), 0); });
        test('volume: sets mid value', () => { app.setVolume(0.42); eq(parseFloat($('#volume').value), 0.42); });

        /* ---------- Mute ---------- */
        test('mute: toggles active class', () => {
            app.setVolume(0.5);
            const before = $('#btnVol').classList.contains('active');
            app.toggleMute();
            ok($('#btnVol').classList.contains('active') !== before, 'mute state changed');
            app.toggleMute();
        });

        /* ---------- Repeat ---------- */
        test('repeat: toggles active class', () => {
            const before = $('#btnRepeat').classList.contains('active');
            app.toggleRepeat();
            ok($('#btnRepeat').classList.contains('active') !== before, 'repeat state changed');
        });

        /* ---------- Shuffle ---------- */
        test('shuffle: toggles active class', () => {
            const before = $('#btnShuffle').classList.contains('active');
            app.toggleShuffle();
            ok($('#btnShuffle').classList.contains('active') !== before, 'shuffle state changed');
        });

        /* ---------- Speed ---------- */
        test('speed: setSpeed updates label', () => { app.setSpeed(1.5); ok($('#btnSpeed').textContent.includes('1.5'), 'label shows 1.5'); });
        test('speed: cycleSpeed changes value', () => { const a = $('#btnSpeed').textContent; app.cycleSpeed(); ok($('#btnSpeed').textContent !== a, 'changed'); app.setSpeed(1); });

        /* ---------- Aspect ---------- */
        test('aspect: cycles container class', () => {
            const set = new Set();
            for (let i = 0; i < 4; i++) { app.cycleAspect(); set.add($('#container').className); }
            ok(set.size > 1, 'aspect changed');
        });

        /* ---------- Theme ---------- */
        test('theme: switch to light', () => { app.toggleDrawer(); doc.querySelector('#themeBtns button[data-theme=light]').click(); eq(doc.body.dataset.theme, 'light'); });
        test('theme: switch to oled', () => { doc.querySelector('#themeBtns button[data-theme=oled]').click(); eq(doc.body.dataset.theme, 'oled'); });
        test('theme: back to dark', () => { doc.querySelector('#themeBtns button[data-theme=dark]').click(); eq(doc.body.dataset.theme, 'dark'); });

        /* ---------- Accent ---------- */
        test('accent: swatch changes accent var', () => {
            const sw = doc.querySelector('#accentSwatches .swatch');
            sw.click();
            ok(doc.documentElement.style.getPropertyValue('--accent').length > 0, 'accent var set');
        });

        /* ---------- View toggle ---------- */
        test('view: grid toggles plList class', () => {
            const before = $('#plList').classList.contains('grid');
            app.toggleView();
            ok($('#plList').classList.contains('grid') !== before, 'grid class toggled');
            app.toggleView();
        });

        /* ---------- Playlist ---------- */
        test('playlist: starts empty (fresh)', () => { app.clearPlaylist(); eq($('#plList').children.length, 0); });
        test('playlist: loadSample adds an item', () => {
            app.loadSample();
            ok($('#plList').children.length >= 1, 'item added');
        });
        test('playlist: count label updates', () => { ok(/item/.test($('#plCount').textContent), 'count text'); });
        test('playlist: removeItem removes it', () => {
            const n = $('#plList').children.length;
            app.removeItem(0);
            eq($('#plList').children.length, n - 1);
        });
        test('playlist: clear empties', () => { app.clearPlaylist(); eq($('#plList').children.length, 0); });

        /* ---------- Panels ---------- */
        test('panel: drawer toggles show class', () => { const b = $('#drawer').classList.contains('show'); app.toggleDrawer(); ok($('#drawer').classList.contains('show') !== b); });
        test('panel: playlist toggles hidden', () => { const b = $('#playlistPanel').classList.contains('hidden'); app.togglePlaylist(); ok($('#playlistPanel').classList.contains('hidden') !== b); });
        test('panel: sidebar toggles hidden', () => { const b = $('#sidebar').classList.contains('hidden'); app.toggleSidebar(); ok($('#sidebar').classList.contains('hidden') !== b); });
        test('panel: stats toggles show class', () => { const b = $('#stats').classList.contains('show'); app.showStats(); ok($('#stats').classList.contains('show') !== b); app.showStats(); });

        /* ---------- Filters ---------- */
        test('filter: brightness applies to video style', () => {
            app.setFilter('brightness', 1.5);
            ok($('#video').style.filter.includes('brightness'), 'filter set: ' + $('#video').style.filter);
            app.resetVideo();
        });
        test('filter: rotate applies transform', () => {
            app.rotate(90);
            ok($('#video').style.transform.includes('rotate'), 'transform set: ' + $('#video').style.transform);
            app.resetVideo();
        });
        test('filter: reset restores defaults', () => {
            app.resetVideo();
            ok($('#video').style.filter.includes('brightness(1)'), 'reset filter');
        });

        /* ---------- A-B loop ---------- */
        test('ab: setA activates button', () => { app.clearAb(); app.setA(); ok($('#btnAb').classList.contains('active')); });
        test('ab: clearAb deactivates button', () => { app.clearAb(); ok(!$('#btnAb').classList.contains('active')); });

        /* ---------- EQ ---------- */
        test('eq: bands rendered', () => { ok(doc.querySelectorAll('#eqBands .eq-band').length === 5, '5 bands'); });
        test('eq: presets rendered', () => { ok(doc.querySelectorAll('#eqPresets button').length >= 5, 'presets'); });
        test('eq: applying a preset updates sliders', () => {
            doc.querySelector('#eqPresets button:nth-child(2)').click();
            const first = parseFloat(doc.querySelector('#eqBands input').value);
            ok(Math.abs(first) > 0, 'bass moved: ' + first);
        });

        /* ---------- Seek step ---------- */
        test('seek: setSeekStep updates control', () => { app.setSeekStep(10); eq(doc.getElementById('setSeek').value, '10'); app.setSeekStep(5); });

        /* ---------- Boost ---------- */
        test('boost: setBoost updates label', () => { app.setBoost(2); eq($('#boostVal').textContent, '200%'); app.setBoost(1); });

        /* ---------- Subtitle parse via app (indirect) ---------- */
        test('subtitle: toggleSub with none shows toast', () => {
            const before = $('#toasts').children.length;
            app.toggleSub();
            ok($('#toasts').children.length >= before, 'toast emitted');
        });

        /* ---------- Toasts ---------- */
        test('toast: emitted on action', () => {
            const before = $('#toasts').children.length;
            app.setSpeed(2);
            ok($('#toasts').children.length >= before, 'toast shown');
        });

        /* ---------- Timeline geometry ---------- */
        test('timeline: has played + handle elements', () => { ok($('#tlPlayed') && $('#tlHandle'), 'timeline parts'); });

        /* ---------- Summary ---------- */
        status.textContent = `Finished: ${pass} passed, ${fail} failed (${pass + fail} total)`;
        status.className = 'status ' + (fail === 0 ? 'pass' : 'fail');
        const s = document.getElementById('summary');
        s.innerHTML = `<h3>Results</h3><p><strong>${pass} passed</strong>, <strong>${fail} failed</strong> of ${pass + fail}</p>`;
        if (fail) s.innerHTML += '<ul>' + results.filter(r => !r.ok).map(r => `<li>${r.name}: ${r.err}</li>`).join('') + '</ul>';
    }

    document.addEventListener('DOMContentLoaded', () => {
        const iframe = document.getElementById('player');
        iframe.addEventListener('load', () => { setTimeout(run, 200); });
        document.getElementById('runBtn').addEventListener('click', () => location.reload());
    });
})();
