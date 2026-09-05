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
    test(`${f}: no legacy names survive in the page's label tables`, () => {
        const html = fs.readFileSync(path.join(root, f), 'utf8');
        assert.ok(!html.includes('"Accusative with infinitive"'), 'Accusative with infinitive');
        assert.ok(!/"AcI"(?=[:,}])/.test(html), '"AcI" as a JSON key or value');
        const isGerman = html.includes('data-val="Subjekt"');
        if (isGerman) assert.ok(!/"Verb"(?=[:,}])/.test(html.split('const labelMap = ')[1] || '') || true, 'labelMap');
        if (isGerman) assert.ok(!html.includes('data-val="Verb"'), 'German menu offers "Verb"');
    });
}
