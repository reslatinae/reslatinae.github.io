// The AI prompt (src/latin-prompt.js): content checks and German/English parity.
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/latin-prompt.js');
const L = require('../src/latin-labels.js');

const TEXT = 'Aurum sumptum a Clodia, venenum quaesitum quod Clodiae daretur.';
const de = P.buildPrompt('de', TEXT, L.PRESETS.de.advanced);
const en = P.buildPrompt('en', TEXT, L.PRESETS.en.advanced);
const rules = (p) => p.split('\n').filter(l => /^\d+\. /.test(l));
const rule = (p, n) => rules(p).find(l => l.startsWith(n + '. '));
const exampleJson = (p) => { const m = rule(p, 9).match(/\{"words":[\s\S]*\}\]\}/); assert.ok(m, 'example JSON found'); return JSON.parse(m[0]); };

test('the prompt carries the text, the punctuation label and the allowed labels', () => {
    for (const p of [de, en]) {
        assert.ok(p.includes(TEXT));
        assert.ok(p.includes('"f": "Punct"'));
        assert.ok(p.endsWith(L.PRESETS[p === de ? 'de' : 'en'].advanced.join(', ') + '.'));
    }
});

test('both languages have the same ten numbered rules', () => {
    assert.equal(rules(de).length, 10);
    assert.equal(rules(en).length, 10);
});

// --- item 4: parity of detail between German and English ---------------------------------------------
test('rule 4 (coordination) names the same example conjunctions in both languages', () => {
    for (const p of [de, en]) for (const c of ["'et'", "'aut'", "'-que'"]) assert.ok(rule(p, 4).includes(c), `${c} in rule 4`);
});
test('rule 7 (clauses) names the same construction examples in both languages', () => {
    assert.ok(rule(de, 7).includes('AcI/NcI') && rule(de, 7).includes('Partizipialkonstruktion') && rule(de, 7).includes('Nebensatz'));
    assert.ok(rule(en, 7).includes('AcI/NcI') && rule(en, 7).includes('Participial phrase') && rule(en, 7).includes('Subordinate clause'));
});
test('rule 8 (genitive attributes) explains the marker with an example and forbids a separate label, in both languages', () => {
    for (const p of [de, en]) {
        assert.ok(rule(p, 8).includes('"u": true'));
        assert.ok(rule(p, 8).includes('amor patriae'));
    }
    assert.ok(rule(de, 8).includes('kein eigenes Label'));
    assert.ok(rule(en, 8).includes('no separate label'));
});
test('the worked example is the same analysis in both languages, and the dative "Clodiae" carries no genitive marker', () => {
    const d = exampleJson(de), e = exampleJson(en);
    assert.equal(d.words.length, e.words.length);
    d.words.forEach((w, i) => {
        assert.equal(w.w, e.words[i].w);
        assert.equal(L.translateLabel(w.f, 'en'), e.words[i].f, `label of ${w.w}`);
        assert.equal(!!w.u, !!e.words[i].u, `marker of ${w.w}`);
    });
    assert.deepEqual(d.groups.map(g => [g.start, g.end]), e.groups.map(g => [g.start, g.end]));
    const clodiae = d.words.find(w => w.w === 'Clodiae');
    assert.equal(clodiae.f, 'Dativobjekt');
    assert.equal(clodiae.u, undefined);
});
