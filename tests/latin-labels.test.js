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

// --- Anke's label decisions (2026-09-06) ---------------------------------------------------
test('German calls the adverbial label "Adverbiale Bestimmung"; English stays "Adverb"', () => {
    for (const level of ['intermediate', 'advanced']) {
        assert.ok(L.PRESETS.de[level].includes('Adverbiale Bestimmung'), level);
        assert.ok(!L.PRESETS.de[level].includes('Adverb'), level);
        assert.ok(L.PRESETS.en[level].includes('Adverb'), level);
    }
    assert.equal(L.translateLabel('Adverbiale Bestimmung', 'en'), 'Adverb');
    assert.equal(L.translateLabel('Adverb', 'de'), 'Adverbiale Bestimmung');
    assert.equal(L.ABBREVIATIONS.de['Adverbiale Bestimmung'], 'Adv');
    assert.equal(L.ABBREVIATIONS.de['Nebensatz'], 'N.satz');
});

test('normalizeLabel knows "adverbiale" and "Prädikatsnomen"', () => {
    assert.equal(L.normalizeLabel('Adverbiale Bestimmung', 'de'), 'Adverbiale Bestimmung');
    assert.equal(L.normalizeLabel('adverbiale', 'en'), 'Adverb');
    assert.equal(L.normalizeLabel('Prädikatsnomen', 'de'), 'Prädikativum');
    assert.equal(L.normalizeLabel('predicate noun', 'en'), 'Predicative');
});

// --- clause labels are valid at every level (review item 2.1) --------------------------------
test('GROUP_LABELS exist in both languages, translate into each other, and are real advanced labels', () => {
    assert.equal(L.GROUP_LABELS.en.length, L.GROUP_LABELS.de.length);
    L.GROUP_LABELS.de.forEach((de, i) => {
        assert.ok(L.PRESETS.de.advanced.includes(de), `${de} is an advanced label`);
        assert.equal(L.translateLabel(de, 'en'), L.GROUP_LABELS.en[i], `${de} translates`);
    });
});

test('isGroupLabel accepts clause labels regardless of level, and rejects word labels', () => {
    assert.ok(L.isGroupLabel('Relativsatz', 'de'));
    assert.ok(L.isGroupLabel('Subordinate clause', 'en'));
    assert.ok(!L.isGroupLabel('Subjekt', 'de'));
});

test('a beginner exercise keeps a correctly labelled clause bracket', () => {
    // The beginner word list has no clause labels at all; the bracket must survive anyway.
    assert.ok(!L.PRESETS.de.beginner.includes('Relativsatz'));
    assert.ok(L.isGroupLabel(L.normalizeLabel('Relativsatz', 'de'), 'de'));
});

// --- item 3: "Genitivattribut" must not half-exist -------------------------------------------
test('"Genitivattribut" / "Genitive attribute" is not a label anywhere (genitive attributes are marked with u:true)', () => {
    assert.ok(!union().has('Genitivattribut') && !union().has('Genitive attribute'));
    assert.equal(L.SEMANTIC_COLORS['Genitivattribut'], undefined);
    assert.equal(L.SEMANTIC_COLORS['Genitive attribute'], undefined);
    assert.equal(L.ABBREVIATIONS.de['Genitivattribut'], undefined);
    assert.equal(L.ABBREVIATIONS.en['Genitive attribute'], undefined);
});
test('isGenitiveAttributeLabel spots the forbidden label in the raw answer, so the word can keep its real function', () => {
    for (const s of ['Genitivattribut', 'genitivattribut', 'Genitive attribute', 'genitive attr']) {
        assert.ok(L.isGenitiveAttributeLabel(s), s);
    }
    for (const s of ['Genitivobjekt', 'Genitive object', 'Subjekt', '', null]) {
        assert.ok(!L.isGenitiveAttributeLabel(s), String(s));
    }
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
