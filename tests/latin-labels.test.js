// Label sets, colours, abbreviations, synonym mapping and legacy names (src/latin-labels.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/latin-labels.js');

const union = () => new Set([].concat(...['en', 'de'].map(l => [].concat(...Object.values(L.PRESETS[l])))));

test('presets exist for both languages and three levels, with matching lengths (index-based translation)', () => {
    for (const level of ['beginner', 'intermediate', 'advanced']) {
        assert.ok(Array.isArray(L.PRESETS.en[level]) && Array.isArray(L.PRESETS.de[level]), level);
        assert.equal(L.PRESETS.en[level].length, L.PRESETS.de[level].length, level);
    }
});

test('every preset label has a colour and an abbreviation in its language', () => {
    for (const lang of ['en', 'de']) for (const label of L.PRESETS[lang].advanced) {
        assert.ok(L.SEMANTIC_COLORS[label], `colour for ${label}`);
        assert.ok(L.ABBREVIATIONS[lang][label], `abbreviation for ${label}`);
    }
});

// --- item 3: "Genitivattribut" must not half-exist -------------------------------------------
test('"Genitivattribut" / "Genitive attribute" is not a label anywhere (genitive attributes are marked with u:true)', () => {
    assert.ok(!union().has('Genitivattribut') && !union().has('Genitive attribute'));
    assert.equal(L.SEMANTIC_COLORS['Genitivattribut'], undefined);
    assert.equal(L.SEMANTIC_COLORS['Genitive attribute'], undefined);
    assert.equal(L.ABBREVIATIONS.de['Genitivattribut'], undefined);
    assert.equal(L.ABBREVIATIONS.en['Genitive attribute'], undefined);
});
test('a model answer "Genitivattribut" / "Genitive attribute" is mapped to the Other label explicitly', () => {
    assert.equal(L.normalizeLabel('Genitivattribut', 'de'), 'Sonstiges');
    assert.equal(L.normalizeLabel('genitive attribute', 'de'), 'Sonstiges');
    assert.equal(L.normalizeLabel('Genitive attribute', 'en'), 'Other');
    assert.equal(L.normalizeLabel('Genitivattribut', 'en'), 'Other');
});

// --- normalizeLabel: exact, cross-language, fuzzy, unknown ----------------------------------------
test('normalizeLabel: exact match is case-insensitive and returns the canonical spelling', () => {
    assert.equal(L.normalizeLabel('subjekt', 'de'), 'Subjekt');
    assert.equal(L.normalizeLabel('PREDICATIVE', 'en'), 'Predicative');
});
test('normalizeLabel: a label from the other language is translated by position', () => {
    assert.equal(L.normalizeLabel('Subject', 'de'), 'Subjekt');
    assert.equal(L.normalizeLabel('Prädikat', 'en'), 'Verb');
    assert.equal(L.normalizeLabel('Relativsatz', 'en'), 'Relative clause');
});
test('normalizeLabel: fuzzy synonyms still work', () => {
    assert.equal(L.normalizeLabel('dative', 'de'), 'Dativobjekt');
    assert.equal(L.normalizeLabel('Akkusativ', 'en'), 'Accusative object');
    assert.equal(L.normalizeLabel('verb', 'de'), 'Prädikat');
});
test('normalizeLabel: empty -> Other, unknown -> capitalised as given', () => {
    assert.equal(L.normalizeLabel('', 'de'), 'Sonstiges');
    assert.equal(L.normalizeLabel(null, 'en'), 'Other');
    assert.equal(L.normalizeLabel('apposition', 'de'), 'Apposition');
});

// --- item 6: legacy names from older exports -----------------------------------------------------
test('legacy names map to the current labels', () => {
    assert.equal(L.normalizeLabel('AcI', 'de'), 'AcI/NcI');
    assert.equal(L.normalizeLabel('aci', 'de'), 'AcI/NcI');
    assert.equal(L.normalizeLabel('AcI', 'en'), 'Accusative/Nominative with infinitive');
    assert.equal(L.normalizeLabel('Accusative with infinitive', 'en'), 'Accusative/Nominative with infinitive');
    assert.equal(L.normalizeLabel('Accusative with infinitive', 'de'), 'AcI/NcI');
    assert.equal(L.LEGACY.de.Verb, 'Prädikat');
});

// --- translateLabel ---------------------------------------------------------------------------------
test('translateLabel maps preset labels between languages and leaves custom labels alone', () => {
    assert.equal(L.translateLabel('Subjekt', 'en'), 'Subject');
    assert.equal(L.translateLabel('Subject', 'de'), 'Subjekt');
    assert.equal(L.translateLabel('AcI/NcI', 'en'), 'Accusative/Nominative with infinitive');
    assert.equal(L.translateLabel('Meine Kategorie', 'en'), 'Meine Kategorie');
});

// --- shortcut table names only current labels ----------------------------------------------------------
test('every hard-coded shortcut key is a current preset label (no stale names)', () => {
    const all = union();
    for (const key of Object.keys(L.SHORTCUTS)) assert.ok(all.has(key), `stale shortcut key: ${key}`);
    assert.equal(L.SHORTCUTS['AcI/NcI'], 'c');
    assert.equal(L.SHORTCUTS['Accusative/Nominative with infinitive'], 'c');
});
