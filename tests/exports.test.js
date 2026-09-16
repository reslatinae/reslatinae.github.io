// The student pages in this repository use current label names, offer sensible answer menus and can colour
// every answer. Two kinds of page exist: exported pages (labels sit in data-ans / data-val attributes) and the
// example pages, which build the exercise in the browser from an `exerciseData` object. Both are read into the
// same shape, so the checks below apply to both.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../src/latin-labels.js');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => /^(cic_cael|example_page).*\.html$/.test(f));
const attr = (html, name) => [...html.matchAll(new RegExp(name + '="([^"]*)"', 'g'))].map(m => m[1]);

// -> { kind, lang, answers[], offered[], colors{} }
function pageData(html) {
    if (/const exerciseData = \{/.test(html)) {
        const field = (name) => {
            const m = html.match(new RegExp('^\\s*' + name + ': (.*?),?\\s*$', 'm'));
            assert.ok(m, `exerciseData.${name} present`);
            return JSON.parse(m[1]);
        };
        const words = field('words'), groups = field('groups');
        return {
            kind: 'runtime', lang: field('lang'),
            answers: [...words.filter(w => w.f !== L.PUNCT).map(w => w.f), ...groups.map(g => g.label)],
            offered: field('customFunctions'), colors: field('customColors')
        };
    }
    const m = html.match(/const colors = (\{[\s\S]*?\});/);
    assert.ok(m, 'colour table present');
    return {
        kind: 'static', lang: html.includes('data-val="Subjekt"') ? 'de' : 'en',
        answers: attr(html, 'data-ans'), offered: attr(html, 'data-val'), colors: JSON.parse(m[1])
    };
}
const read = (f) => pageData(fs.readFileSync(path.join(root, f), 'utf8'));
const standardFor = (lang) => new Set([...L.PRESETS[lang].advanced, ...L.GROUP_LABELS[lang]]);
const uniq = (a) => [...new Set(a)];

test('there are pages to check, including the two example pages', () => {
    assert.ok(pages.length >= 15);
    assert.ok(pages.includes('example_page.html') && pages.includes('example_page_de.html'));
});

for (const f of pages) {
    test(`${f}: every answer label is a current label of the page's language`, () => {
        const d = read(f);
        assert.deepEqual(uniq(d.answers.filter(l => !standardFor(d.lang).has(l))), []);
    });
    test(`${f}: the answer menu offers current labels only`, () => {
        const d = read(f);
        assert.deepEqual(uniq(d.offered.filter(l => !standardFor(d.lang).has(l))), []);
    });
    test(`${f}: every label the page uses is offered in its answer menu`, () => {
        const d = read(f);
        assert.deepEqual(uniq(d.answers.filter(l => !d.offered.includes(l))), []);
    });
    test(`${f}: the answer menu offers no unused helper labels`, () => {
        const d = read(f);
        assert.deepEqual(uniq(d.offered.filter(l => !standardFor(d.lang).has(l) && !d.answers.includes(l))), []);
    });
    test(`${f}: every label the page uses has a colour in the page's own colour table`, () => {
        const d = read(f);
        assert.deepEqual(uniq([...d.answers, ...d.offered].filter(l => !d.colors[l])), []);
    });
    test(`${f}: no legacy label names (German: Verb, Adverb, AcI; both: Accusative with infinitive)`, () => {
        const d = read(f);
        const legacy = d.lang === 'de' ? ['Verb', 'Adverb', 'AcI', 'Accusative with infinitive'] : ['AcI', 'Accusative with infinitive'];
        assert.deepEqual(uniq([...d.answers, ...d.offered].filter(l => legacy.includes(l))), []);
    });
}
