# Latin Syntax Studio

Anke Walter's tool for teaching Latin syntax. A teacher pastes a Latin text, an AI produces a first analysis (which words form a phrase, what each phrase does in the sentence, where the subordinate clauses are), the teacher corrects it in a visual editor, and exports a self-contained web page on which students work through the sentence themselves: they label every phrase, find the hidden genitive attributes, and translate once the analysis is right.

The site is static (GitHub Pages) and needs no installation. Open `index.html` in a browser, or use the published address.

## How a teacher uses it

1. **Set up** on the start page: title, optional notes and picture for the students, the Latin text (up to 300 words), and the grammar level, which decides which labels are offered.
2. **Analyze** with "Mit KI analysieren" / "Analyze with AI". The analysis appears in the editor: colour-coded phrases with their function, brackets for clauses, underlines for genitive attributes. Click a word to change its label, draw brackets, split or merge phrases, add hints. Keyboard shortcuts are listed in the editor's instructions.
3. **Export** the student page with "Schülerseite exportieren". The result is one HTML file that works offline. Save your work as a project file at any time and load it again later.

The exported exercises in this repository (`cic_cael_*.html`, `example_page*.html`) are examples of that output: Cicero, *Pro Caelio*.

## The AI step and the API key

The analysis is done by OpenAI's API with a fixed answer format (a JSON schema whose labels are exactly the ones of the chosen grammar level). Who holds the key depends on how the site is run:

- **Proxy (recommended for a shared site):** a small Cloudflare Worker in `worker/` holds the key as a secret, accepts requests only from this website, applies rate limits, and forwards to OpenAI. Nobody using the site enters anything. Setup in five steps: `worker/README.md`. The page switches to this mode when `CONFIG.AI.PROXY_URL` in `index.html` is set.
- **Own key in the browser (single teacher, or a demo):** without a proxy address, the page asks once for an OpenAI key via the key button and stores it in that browser only. A link of the form `index.html#key=sk-...` stores the key on opening and removes it from the address bar, which is handy for a presentation. Anyone who has that link can use the key's balance; rotate it afterwards.

The key is never part of this repository, of saved project files, or of exported student pages. Model, reasoning effort and timeout are set in `CONFIG.AI`.

## What to expect from the AI, honestly

The AI writes a **draft that the teacher corrects**, not a finished answer. Review every exercise in the editor before it reaches students: subjects, clause boundaries, predicatives and the ablative absolute are the places to look first. If the AI drops, changes or invents a word, the page warns before importing. (An earlier version of this project tried a local Latin parser instead of an AI service; it reached about 70 percent correct labels and was abandoned. The AI service has not been measured on the same material yet; the exported exercises in this repository, which contain the teacher's own corrected analyses, would be the material for that.)

Grammar-side rules (the prompt, the label sets, the preposition list, the enclitic rule) are documented and questioned in `docs/syntax-analyse-review.md`. Decisions about them are the author's.

## What is in this repository

| Path | What it is |
|---|---|
| `index.html` | The teacher tool, including the template of the exported student page |
| `src/latin-core.js` | The text logic the tool shares with the tests: tokenising, enclitics, preposition welding, the completeness check of AI answers |
| `worker/` | The Cloudflare Worker that holds the OpenAI key (optional), with its own README |
| `docs/syntax-analyse-review.md` | Review of the syntax-analysis logic with proposals (German) |
| `tests/` | Automated tests for `src/latin-core.js` |
| `cic_cael_*.html`, `example_page*.html` | Exported student exercises |

## Development

No build step and no dependencies. Run the tests with Node.js 18 or newer:

```
npm test
```

`index.html` is edited directly; `src/latin-core.js` holds the pure text functions so they can be tested. The student page template sits inside `index.html` in two `<script type="text/template">` blocks (CSS and JavaScript). The Worker is deployed separately with Wrangler (see `worker/README.md`).

## Credits

Created by Anke Walter, with help from J. L., ChatGPT and Gemini. The picture on the example pages was designed by Freepik (www.freepik.com).
