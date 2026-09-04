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

    // The worked example of rule 9, in both languages. "Clodiae" is a dative object and therefore carries NO
    // genitive marker; the marker is shown in rule 8 with a real genitive attribute ("amor patriae").
    const EXAMPLE_TEXT = 'Aurum sumptum a Clodia, venenum quaesitum quod Clodiae daretur.';
    const EXAMPLE = {
        de: { words: [{ w: 'Aurum', f: 'Subjekt' }, { w: 'sumptum', f: 'Prädikat' }, { w: 'a Clodia', f: 'Präpositionale Bestimmung' }, { w: ',', f: PUNCT }, { w: 'venenum', f: 'Subjekt' }, { w: 'quaesitum', f: 'Prädikat' }, { w: 'quod', f: 'Subjekt' }, { w: 'Clodiae', f: 'Dativobjekt' }, { w: 'daretur', f: 'Prädikat' }, { w: '.', f: PUNCT }], groups: [{ start: 6, end: 9, label: 'Relativsatz' }] },
        en: { words: [{ w: 'Aurum', f: 'Subject' }, { w: 'sumptum', f: 'Verb' }, { w: 'a Clodia', f: 'Prepositional phrase' }, { w: ',', f: PUNCT }, { w: 'venenum', f: 'Subject' }, { w: 'quaesitum', f: 'Verb' }, { w: 'quod', f: 'Subject' }, { w: 'Clodiae', f: 'Dative object' }, { w: 'daretur', f: 'Verb' }, { w: '.', f: PUNCT }], groups: [{ start: 6, end: 9, label: 'Relative clause' }] }
    };
    const GEN_EXAMPLE = {
        de: '{"w":"amor","f":"Subjekt"},{"w":"patriae","f":"Subjekt","u":true}',
        en: '{"w":"amor","f":"Subject"},{"w":"patriae","f":"Subject","u":true}'
    };

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
7. GRUPPEN & NEBENSÄTZE: Identifiziere mehrteilige Konstruktionen (z.B. Nebensatz, Relativsatz, AcI/NcI, Partizipialkonstruktion) und lege dafür eine Gruppe in "groups" an. WICHTIG: Wenn du eine 'Subjunktion' oder ein Relativpronomen identifizierst, MUSST du zwingend eine entsprechende Gruppe erstellen. Der "end"-Index schließt den Satz logisch ab (meist beim finiten Verb/Satzzeichen) und zerschneidet keine Phrasen.
8. GENITIVATTRIBUTE: Adjektive und Genitivattribute werden mit ihrem Bezugswort zusammengefasst (sie erhalten also EXAKT DASSELBE Label, z.B. beide "Subjekt"). Damit das Genitivattribut trotzdem erkennbar bleibt, füge ZWINGEND dem JSON-Objekt des Genitivattributs die Eigenschaft "u": true hinzu, z.B. für "amor patriae": ${GEN_EXAMPLE.de}. Das Genitivattribut hat kein eigenes Label und bekommt KEINE Gruppe in "groups"!
9. BEISPIEL: Für "${EXAMPLE_TEXT}" antworte exakt so: ${example}
10. WICHTIG: Antworte AUSSCHLIESSLICH mit gültigem JSON. Keine Kommentare, keine abschließenden Kommas (trailing commas) vor Klammern! Format: { "words": [{"w": "Wort", "f": "Label", "u": true}], "groups": [] }
Verwende ausschließlich diese Labels: ${list}.`;
        }
        return `Analyze the Latin syntax of: "${txt}".
1. NO TRANSLATION: Analyze the Latin morphology and syntax directly (cases, agreement, verb valency). Do NOT translate the sentence in the background and do not analyze the syntax of an English translation!
2. STRICT RULE: Maintain the EXACT word order. Do NOT omit any words or punctuation marks (especially the final full stop!).
3. PHRASES: Adjacent words of one phrase get the same function.
4. COORDINATION: If a conjunction (e.g. 'et', 'aut', '-que') connects words with the same syntactical function (e.g. two adverbs or two subjects), give the conjunction and the words the EXACT SAME label so they merge.
5. HYPERBATON: Split phrases get the same function but stay in place.
6. PUNCTUATION: Include EVERY punctuation mark (including the final full stop) as a separate token with "f": "${PUNCT}".
7. GROUPS & CLAUSES: Identify multi-word constructions (e.g. Subordinate clause, Relative clause, AcI/NcI, Participial phrase) and create a group for them in "groups". IMPORTANT: If you tag a word as a 'Subjunction' or a relative pronoun, you MUST create a corresponding group. The "end" index closes the clause logically (usually at the finite verb or punctuation mark) and NEVER cuts a phrase in half.
8. GENITIVE ATTRIBUTES: Adjectives and genitive attributes are grouped with the word they modify (they get the EXACT SAME label, e.g. both "Subject"). To keep the genitive attribute recognisable, you MUST add the property "u": true to its JSON object, e.g. for "amor patriae": ${GEN_EXAMPLE.en}. A genitive attribute has no separate label and gets NO group in "groups"!
9. EXAMPLE: For "${EXAMPLE_TEXT}" answer exactly like this: ${example.replace(/"f":"Subjekt"/g, '"f":"Subject"')}
10. IMPORTANT: Return ONLY valid JSON. No comments, no trailing commas before brackets! Format: { "words": [{"w": "Word", "f": "Label", "u": true}], "groups": [] }
Use ONLY these labels: ${list}.`;
    }

    return { PUNCT, EXAMPLE_TEXT, EXAMPLE, buildPrompt };
});
