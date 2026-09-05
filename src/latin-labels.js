// Latin Syntax Studio – the label system: which labels exist per level, their colours and abbreviations,
// how a label from the AI (or an older exercise) is mapped onto a current one, and how labels translate
// between German and English. Pure data and pure functions, shared by index.html and the tests.
//
// Genitive attributes deliberately have NO label of their own: they carry the label of the word they belong
// to plus the marker "u": true, which the student page turns into the underline exercise.
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.LatinLabels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const PUNCT = 'Punct';
    const OTHER = { en: 'Other', de: 'Sonstiges' };
    const MAIN_CLAUSE = { en: 'Main clause', de: 'Hauptsatz' };

    // The lists per language are parallel: index i in "en" is the same label as index i in "de".
    // Translation between the languages relies on that, so keep the order in step.
    const PRESETS = {
        en: {
            beginner: ['Subject', 'Verb', 'Accusative object', 'Dative object', 'Genitive object', 'Ablative', 'Prepositional phrase', 'Vocative', 'Other'],
            intermediate: ['Subject', 'Verb', 'Accusative object', 'Dative object', 'Genitive object', 'Ablative', 'Predicative', 'Prepositional phrase', 'Adverb', 'Infinitive', 'Relative clause', 'Subordinate clause', 'Conjunction', 'Subjunction', 'Vocative', 'Other'],
            advanced: ['Subject', 'Verb', 'Accusative object', 'Dative object', 'Genitive object', 'Ablative', 'Ablative absolute', 'Predicative', 'Prepositional phrase', 'Adverb', 'Infinitive', 'Accusative/Nominative with infinitive', 'Participial phrase', 'Relative clause', 'Subordinate clause', 'Conjunction', 'Subjunction', 'Vocative', 'Other']
        },
        de: {
            beginner: ['Subjekt', 'Prädikat', 'Akkusativobjekt', 'Dativobjekt', 'Genitivobjekt', 'Ablativ', 'Präpositionale Bestimmung', 'Vokativ', 'Sonstiges'],
            intermediate: ['Subjekt', 'Prädikat', 'Akkusativobjekt', 'Dativobjekt', 'Genitivobjekt', 'Ablativ', 'Prädikativum', 'Präpositionale Bestimmung', 'Adverb', 'Infinitiv', 'Relativsatz', 'Nebensatz', 'Konjunktion', 'Subjunktion', 'Vokativ', 'Sonstiges'],
            advanced: ['Subjekt', 'Prädikat', 'Akkusativobjekt', 'Dativobjekt', 'Genitivobjekt', 'Ablativ', 'Ablativus absolutus', 'Prädikativum', 'Präpositionale Bestimmung', 'Adverb', 'Infinitiv', 'AcI/NcI', 'Partizipialkonstruktion', 'Relativsatz', 'Nebensatz', 'Konjunktion', 'Subjunktion', 'Vokativ', 'Sonstiges']
        }
    };

    const SEMANTIC_COLORS = {
        // --- Core sentence components ---
        'Subject': '#4ade80', 'Subjekt': '#4ade80',                                   // Bright Green
        'Verb': '#C76D72', 'Prädikat': '#C76D72',                                     // Dark Rose
        'Accusative object': '#fde047', 'Akkusativobjekt': '#fde047',                 // Bright Yellow
        'Dative object': '#fdba74', 'Dativobjekt': '#fdba74',                         // Soft Orange
        'Prepositional phrase': '#c4b5fd', 'Präpositionale Bestimmung': '#c4b5fd',    // Light Violet
        // --- Secondary elements and clauses ---
        'Genitive object': '#fbcfe8', 'Genitivobjekt': '#fbcfe8',                     // Light Pink
        'Ablative': '#93c5fd', 'Ablativ': '#93c5fd',                                  // Soft Blue
        'Ablative absolute': '#60a5fa', 'Ablativus absolutus': '#60a5fa',             // Brighter Blue
        'Adverb': '#ffedd5',                                                          // Pale Peach
        'Infinitive': '#e9d5ff', 'Infinitiv': '#e9d5ff',                              // Pale Lilac
        'Predicative': '#fca5a5', 'Prädikativum': '#fca5a5',                          // Rose
        'Conjunction': '#d6d3d1', 'Konjunktion': '#d6d3d1',                           // Warm Grey
        'Subjunction': '#f3f4f6', 'Subjunktion': '#f3f4f6',                           // Light Grey
        'Participial phrase': '#5eead4', 'Partizipialkonstruktion': '#5eead4',        // Teal
        'Subordinate clause': '#818cf8', 'Nebensatz': '#818cf8',                      // Indigo
        'Relative clause': '#a7f3d0', 'Relativsatz': '#a7f3d0',                       // Pale Mint
        'Accusative/Nominative with infinitive': '#c084fc', 'AcI/NcI': '#c084fc',     // Bright Purple
        'Vocative': '#a5f3fc', 'Vokativ': '#a5f3fc',                                  // Pale Cyan
        'Other': '#e5e7eb', 'Sonstiges': '#e5e7eb'                                    // Neutral Grey
    };

    // Free colours for labels a teacher adds.
    const SAFE_COLORS = ['#4ade80', '#C76D72', '#fde047', '#fdba74', '#c4b5fd', '#fbcfe8', '#f472b6', '#93c5fd', '#60a5fa', '#ffedd5', '#e9d5ff', '#fca5a5', '#d6d3d1', '#f3f4f6', '#5eead4', '#818cf8', '#a7f3d0', '#a5f3fc', '#e5e7eb', '#e9c46a', '#a3b18a', '#b5838d'];

    const ABBREVIATIONS = {
        en: { 'Subject': 'Subj', 'Accusative object': 'Acc. Obj', 'Dative object': 'Dat. Obj', 'Genitive object': 'Gen. Obj', 'Ablative': 'Abl', 'Ablative absolute': 'Abl. Abs.', 'Predicative': 'Pred', 'Prepositional phrase': 'Prep. Phr', 'Adverb': 'Adv', 'Verb': 'Verb', 'Infinitive': 'Inf', 'Participial phrase': 'Part. Phr', 'Relative clause': 'Rel. Cl', 'Subordinate clause': 'Sub. Cl', 'Conjunction': 'Conj', 'Subjunction': 'Subjunc', 'Accusative/Nominative with infinitive': 'Acc/Nom+Inf', 'Vocative': 'Voc', 'Other': 'Other' },
        de: { 'Subjekt': 'Subj', 'Akkusativobjekt': 'Akk. Obj', 'Dativobjekt': 'Dat. Obj', 'Genitivobjekt': 'Gen. Obj', 'Ablativ': 'Abl', 'Ablativus absolutus': 'Abl. Abs.', 'Prädikativum': 'Präd', 'Präpositionale Bestimmung': 'Präp. Best.', 'Adverb': 'Adv', 'Prädikat': 'Prädikat', 'Infinitiv': 'Inf', 'Partizipialkonstruktion': 'Part. Konstr', 'Relativsatz': 'Rel. Satz', 'Nebensatz': 'Nebensatz', 'Konjunktion': 'Konj', 'Subjunktion': 'Subjunk', 'AcI/NcI': 'AcI/NcI', 'Vokativ': 'Vok', 'Sonstiges': 'Sonst.' }
    };

    // Keyboard shortcuts in the editor and on the student page. Keys x, m, w, g are reserved for the tools.
    const SHORTCUTS = {
        'Subject': 's', 'Subjekt': 's',
        'Verb': 'p', 'Prädikat': 'p',
        'Accusative object': 'a', 'Akkusativobjekt': 'a',
        'Dative object': 'd', 'Dativobjekt': 'd',
        'Genitive object': 'v', 'Genitivobjekt': 'v',
        'Ablative': 'l', 'Ablativ': 'l',
        'Ablative absolute': 'b', 'Ablativus absolutus': 'b',
        'Prepositional phrase': 'o', 'Präpositionale Bestimmung': 'o',
        'Predicative': 'r', 'Prädikativum': 'r',
        'Adverb': 'e',
        'Infinitive': 'i', 'Infinitiv': 'i',
        'Accusative/Nominative with infinitive': 'c', 'AcI/NcI': 'c',
        'Participial phrase': 'z', 'Partizipialkonstruktion': 'z',
        'Relative clause': 't', 'Relativsatz': 't',
        'Subordinate clause': 'n', 'Nebensatz': 'n',
        'Conjunction': 'k', 'Konjunktion': 'k',
        'Subjunction': 'u', 'Subjunktion': 'u',
        'Vocative': 'f', 'Vokativ': 'f',
        'Other': 'y', 'Sonstiges': 'y'
    };

    // Names used in exercises exported by earlier versions of the tool, mapped onto today's labels.
    const LEGACY = {
        en: { 'Accusative with infinitive': 'Accusative/Nominative with infinitive', 'AcI': 'Accusative/Nominative with infinitive' },
        de: { 'Verb': 'Prädikat', 'AcI': 'AcI/NcI', 'Accusative with infinitive': 'AcI/NcI' }
    };

    const lower = (s) => String(s == null ? '' : s).trim().toLowerCase();

    // Translate a label into `lang`. Preset labels are translated by position, everything else is left as it is.
    function translateLabel(label, lang) {
        const other = lang === 'en' ? 'de' : 'en';
        const idx = PRESETS[other].advanced.indexOf(label);
        if (idx !== -1) return PRESETS[lang].advanced[idx];
        return label;
    }

    // Map any label the AI or an old exercise produced onto a label of `lang`.
    // Unknown labels are returned capitalised, so a teacher's own category survives.
    function normalizeLabel(label, lang) {
        const l = lower(label);
        if (!l) return OTHER[lang];

        const exact = PRESETS[lang].advanced.find(f => f.toLowerCase() === l);
        if (exact) return exact;

        const other = lang === 'en' ? 'de' : 'en';
        const crossIdx = PRESETS[other].advanced.findIndex(f => f.toLowerCase() === l);
        if (crossIdx !== -1) return PRESETS[lang].advanced[crossIdx];

        for (const from of Object.keys(LEGACY[lang])) if (from.toLowerCase() === l) return LEGACY[lang][from];
        for (const from of Object.keys(LEGACY[other])) if (from.toLowerCase() === l) return translateLabel(LEGACY[other][from], lang);

        if (l === lower(MAIN_CLAUSE.en) || l === lower(MAIN_CLAUSE.de)) return OTHER[lang];
        // A genitive attribute is not a label of its own: it is marked with u:true on the word.
        if (l.includes('genitivattribut') || l.includes('genitive attr')) return OTHER[lang];

        if (lang === 'de') {
            if (l.includes('dative') || l === 'dativ') return 'Dativobjekt';
            if (l.includes('accusative') && l.includes('infinitive')) return 'AcI/NcI';
            if (l.includes('accusative') || l === 'akkusativ') return 'Akkusativobjekt';
            if (l.includes('genitive') || l === 'genitiv') return 'Genitivobjekt';
            if (l.includes('prepositional')) return 'Präpositionale Bestimmung';
            if (l.includes('ablative abs')) return 'Ablativus absolutus';
            if (l.includes('relative')) return 'Relativsatz';
            if (l.includes('subordinate')) return 'Nebensatz';
            if (l.includes('conjunction') || l.includes('konjunktion')) return 'Konjunktion';
            if (l.includes('subjunction')) return 'Subjunktion';
            if (l.includes('participial')) return 'Partizipialkonstruktion';
            if (l.includes('subject')) return 'Subjekt';
            if (l.includes('infinitive') && !l.includes('with')) return 'Infinitiv';
            if (l === 'verb') return 'Prädikat';
            if (l.includes('vocative') || l.includes('vokativ')) return 'Vokativ';
        } else {
            if (l.includes('dativ')) return 'Dative object';
            if (l.includes('akkusativ')) return 'Accusative object';
            if (l.includes('genitiv')) return 'Genitive object';
            if (l.includes('präpositional')) return 'Prepositional phrase';
            if (l.includes('ablativus abs')) return 'Ablative absolute';
            if (l.includes('relativ')) return 'Relative clause';
            if (l.includes('neben')) return 'Subordinate clause';
            if (l.includes('konjunktion') || l.includes('conjunction')) return 'Conjunction';
            if (l.includes('subjunktion')) return 'Subjunction';
            if (l.includes('partizipial')) return 'Participial phrase';
            if (l.includes('subjekt')) return 'Subject';
            if (l.includes('infinitiv') && !l.includes('aci')) return 'Infinitive';
            if (l.includes('vocative') || l.includes('vokativ')) return 'Vocative';
        }
        const s = String(label).trim();
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // Map for the exported student page: labelMap[lang][anyLabel] = label in that language.
    function buildLabelMap() {
        const map = { en: {}, de: {} };
        PRESETS.en.advanced.forEach((en, i) => {
            const de = PRESETS.de.advanced[i];
            map.en[en] = en; map.en[de] = en;
            map.de[en] = de; map.de[de] = de;
        });
        ['en', 'de'].forEach(lang => Object.keys(LEGACY[lang]).forEach(from => {
            const to = LEGACY[lang][from];
            map[lang][from] = to;
            map[lang === 'en' ? 'de' : 'en'][from] = translateLabel(to, lang === 'en' ? 'de' : 'en');
        }));
        return map;
    }

    return { PUNCT, OTHER, MAIN_CLAUSE, PRESETS, SEMANTIC_COLORS, SAFE_COLORS, ABBREVIATIONS, SHORTCUTS, LEGACY, translateLabel, normalizeLabel, buildLabelMap };
});
