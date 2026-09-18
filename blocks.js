/* The grid of the avenues: 48th (ocean side) on the left, 19th on the right,
   Lincoln at the top, Sloat at the bottom. Sunset Blvd sits between 36th and 37th. */
(function () {
  const AVENUES = [];
  for (let n = 48; n >= 37; n--) AVENUES.push({ key: String(n), num: n });
  AVENUES.push({ key: 'SB', num: null, name: 'Sunset Blvd' });
  for (let n = 36; n >= 19; n--) AVENUES.push({ key: String(n), num: n });

  const CROSS = ['Lincoln', 'Irving', 'Judah', 'Kirkham', 'Lawton', 'Moraga',
    'Noriega', 'Ortega', 'Pacheco', 'Quintara', 'Rivera', 'Santiago',
    'Taraval', 'Ulloa', 'Vicente', 'Wawona', 'Sloat'];

  const ROWS = CROSS.slice(0, -1).map((north, i) => ({
    key: north + '-' + CROSS[i + 1],
    north,
    south: CROSS[i + 1],
    label: north + '–' + CROSS[i + 1]
  }));

  const RESERVOIR_AVES = ['24', '25', '26', '27', '28'];
  const RESERVOIR_ROWS = ['Ortega-Pacheco', 'Pacheco-Quintara'];

  function ordinal(n) {
    const t = n % 100, o = n % 10;
    if (t >= 11 && t <= 13) return n + 'th';
    return n + (o === 1 ? 'st' : o === 2 ? 'nd' : o === 3 ? 'rd' : 'th');
  }

  function aveName(aveKey) {
    if (aveKey === 'SB') return 'Sunset Blvd';
    return ordinal(Number(aveKey)) + ' Ave';
  }

  function groundKind(aveKey, rowKey) {
    if (aveKey === 'SB') return 'boulevard';
    if (RESERVOIR_AVES.indexOf(aveKey) > -1 && RESERVOIR_ROWS.indexOf(rowKey) > -1) return 'reservoir';
    return null;
  }

  function id(aveKey, rowKey) { return aveKey + '|' + rowKey; }

  function label(blockId) {
    const parts = String(blockId).split('|');
    const row = ROWS.find(r => r.key === parts[1]);
    if (!row) return aveName(parts[0]);
    return aveName(parts[0]) + ' between ' + row.north + ' & ' + row.south;
  }

  function shortLabel(blockId) {
    const parts = String(blockId).split('|');
    const row = ROWS.find(r => r.key === parts[1]);
    return (parts[0] === 'SB' ? 'Sunset Blvd' : ordinal(Number(parts[0]))) +
      ' · ' + (row ? row.label : '');
  }

  function coords(blockId) {
    const parts = String(blockId).split('|');
    return {
      x: AVENUES.findIndex(a => a.key === parts[0]),
      y: ROWS.findIndex(r => r.key === parts[1])
    };
  }

  function blocksApart(a, b) {
    const p = coords(a), q = coords(b);
    if (p.x < 0 || q.x < 0) return Infinity;
    return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
  }

  const HOURS = [
    { key: 'morning', label: 'Morning — around 10am' },
    { key: 'midday', label: 'Midday — the equinox lands at 1:24pm' },
    { key: 'afternoon', label: 'Afternoon — around 3pm' },
    { key: 'late', label: 'Late afternoon — around 5pm' },
    { key: 'evening', label: 'Evening — after dinner' },
    { key: 'unsure', label: 'Not sure yet' }
  ];

  window.WAVE = {
    AVENUES, CROSS, ROWS, HOURS, GOAL: 100,
    ordinal, aveName, groundKind, id, label, shortLabel, coords, blocksApart,
    hourLabel: k => (HOURS.find(h => h.key === k) || { label: 'Time to be decided' }).label
  };
})();