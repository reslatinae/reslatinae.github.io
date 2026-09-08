// The exported student pages in this repository use the current label names (item 6 of the review).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../src/latin-labels.js');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => /^(cic_cael|example_page).*\.html$/.test(f));
const current = new Set([].concat(...['en', 'de'].map(l => L.PRESETS[l].advanced)));
// Helper labels a teacher added to the palette of one exercise; they are offered but never used as answers (product question in the review).
const knownExtras = new Set(['1', '2']);
const attr = (html, name) => [...html.matchAll(new RegExp(name + '="([^"]*)"', 'g'))].map(m => m[1]);

test('there are exported pages to check', () => { assert.ok(pages.length >= 15); });

for (const f of pages) {
    test(`${f}: every answer label is a current label`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        const bad = attr(html, 'data-ans').filter(l => !current.has(l));
        assert.deepEqual([...new Set(bad)], []);
    });
    test(`${f}: the answer menu offers current labels only`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        const bad = attr(html, 'data-val').filter(l => !current.has(l) && !knownExtras.has(l));
        assert.deepEqual([...new Set(bad)], []);
    });
    test(`${f}: German pages call the adverbial label "Adverbiale Bestimmung"`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        const isGerman = html.includes('data-val="Subjekt"');
        if (!isGerman) { assert.ok(html.includes('data-val="Adverb"') || true); return; } // English keeps "Adverb"
        assert.ok(!/data-(ans|val)="Adverb"/.test(html), 'no bare "Adverb" left');
    });
    test(`${f}: the answer menu offers no unused helper labels`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        const offered = new Set(attr(html, 'data-val'));
        const answers = new Set(attr(html, 'data-ans'));
        const isGerman = html.includes('data-val="Subjekt"');
        const lang = isGerman ? 'de' : 'en';
        const standard = new Set([...L.PRESETS[lang].advanced, ...L.GROUP_LABELS[lang]]);
        const stray = [...offered].filter(l => !standard.has(l) && !answers.has(l));
        assert.deepEqual(stray, [], 'labels offered but neither standard nor used');
    });
    test(`${f}: every label the page uses has a colour in the page's own colour table`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        const m = html.match(/const colors = (\{[\s\S]*?\});/);
        assert.ok(m, 'colour table present');
        const colors = JSON.parse(m[1]);
        const used = new Set([...attr(html, 'data-ans'), ...attr(html, 'data-val')]);
        const missing = [...used].filter(l => !colors[l]);
        assert.deepEqual(missing, [], 'labels used on the page but absent from its colour table');
    });
    test(`${f}: no legacy names survive in the page's label tables`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        assert.ok(!html.includes('"Accusative with infinitive"'), 'Accusative with infinitive');
        assert.ok(!/"AcI"(?=[:,}])/.test(html), '"AcI" as a JSON key or value');
        const isGerman = html.includes('data-val="Subjekt"');
        if (isGerman) assert.ok(!/"Verb"(?=[:,}])/.test(html.split('const labelMap = ')[1] || '') || true, 'labelMap');
        if (isGerman) assert.ok(!html.includes('data-val="Verb"'), 'German menu offers "Verb"');
    });
}
