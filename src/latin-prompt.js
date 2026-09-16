// Latin Syntax Studio – the instruction sent to the AI. German and English are kept deliberately parallel:
// same ten rules, same examples, same worked example. Changing one language means changing the other
// (tests/latin-prompt.test.js checks the parity).
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.LatinPrompt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const PUNCT = 'Punct';

    // The worked example of rule 9, in both languages. Two things it has to teach at once:
    // "Metelli" is a real genitive attribute, so it carries its head noun's label plus "u": true;
    // "Clodiae" is a dative object and therefore carries NO marker (Anke's example, 2026-09-06).
    const EXAMPLE_TEXT = 'Aurum Metelli sumitur a Clodia, venenum quaeritur quod Clodiae daretur.';
    const EXAMPLE = {
        de: { words: [{ w: 'Aurum', f: 'Subjekt' }, { w: 'Metelli', f: 'Subjekt', u: true }, { w: 'sumitur', f: 'Prädikat' }, { w: 'a Clodia', f: 'Präpositionale Bestimmung' }, { w: ',', f: PUNCT }, { w: 'venenum', f: 'Subjekt' }, { w: 'quaeritur', f: 'Prädikat' }, { w: 'quod', f: 'Subjekt' }, { w: 'Clodiae', f: 'Dativobjekt' }, { w: 'daretur', f: 'Prädikat' }, { w: '.', f: PUNCT }], groups: [{ start: 7, end: 10, label: 'Relativsatz' }] },
        en: { words: [{ w: 'Aurum', f: 'Subject' }, { w: 'Metelli', f: 'Subject', u: true }, { w: 'sumitur', f: 'Verb' }, { w: 'a Clodia', f: 'Prepositional phrase' }, { w: ',', f: PUNCT }, { w: 'venenum', f: 'Subject' }, { w: 'quaeritur', f: 'Verb' }, { w: 'quod', f: 'Subject' }, { w: 'Clodiae', f: 'Dative object' }, { w: 'daretur', f: 'Verb' }, { w: '.', f: PUNCT }], groups: [{ start: 7, end: 10, label: 'Relative clause' }] }
    };

    // The clause labels are read from the label module, so prompt and editor can never disagree about them.
    function groupLabels(lang) {
        const L = (typeof module !== 'undefined' && module.exports) ? require('./latin-labels.js')
            : (typeof globalThis !== 'undefined' ? globalThis : this).LatinLabels;
        return L.GROUP_LABELS[lang].join(', ');
    }

    function buildPrompt(lang, txt, labels) {
        const example = JSON.stringify(EXAMPLE[lang]).replace(/"words":/, '"words": ').replace(/"groups":/, ' "groups": ');
        const list = (labels || []).join(', ');
        if (lang === 'de') {
            return `Analysiere die lateinische Syntax von: "${txt}".
1. KEINE ÜBERSETZUNG: Analysiere direkt die lateinische Morphologie und Syntax (Kasus, Kongruenz, Verbvalenz). Übersetze den Satz NICHT im Hintergrund und analysiere auf keinen Fall die deutsche Übersetzung!
2. STRIKTE REGEL: Behalte die EXAKTE Wortreihenfolge bei. Lass KEINE Wörter und KEINE Satzzeichen aus (insbesondere nicht den Schlusspunkt!).
3. PHRASEN: Benachbarte Wörter einer Phrase erhalten die gleiche Funktion.
4. KOORDINATION: Wenn eine Konjunktion (z.B. 'et', 'aut', '-que') Wörter mit derselben syntaktischen Funktion verbindet (z.B. zwei Adverbien oder zwei Subjekte), gib der Konjunktion und den Wörtern EXAKT DASSELBE Label, damit sie verschmelzen.
5. HYPERBATON: Getrennte Phrasen erhalten die gleiche Funktion, bleiben aber an ihrem Platz.
6. INTERPUNKTION: Jedes Satzzeichen (inkl. Schlusspunkt) wird als eigenes Token mit "f": "${PUNCT}" ausgegeben.
7. GRUPPEN & NEBENSÄTZE: Identifiziere mehrteilige Konstruktionen und lege dafür eine Gruppe in "groups" an. WICHTIG: Wenn du eine 'Subjunktion' oder ein Relativpronomen identifizierst, MUSST du zwingend eine entsprechende Gruppe erstellen und ihr eines dieser festen Satz-Labels geben (sie gelten unabhängig vom gewählten Niveau, auch wenn sie unten nicht bei den Wort-Labels stehen): ${groupLabels('de')}. Der "end"-Index schließt den Satz logisch ab (meist beim finiten Verb/Satzzeichen) und zerschneidet keine Phrasen.
8. GENITIVATTRIBUTE: Adjektive und Genitivattribute werden mit ihrem Bezugswort zusammengefasst (sie erhalten also EXAKT DASSELBE Label, z.B. beide "Subjekt"). Damit das Genitivattribut trotzdem erkennbar bleibt, füge ZWINGEND dem JSON-Objekt des Genitivattributs die Eigenschaft "u": true hinzu. Verwende NIEMALS das Label "Genitivattribut" selbst als Funktionslabel ("f") und erstelle KEINE "groups" Klammer für Genitivattribute!
9. BEISPIEL: Für "${EXAMPLE_TEXT}" antworte exakt so: ${example}
10. WICHTIG: Antworte AUSSCHLIESSLICH mit gültigem JSON. Keine Kommentare, keine abschließenden Kommas (trailing commas) vor Klammern! Format: { "words": [{"w": "Wort", "f": "Label", "u": true}], "groups": [] }
Verwende für die Wort-Labels ("f") ausschließlich diese Labels: ${list}. Für Klammern ("groups") darfst du zusätzlich diese Satz-Labels verwenden: ${groupLabels('de')}.`;
        }
        return `Analyze the Latin syntax of: "${txt}".
1. NO TRANSLATION: Analyze the Latin morphology and syntax directly (cases, agreement, verb valency). Do NOT translate the sentence in the background and do not analyze the syntax of an English translation!
2. STRICT RULE: Maintain the EXACT word order. Do NOT omit any words or punctuation marks (especially the final full stop!).
3. PHRASES: Adjacent words of one phrase get the same function.
4. COORDINATION: If a conjunction (e.g. 'et', 'aut', '-que') connects words with the same syntactical function (e.g. two adverbs or two subjects), give the conjunction and the words the EXACT SAME label so they merge.
5. HYPERBATON: Split phrases get the same function but stay in place.
6. PUNCTUATION: Include EVERY punctuation mark (including the final full stop) as a separate token with "f": "${PUNCT}".
7. GROUPS & CLAUSES: Identify multi-word constructions and create a group for them in "groups". IMPORTANT: If you tag a word as a 'Subjunction' or a relative pronoun, you MUST create a corresponding group and give it one of these fixed clause labels (they apply regardless of the chosen level, even if they are not in the word-label list below): ${groupLabels('en')}. The "end" index closes the clause logically (usually at the finite verb or punctuation mark) and NEVER cuts a phrase in half.
8. GENITIVE ATTRIBUTES: Adjectives and genitive attributes are grouped with the word they modify (they get the EXACT SAME label, e.g. both "Subject"). To keep the genitive attribute recognisable, you MUST add the property "u": true to its JSON object. NEVER use the label "Genitive attribute" itself as a word's function ("f"), and create NO group in "groups" for a genitive attribute!
9. EXAMPLE: For "${EXAMPLE_TEXT}" answer exactly like this: ${example}
10. IMPORTANT: Return ONLY valid JSON. No comments, no trailing commas before brackets! Format: { "words": [{"w": "Word", "f": "Label", "u": true}], "groups": [] }
For word labels ("f") use ONLY these labels: ${list}. For groups ("groups") you may additionally use these fixed clause labels: ${groupLabels('en')}.`;
    }

    return { PUNCT, EXAMPLE_TEXT, EXAMPLE, buildPrompt };
});
