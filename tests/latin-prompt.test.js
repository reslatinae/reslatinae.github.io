// The AI prompt (src/latin-prompt.js): content checks and German/English parity.
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/latin-prompt.js');
const L = require('../src/latin-labels.js');

const TEXT = 'Aurum sumptum a Clodia, venenum quaesitum quod Clodiae daretur.';
const de = P.buildPrompt('de', TEXT, L.PRESETS.de.advanced);
const en = P.buildPrompt('en', TEXT, L.PRESETS.en.advanced);
// A rule runs from its number to the next numbered line, so it may span several lines.
const rules = (p) => p.split(/\n(?=\d+\. )/).filter(b => /^\d+\. /.test(b));
const rule = (p, n) => rules(p).find(b => b.startsWith(n + '. '));
const exampleJson = (p) => { const m = rule(p, 9).match(/\{"words":[\s\S]*\}\]\}/); assert.ok(m, 'example JSON found'); return JSON.parse(m[0]); };

test('the prompt carries the text, the punctuation label and the allowed labels', () => {
    for (const [p, lang] of [[de, 'de'], [en, 'en']]) {
        assert.ok(p.includes(TEXT));
        assert.ok(p.includes('"f": "Punct"'));
        assert.ok(p.includes(L.PRESETS[lang].advanced.join(', ')), `${lang}: word-label list present`);
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
test('rule 7 (clauses) demands a group for every subjunction and relative pronoun, in both languages', () => {
    assert.ok(/Subjunktion.*Relativpronomen/s.test(rule(de, 7)));
    assert.ok(/Subjunction.*relative pronoun/s.test(rule(en, 7)));
});
test('rule 8 (genitive attributes) explains the marker and forbids using the label as a word function, in both languages', () => {
    for (const p of [de, en]) assert.ok(rule(p, 8).includes('"u": true'));
    assert.ok(/NIEMALS das Label "Genitivattribut"/.test(rule(de, 8)));
    assert.ok(/NEVER use the label "Genitive attribute"/.test(rule(en, 8)));
});

// --- clause labels are offered at every level (Anke's GROUP_LABELS) ---------------------------
test('rules 7 and 10 list the fixed clause labels, in both languages', () => {
    for (const [p, lang] of [[de, 'de'], [en, 'en']]) {
        for (const n of [7, 10]) {
            for (const label of L.GROUP_LABELS[lang]) {
                assert.ok(rule(p, n).includes(label), `rule ${n} (${lang}) names ${label}`);
            }
        }
    }
});
test('rule 10 keeps word labels and clause labels apart', () => {
    assert.ok(/Wort-Labels/.test(rule(de, 10)) && /Klammern/.test(rule(de, 10)));
    assert.ok(/word labels/.test(rule(en, 10)) && /groups/.test(rule(en, 10)));
});

test('the worked example demonstrates a real genitive attribute with the marker', () => {
    for (const lang of ['de', 'en']) {
        const words = P.EXAMPLE[lang].words;
        const marked = words.filter(w => w.u);
        assert.equal(marked.length, 1, `${lang}: exactly one marked word`);
        assert.equal(marked[0].w, 'Metelli');
        // it carries the same label as the head noun it belongs to
        assert.equal(marked[0].f, words[0].f, `${lang}: same label as "Aurum"`);
    }
});
test('the example sentence and the example analysis contain the same words', () => {
    for (const lang of ['de', 'en']) {
        const inSentence = P.EXAMPLE_TEXT.match(/[\p{L}\p{M}]+/gu).map(w => w.toLowerCase());
        const inWords = P.EXAMPLE[lang].words.flatMap(w => (w.w.match(/[\p{L}\p{M}]+/gu) || [])).map(w => w.toLowerCase());
        assert.deepEqual(inWords, inSentence, `${lang}: example JSON matches the example sentence`);
    }
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
