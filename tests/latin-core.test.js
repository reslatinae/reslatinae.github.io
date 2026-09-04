// Run with: npm test   (or: node --test tests/)
// No dependencies: Node's built-in test runner.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../src/latin-core.js');

const DE = { other: 'Sonstiges', prep: 'Präpositionale Bestimmung' };
const words = (toks) => toks.map(t => t.w);

// --- tokenize -----------------------------------------------------------------
test('tokenize splits words and punctuation, keeping order and the final full stop', () => {
    assert.deepEqual(L.tokenize('Veni, vidi, vici.'), ['Veni', ',', 'vidi', ',', 'vici', '.']);
});
test('tokenize keeps macrons, precomposed or decomposed', () => {
    assert.deepEqual(L.tokenize('ā Clodiā'), ['ā', 'Clodiā']);
    assert.deepEqual(L.tokenize('ā Clodiā'), ['ā', 'Clodiā']);
});
test('tokenize returns [] for blank input', () => { assert.deepEqual(L.tokenize('   '), []); });
test('tokenize keeps a hyphenated enclitic as its own token', () => {
    assert.deepEqual(L.tokenize('virum -que cano'), ['virum', '-que', 'cano']);
});

// --- sanitizeText / countWords -------------------------------------------------
test('sanitizeText rejoins words hyphenated across line breaks and replaces double quotes', () => {
    assert.equal(L.sanitizeText('Aurum sump-\ntum "a" Clodia.'), "Aurum sumptum 'a' Clodia.");
});
test('countWords counts whitespace-separated words, 0 for blank', () => {
    assert.equal(L.countWords('  Gallia est omnis   divisa '), 4);
    assert.equal(L.countWords(''), 0);
});

// --- processTokens (manual creation) --------------------------------------------
test('processTokens labels punctuation as Punct and words as the default label', () => {
    const toks = L.processTokens(['Gallia', '.'], DE.other, DE.prep);
    assert.deepEqual(toks.map(t => t.f), ['Sonstiges', 'Punct']);
});
test('a hyphenated enclitic (-que) is glued onto the previous word', () => {
    assert.deepEqual(words(L.processTokens(['arma', 'virum', '-que', 'cano'], DE.other, DE.prep)), ['arma', 'virumque', 'cano']);
});
test('a bare "ne" is a word of its own (the old rule glued it: "Timeone")', () => {
    assert.deepEqual(words(L.processTokens(['Timeo', 'ne', 'veniat', '.'], DE.other, DE.prep)), ['Timeo', 'ne', 'veniat', '.']);
});
test('processTokens welds prepositions', () => {
    assert.deepEqual(words(L.processTokens(['Marcus', 'in', 'foro', 'ambulat', '.'], DE.other, DE.prep)), ['Marcus', 'in foro', 'ambulat', '.']);
});

// --- weldPrepositions -------------------------------------------------------------
test('a single-word preposition welds onto the following word with the prepositional label and an index map', () => {
    const { welded, map } = L.weldPrepositions([{ w: 'in', f: 'Sonstiges' }, { w: 'urbe', f: 'Sonstiges' }], DE.prep);
    assert.equal(welded.length, 1);
    assert.equal(welded[0].w, 'in urbe');
    assert.equal(welded[0].f, DE.prep);
    assert.deepEqual(map, { 0: 0, 1: 0 });
});
test('no welding across punctuation', () => {
    const { welded } = L.weldPrepositions([{ w: 'a', f: 'Sonstiges' }, { w: ',', f: 'Punct' }], DE.prep);
    assert.deepEqual(words(welded), ['a', ',']);
});
test('a token that is already a phrase ("a Clodia") is never welded again', () => {
    const { welded } = L.weldPrepositions([{ w: 'a Clodia', f: DE.prep }, { w: 'venenum', f: 'Subjekt' }], DE.prep);
    assert.deepEqual(words(welded), ['a Clodia', 'venenum']);
    assert.equal(welded[1].f, 'Subjekt');
});
test('preposition matching ignores macrons ("ā Clodiā")', () => {
    const { welded } = L.weldPrepositions([{ w: 'ā', f: 'Sonstiges' }, { w: 'Clodiā', f: 'Sonstiges' }], DE.prep);
    assert.deepEqual(words(welded), ['ā Clodiā']);
});
test('a genitive flag on the welded noun is kept on the phrase', () => {
    const { welded } = L.weldPrepositions([{ w: 'in', f: 'X' }, { w: 'urbe', f: 'X', u: true }], DE.prep);
    assert.equal(welded[0].u, true);
});
test('documented current behaviour: "cum" welds even as a subjunction (grammar decision pending, see docs)', () => {
    const { welded } = L.weldPrepositions([{ w: 'Cum', f: 'Subjunktion' }, { w: 'Caesar', f: 'Subjekt' }], DE.prep);
    assert.deepEqual(words(welded), ['Cum Caesar']);
});

// --- splitTokenParts ----------------------------------------------------------------
test('splitTokenParts breaks a welded token into parts and distributes flags', () => {
    const parts = L.splitTokenParts({ w: 'a Clodia', f: 'P', h: 'hint', b: 1, isSplit: true, u: false });
    assert.deepEqual(parts.map(p => p.w), ['a', 'Clodia']);
    assert.deepEqual(parts.map(p => p.f), ['P', 'P']);
    assert.equal(parts[0].h, 'hint'); assert.equal(parts[1].h, '');
    assert.equal(parts[0].b, 0); assert.equal(parts[1].b, 1);
    assert.equal(parts[0].isSplit, false); assert.equal(parts[1].isSplit, true);
});
test('splitTokenParts returns null for a single word', () => { assert.equal(L.splitTokenParts({ w: 'Gallia' }), null); });
test('splitTokenParts labels a punctuation part as Punct', () => {
    assert.deepEqual(L.splitTokenParts({ w: 'ut ,', f: 'X' }).map(p => p.f), ['X', 'Punct']);
});

// --- compareCoverage (does the AI answer contain every word?) -------------------------
const TEXT = 'Aurum sumptum a Clodia, venenum quaesitum quod Clodiae daretur.';
const full = [{ w: 'Aurum' }, { w: 'sumptum' }, { w: 'a Clodia' }, { w: ',' }, { w: 'venenum' }, { w: 'quaesitum' }, { w: 'quod' }, { w: 'Clodiae' }, { w: 'daretur' }, { w: '.' }];
test('complete answer passes', () => { assert.deepEqual(L.compareCoverage(TEXT, full), { ok: true, missing: [], extra: [] }); });
test('a dropped word is reported in its original spelling', () => {
    const r = L.compareCoverage(TEXT, full.filter(w => w.w !== 'venenum'));
    assert.equal(r.ok, false); assert.deepEqual(r.missing, ['venenum']); assert.deepEqual(r.extra, []);
});
test('an altered word shows up as missing + extra', () => {
    const r = L.compareCoverage(TEXT, full.map(w => w.w === 'quaesitum' ? { w: 'quaesitam' } : w));
    assert.deepEqual(r.missing, ['quaesitum']); assert.deepEqual(r.extra, ['quaesitam']);
});
test('an invented word is reported as extra', () => {
    const r = L.compareCoverage(TEXT, full.concat([{ w: 'est' }]));
    assert.deepEqual(r.missing, []); assert.deepEqual(r.extra, ['est']);
});
test('different splitting, macrons, case and v/u spelling are tolerated', () => {
    assert.equal(L.compareCoverage('Arma virumque canō.', [{ w: 'arma' }, { w: 'virum' }, { w: 'que' }, { w: 'cano' }, { w: '.' }]).ok, true);
    assert.equal(L.compareCoverage('vicit', [{ w: 'uicit' }]).ok, true);
});
test('punctuation differences never count', () => {
    assert.equal(L.compareCoverage('Veni, vidi, vici.', [{ w: 'Veni' }, { w: 'vidi' }, { w: 'vici' }]).ok, true);
});

// --- the page loads this module ----------------------------------------------------------
test('index.html loads src/latin-core.js before its own script', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const tagPos = html.indexOf('<script src="src/latin-core.js"></script>');
    assert.ok(tagPos > 0, 'script tag present');
    assert.ok(tagPos < html.indexOf('const CONFIG = {'), 'loaded before the app code');
    assert.ok(!/PREPOSITIONS: \[/.test(html), 'the preposition list lives only in src/latin-core.js');
});
