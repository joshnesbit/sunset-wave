/* A Wave of 100 Gatherings — the map, the claim, the roster. */
(function () {
  var W = window.WAVE;
  var KEY = 'wave100.claims.v1';

  /* ---------- state ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return (window.SEED_CLAIMS || []).slice();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(claims)); } catch (e) {}
  }
  var claims = load();

  function hosts() { return claims.filter(function (c) { return c.kind === 'host'; }); }
  function helpers() { return claims.filter(function (c) { return c.kind === 'helper'; }); }
  function hostOf(blockId) {
    return hosts().filter(function (c) { return c.block === blockId; })[0] || null;
  }
  function helpersOf(blockId) {
    return helpers().filter(function (c) { return c.block === blockId; });
  }
  function hostedBlocks() {
    var seen = {};
    hosts().forEach(function (c) { seen[c.block] = true; });
    return Object.keys(seen);
  }

  /* ---------- tiny helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function initial(name) { return (name || '?').trim().charAt(0).toUpperCase(); }
  function wobble(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
    return ((h % 5) - 2) * 0.45;
  }

  /* ---------- the map ---------- */
  var grid = document.getElementById('grid');
  var tiles = {};

  function paintGrid() {
    grid.innerHTML = '';
    tiles = {};
    var nAve = W.AVENUES.length;
    grid.style.gridTemplateColumns = 'auto 16px repeat(' + nAve + ', var(--tile))';

    var park = el('div', 'parkband', 'GOLDEN GATE PARK');
    park.style.gridColumn = '3 / span ' + nAve;
    park.style.gridRow = '1';
    grid.appendChild(park);

    var ocean = el('div', 'oceanstrip', 'OCEAN BEACH');
    ocean.style.gridColumn = '2';
    ocean.style.gridRow = '3 / span ' + W.ROWS.length;
    grid.appendChild(ocean);

    W.AVENUES.forEach(function (a, i) {
      var lab = el('div', 'avlabel', a.key === 'SB' ? 'SB' : String(a.num));
      lab.style.gridColumn = String(3 + i);
      lab.style.gridRow = '2';
      grid.appendChild(lab);
    });

    W.ROWS.forEach(function (r, j) {
      var lab = el('div', 'rowlabel', r.north);
      lab.style.gridColumn = '1';
      lab.style.gridRow = String(3 + j);
      grid.appendChild(lab);

      W.AVENUES.forEach(function (a, i) {
        var id = W.id(a.key, r.key);
        var kind = W.groundKind(a.key, r.key);
        var t = el('button', 'tile');
        t.type = 'button';
        t.style.gridColumn = String(3 + i);
        t.style.gridRow = String(3 + j);
        t.style.setProperty('--r', wobble(id) + 'deg');
        if (kind) {
          t.classList.add('ground');
          t.disabled = true;
          t.setAttribute('aria-hidden', 'true');
          t.title = kind === 'boulevard' ? 'Sunset Blvd' : 'The reservoir';
        } else {
          t.dataset.block = id;
          t.addEventListener('click', function () { openBlock(id); });
        }
        grid.appendChild(t);
        tiles[id] = t;
      });
    });
    refreshTiles();
  }

  function refreshTiles() {
    Object.keys(tiles).forEach(function (id) {
      var t = tiles[id];
      if (t.classList.contains('ground')) return;
      var h = hostOf(id);
      var hs = helpersOf(id);
      t.classList.toggle('host', !!h);
      t.classList.toggle('open', !h && hs.length > 0);
      t.setAttribute('aria-label', W.label(id) + (h ? ' — ' + h.name + ' is hosting' :
        hs.length ? ' — ' + hs[0].name + ' can help, no host yet' : ' — no host yet'));
      t.title = h ? h.name + ' · ' + W.label(id) : W.label(id);
    });
  }

  function refreshCount() {
    var n = hostedBlocks().length;
    document.getElementById('count').textContent = n;
    document.getElementById('count-sub').textContent =
      n === 0 ? 'be the first' : n === 1 ? 'said yes' : 'said yes';
  }

  /* ---------- roster ---------- */
  var roster = document.getElementById('roster');

  function hostCard(h) {
    var card = el('div', 'hostcard');
    var title = el('h3');
    title.appendChild(el('span', 'dot', initial(h.name)));
    title.appendChild(document.createTextNode(h.name));
    if (h.steward) title.appendChild(el('span', 'tag', 'keeps this map'));
    else if (h.example) title.appendChild(el('span', 'tag', 'example'));
    card.appendChild(title);
    card.appendChild(el('p', 'where', W.label(h.block)));
    card.appendChild(el('p', 'hour', W.hourLabel(h.hour)));
    if (h.note) card.appendChild(el('p', 'note', '“' + h.note + '”'));

    var hs = helpersOf(h.block);
    if (hs.length) {
      card.appendChild(el('p', 'helpers',
        hs.map(function (x) { return x.name; }).join(' and ') +
        (hs.length > 1 ? ' are' : ' is') + ' helping on this block'));
    }
    var act = el('div', 'actions');
    var b = el('button', 'btn btn-ghost', 'I\'ll help ' + h.name);
    b.type = 'button';
    b.addEventListener('click', function () { openClaim('helper', h.block); });
    act.appendChild(b);
    card.appendChild(act);
    return card;
  }

  function waitingCard(blockId) {
    var hs = helpersOf(blockId);
    var w = el('div', 'waiting');
    w.appendChild(el('h3', null, W.label(blockId) + ' is waiting for a host'));
    w.appendChild(el('p', null, hs.map(function (x) { return x.name; }).join(' and ') +
      ' said they\'d help — somebody just has to open the garage.'));
    if (hs[0] && hs[0].note) w.appendChild(el('p', 'note', '“' + hs[0].note + '”'));
    var act = el('div', 'actions');
    var b = el('button', 'btn btn-coral', 'I\'ll host this block');
    b.type = 'button';
    b.addEventListener('click', function () { openClaim('host', blockId); });
    act.appendChild(b);
    w.appendChild(act);
    return w;
  }

  function refreshRoster() {
    roster.innerHTML = '';
    var hh = hosts().slice().sort(function (a, b) {
      return String(b.at || '').localeCompare(String(a.at || ''));
    });
    var orphan = {};
    helpers().forEach(function (c) { if (!hostOf(c.block)) orphan[c.block] = true; });
    var waiting = Object.keys(orphan);

    if (!hh.length && !waiting.length) {
      var e = el('div', 'empty');
      e.appendChild(el('p', null, 'No blocks yet. The first coral tile on this map is somebody\'s driveway — maybe yours.'));
      roster.appendChild(e);
      return;
    }

    roster.appendChild(el('h2', null, hh.length === 1 ? 'One block so far' : hh.length + ' blocks so far'));
    roster.appendChild(el('p', 'sub', 'Each one picks its own hour. Walk over and say hi — that\'s the whole idea.'));
    var cards = el('div', 'cards');
    hh.forEach(function (h) { cards.appendChild(hostCard(h)); });
    roster.appendChild(cards);
    waiting.forEach(function (b) { roster.appendChild(waitingCard(b)); });
  }

  function refreshAll() { refreshTiles(); refreshCount(); refreshRoster(); }

  /* ---------- block dialog ---------- */
  var blockDlg = document.getElementById('block');
  var blockBody = document.getElementById('block-body');

  function openBlock(id) {
    var h = hostOf(id);
    if (!h) { openClaim('host', id); return; }
    blockBody.innerHTML = '';
    var title = el('h2');
    title.appendChild(el('span', 'dot', initial(h.name)));
    title.appendChild(document.createTextNode(' ' + h.name + ' is hosting'));
    blockBody.appendChild(title);
    blockBody.appendChild(el('p', 'where', W.label(h.block)));
    blockBody.appendChild(el('p', 'hour', W.hourLabel(h.hour)));
    if (h.note) blockBody.appendChild(el('p', 'note', '“' + h.note + '”'));
    var hs = helpersOf(id);
    if (hs.length) blockBody.appendChild(el('p', 'helpers',
      hs.map(function (x) { return x.name; }).join(' and ') + ' already offered to help.'));

    var act = el('div', 'actions');
    var help = el('button', 'btn btn-coral', 'I\'ll help ' + h.name);
    help.type = 'button';
    help.addEventListener('click', function () { blockDlg.close(); openClaim('helper', id); });
    var mine = el('button', 'btn btn-ghost', 'I\'ll host my own block');
    mine.type = 'button';
    mine.addEventListener('click', function () { blockDlg.close(); openClaim('host', null); });
    act.appendChild(mine);
    act.appendChild(help);
    blockBody.appendChild(act);
    blockDlg.showModal();
  }
  blockDlg.addEventListener('click', function (e) { if (e.target === blockDlg) blockDlg.close(); });

  /* ---------- claim dialog ---------- */
  var dlg = document.getElementById('claim');
  var form = document.getElementById('claim-form');
  var formBody = document.getElementById('form-body');
  var doneBody = document.getElementById('done-body');
  var fAve = document.getElementById('f-ave');
  var fRow = document.getElementById('f-row');
  var fHour = document.getElementById('f-hour');
  var errEl = document.getElementById('err');
  var mode = 'host';

  W.AVENUES.forEach(function (a) {
    fAve.appendChild(new Option(W.aveName(a.key), a.key));
  });
  W.ROWS.forEach(function (r) {
    fRow.appendChild(new Option(r.north + ' & ' + r.south, r.key));
  });
  W.HOURS.forEach(function (h) { fHour.appendChild(new Option(h.label, h.key)); });

  function setMode(m) {
    mode = m;
    Array.prototype.forEach.call(document.querySelectorAll('.mode'), function (b) {
      b.classList.toggle('on', b.dataset.mode === m);
    });
    document.getElementById('claim-title').textContent =
      m === 'host' ? 'I\'ll host on my block' : 'I\'ll help on a block';
    document.getElementById('mode-hint').textContent = m === 'host'
      ? 'Your driveway, front steps, or a corner of the park. Two hours is plenty.'
      : 'Chairs, ice, a folding table, an extra pair of hands — a captain will connect you with the host.';
    document.getElementById('hour-wrap').hidden = m !== 'host';
    document.getElementById('submit').textContent =
      m === 'host' ? 'Count my block in' : 'Count me in to help';
  }
  Array.prototype.forEach.call(document.querySelectorAll('.mode'), function (b) {
    b.addEventListener('click', function () { setMode(b.dataset.mode); });
  });

  function openClaim(m, blockId) {
    formBody.hidden = false;
    doneBody.hidden = true;
    doneBody.innerHTML = '';
    errEl.hidden = true;
    setMode(m || 'host');
    if (blockId) {
      var p = String(blockId).split('|');
      fAve.value = p[0];
      fRow.value = p[1];
    }
    dlg.showModal();
    setTimeout(function () { document.getElementById('f-name').focus(); }, 30);
  }

  document.getElementById('cta-host').addEventListener('click', function () { openClaim('host', null); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'), function (b) {
    b.addEventListener('click', function () { dlg.close(); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var contact = document.getElementById('f-contact').value.trim();
    var note = document.getElementById('f-note').value.trim();
    var block = W.id(fAve.value, fRow.value);

    if (!name) return fail('What should neighbors call you?');
    if (!contact) return fail('A phone number or email, so a captain can reach you.');
    if (mode === 'host' && hostOf(block)) {
      return fail(hostOf(block).name + ' is already hosting that block — switch to “I\'ll help on a block,” or pick another block.');
    }
    errEl.hidden = true;

    var claim = {
      id: 'c' + Date.now(),
      kind: mode,
      name: name,
      contact: contact,
      block: block,
      hour: mode === 'host' ? fHour.value : null,
      note: note,
      at: new Date().toISOString()
    };
    claims.push(claim);
    save();
    refreshAll();
    showDone(claim);
  });

  function fail(msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function showDone(claim) {
    formBody.hidden = true;
    doneBody.hidden = false;
    doneBody.innerHTML = '';

    var n = hostedBlocks().length;
    doneBody.appendChild(el('p', 'bignum', n + ' of 100'));
    doneBody.appendChild(el('h2', null, claim.kind === 'host'
      ? 'Your block is on the map, ' + claim.name + '.'
      : 'You\'re in, ' + claim.name + '.'));
    doneBody.appendChild(el('p', null, claim.kind === 'host'
      ? W.label(claim.block) + ' · ' + W.hourLabel(claim.hour) + '. A captain will text you before Host Night — that\'s Saturday, March 6 at 4114 Judah, where you pick up your $200 and meet the other hosts on your avenue.'
      : 'A captain will connect you with whoever hosts ' + W.label(claim.block) + '. If nobody does by February, that person could be you.'));

    var near = nearest(claim);
    if (near) {
      var box = el('div', 'near');
      box.appendChild(el('p', null, near.host.name + ' is hosting ' +
        (near.d === 0 ? 'the same block' : near.d + (near.d === 1 ? ' block' : ' blocks') + ' away') +
        ' — ' + W.shortLabel(near.host.block) + ', ' + W.hourLabel(near.host.hour).toLowerCase() + '.'));
      var b = el('button', 'btn btn-ghost', 'Say hi to ' + near.host.name);
      b.type = 'button';
      b.addEventListener('click', function () { dlg.close(); openBlock(near.host.block); });
      box.appendChild(b);
      doneBody.appendChild(box);
    }

    var share = el('div', 'sharebox');
    share.appendChild(el('p', null, claim.kind === 'host'
      ? 'The one thing that helps most today: send this map to two neighbors on your block and ask them to take the block next to yours. ' + (100 - n) + ' to go.'
      : 'Know someone on ' + W.shortLabel(claim.block) + ' with a garage and a folding table? Send them this map.'));
    doneBody.appendChild(share);

    var act = el('div', 'actions');
    var again = el('button', 'btn btn-ghost', 'Add another block');
    again.type = 'button';
    again.addEventListener('click', function () {
      document.getElementById('f-name').value = claim.name;
      document.getElementById('f-contact').value = claim.contact;
      document.getElementById('f-note').value = '';
      openClaim('host', null);
    });
    var close = el('button', 'btn btn-coral', 'Back to the map');
    close.type = 'button';
    close.addEventListener('click', function () { dlg.close(); });
    act.appendChild(again);
    act.appendChild(close);
    doneBody.appendChild(act);
  }

  function nearest(claim) {
    var best = null;
    hosts().forEach(function (h) {
      if (h.id === claim.id) return;
      var d = W.blocksApart(claim.block, h.block);
      if (d === Infinity) return;
      if (!best || d < best.d) best = { host: h, d: d };
    });
    return best && best.d <= 6 ? best : null;
  }

  /* ---------- reset ---------- */
  document.getElementById('reset').addEventListener('click', function () {
    claims = [];
    save();
    refreshAll();
    document.querySelector('.muted').textContent = 'Map cleared — the next block to say yes is the first one.';
  });

  paintGrid();
  refreshAll();
})();