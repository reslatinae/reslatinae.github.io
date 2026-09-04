// Latin Syntax Studio – core text logic shared by index.html and the tests.
// Pure functions only: no DOM, no application state. index.html loads this as a classic
// script (window.LatinCore); the tests load it with require(). No build step.
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.LatinCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const PUNCT = 'Punct';

    // Words that are welded onto the following word as one "Präpositionale Bestimmung" / "Prepositional phrase".
    // Grammar-side list: change here (see docs/syntax-analyse-review.md for the discussion of "cum").
    const PREPOSITIONS = ["a", "ab", "ad", "ante", "apud", "circum", "contra", "cum", "de", "e", "ex", "extra", "in", "infra", "inter", "intra", "ob", "per", "post", "prae", "pro", "prope", "propter", "sine", "sub", "super", "trans", "ultra"];

    // Any Unicode letter (covers ā ē ī ō ū in both precomposed and decomposed form).
    function hasLetters(s) { return /\p{L}/u.test(String(s == null ? '' : s)); }

    // Lower-case and strip diacritics (macrons, breves) for comparisons: "Ā" -> "a".
    function foldLatin(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

    // Rejoin words hyphenated across a line break: "sump-\ntum" -> "sumptum".
    function joinHyphenation(text) { return String(text == null ? '' : text).replace(/(\p{L})-\s*(\p{L})/gu, '$1$2'); }

    // The light clean-up applied to the teacher's text before analysis: hyphenation joined, straight double quotes -> single quotes.
    function sanitizeText(text) { return joinHyphenation(text).replace(/"/g, "'"); }

    function countWords(text) { const t = String(text == null ? '' : text).trim(); return t ? t.split(/\s+/).length : 0; }

    // Text -> ordered token strings: words (letters, combining marks, hyphens) and punctuation runs.
    function tokenize(text) { return String(text == null ? '' : text).match(/[\p{L}\p{M}-]+|[^\p{L}\p{M}\s]+/gu) || []; }

    // Is this token (its first word) a preposition? Macron-insensitive: "ā" counts as "a".
    function isPreposition(word) {
        const first = String(word == null ? '' : word).trim().split(/\s+/)[0];
        const pure = foldLatin(first).replace(/[^a-z]/g, '');
        return PREPOSITIONS.includes(pure);
    }

    // Weld each single-word preposition onto the following word (never across punctuation, never a token that is
    // already a phrase such as "a Clodia"). Returns { welded, map } with map[originalIndex] = weldedIndex.
    function weldPrepositions(tokens, prepLabel) {
        const welded = []; const map = {};
        for (let i = 0; i < tokens.length; i++) {
            const curr = tokens[i]; map[i] = welded.length;
            const isSingleWord = !/\s/.test(String(curr.w == null ? '' : curr.w).trim());
            if (isSingleWord && isPreposition(curr.w) && i + 1 < tokens.length && tokens[i + 1].f !== PUNCT) {
                const nextW = tokens[i + 1];
                welded.push({
                    w: curr.w + ' ' + String(nextW.w == null ? '' : nextW.w).replace(/^-/, ''),
                    f: prepLabel,
                    b: curr.b || 0,
                    u: !!(curr.u || nextW.u),
                    h: curr.h || nextW.h,
                    isSplit: nextW.isSplit
                });
                map[i + 1] = welded.length - 1; i++;
            } else {
                welded.push(curr);
            }
        }
        return { welded, map };
    }

    // Token strings -> token objects for manual creation: punctuation tagged, hyphenated enclitics ("-que") glued
    // onto the previous word (a bare "ne" stays a word), then prepositions welded.
    function processTokens(rawTokens, otherLabel, prepLabel) {
        const temp = [];
        rawTokens.forEach(t => {
            const isEnclitic = /^-(que|ne|ve)$/i.test(t);
            if (!hasLetters(t)) temp.push({ w: t, f: PUNCT, b: 0, u: false });
            else if (isEnclitic && temp.length > 0 && hasLetters(temp[temp.length - 1].w)) temp[temp.length - 1].w += t.replace(/^-/, '');
            else temp.push({ w: t, f: otherLabel, b: 0, u: false });
        });
        return weldPrepositions(temp, prepLabel).welded;
    }

    // Split a multi-word token ("a Clodia") into its parts; returns null when the token has no whitespace.
    // Label, hint, break and split flags are distributed the way the editor expects.
    function splitTokenParts(wordObj) {
        const text = String(wordObj.w == null ? '' : wordObj.w).trim();
        if (!/\s/.test(text)) return null;
        const parts = text.split(/\s+/);
        return parts.map((p, i) => ({
            w: p,
            f: hasLetters(p) ? wordObj.f : PUNCT,
            isSplit: i === parts.length - 1 ? wordObj.isSplit : false,
            h: i === 0 ? wordObj.h : '',
            b: i === parts.length - 1 ? wordObj.b : 0,
            u: wordObj.u
        }));
    }

    // Comparison form of a word: diacritics stripped, v/u and j/i merged, letters only.
    function normalizeForCompare(word) { return foldLatin(word).replace(/v/g, 'u').replace(/j/g, 'i').replace(/[^a-z]/g, ''); }

    // Does the analysis contain every word of the text (and nothing else)? Splitting differences ("virumque" vs
    // "virum" + "que") are tolerated; missing, invented or altered words are reported in their original spelling.
    function compareCoverage(inputText, words) {
        const inTok = tokenize(inputText).filter(hasLetters).map(t => ({ orig: t, norm: normalizeForCompare(t) })).filter(t => t.norm);
        const outTok = [];
        (words || []).forEach(w => tokenize(String(w.w == null ? '' : w.w)).filter(hasLetters).forEach(t => { const norm = normalizeForCompare(t); if (norm) outTok.push({ orig: t, norm }); }));
        if (inTok.map(t => t.norm).join('') === outTok.map(t => t.norm).join('')) return { ok: true, missing: [], extra: [] };
        const count = (arr) => arr.reduce((m, t) => { m[t.norm] = (m[t.norm] || 0) + 1; return m; }, {});
        const ci = count(inTok), co = count(outTok);
        const missing = [], extra = [];
        const seenIn = {}, seenOut = {};
        inTok.forEach(t => { seenIn[t.norm] = (seenIn[t.norm] || 0) + 1; if (seenIn[t.norm] > (co[t.norm] || 0)) missing.push(t.orig); });
        outTok.forEach(t => { seenOut[t.norm] = (seenOut[t.norm] || 0) + 1; if (seenOut[t.norm] > (ci[t.norm] || 0)) extra.push(t.orig); });
        return { ok: false, missing, extra };
    }

    return { PUNCT, PREPOSITIONS, hasLetters, foldLatin, joinHyphenation, sanitizeText, countWords, tokenize, isPreposition, weldPrepositions, processTokens, splitTokenParts, normalizeForCompare, compareCoverage };
});
