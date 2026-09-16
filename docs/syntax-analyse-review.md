# Review der Syntaxanalyse-Logik

Stand: 7. September 2026, nach Ihren Änderungen vom 6. September und deren Zusammenführung mit der API-Fassung.

Dieses Dokument ändert keine Logik. Es sammelt Widersprüche und Beobachtungen aus dem KI-Prompt, den Label-Listen und der Schülerseite und macht Vorschläge. Alle Entscheidungen zur Grammatik liegen bei Ihnen; die Vorschläge sind als Diskussionsgrundlage gedacht.

Die Punkte der ersten Fassung sind inzwischen erledigt — die beiden wichtigsten haben Sie selbst gelöst (feste Klammer-Labels für alle Stufen, `cum` aus der Präpositionsliste). Abschnitt 4 hält fest, was umgesetzt wurde.

Offen ist nur noch eine Frage: ob der Prompt zusätzlich ein Beispiel für eine Partizipialkonstruktion mit Klammer enthalten soll (Abschnitt 2).

---

## 1. Was geprüft wurde

Die Textlogik und die Label-Listen liegen inzwischen in eigenen Dateien, damit sie geprüft und getestet werden können; Zeilenangaben sind deshalb durch Dateinamen ersetzt.

| Bereich | Stelle |
|---|---|
| KI-Prompt, deutsch und englisch | `src/latin-prompt.js` |
| Label-Listen pro Stufe, Klammer-Labels, Farben, Abkürzungen, Tastenkürzel | `src/latin-labels.js` |
| Synonym-Zuordnung `normalizeLabel` (bildet KI-Ausgaben auf die festen Labels ab) | `src/latin-labels.js` |
| Präpositionsliste, Verschmelzungsregel, Enklitika-Regel (-que, -ne, -ve) | `src/latin-core.js` |
| Anleitungstexte und Prüfungsmodus der Schülerseite | `index.html` (Vorlage `template-student-js`) |
| Die 15 veröffentlichten Übungen als Beleg für die tatsächliche Verwendung | `cic_cael_*.html`, `example_page*.html` |

Tatsächliche Verwendung der Labels in den veröffentlichten Übungen (Anzahl markierter Wortgruppen; die englische Beispielseite verwendet dieselben Labels auf Englisch und ist hier nicht mitgezählt):

| Wort-Label | Anzahl | | Klammer-Label | Anzahl |
|---|---|---|---|---|
| Prädikat | 303 | | Nebensatz | 88 |
| Adverbiale Bestimmung | 178 | | Relativsatz | 43 |
| Akkusativobjekt | 179 | | AcI/NcI | 32 |
| Subjekt | 177 | | Partizipialkonstruktion | 9 |
| Präpositionale Bestimmung | 138 | | Infinitiv | 4 |
| Infinitiv | 76 | | | |
| Sonstiges | 67 | | | |
| Prädikativum | 61 | | | |
| Ablativ | 52 | | | |
| Subjunktion | 51 | | | |
| Dativobjekt | 48 | | | |
| Konjunktion | 40 | | | |
| Vokativ | 14 | | | |
| Ablativus absolutus | 7 | | | |
| Partizipialkonstruktion (als Wortlabel) | 6 | | | |
| AcI/NcI (als Wortlabel) | 4 | | | |
| Genitivobjekt | 3 | | | |

Die Genitiv-Unterstreichung (`"u": true`) kommt weiterhin nur in „pro Caelio 26“ vor (18 Wörter).

---

## 2. Offene Frage: Partizipien im Beispiel

Im Beispielsatz des Prompts ist `sumitur` als „Prädikat“ markiert, und in der früheren Fassung waren es die Partizipien `sumptum` und `quaesitum` (elliptisch, „est“ fehlt), ohne Klammer „Partizipialkonstruktion“, obwohl Regel 7 solche Konstruktionen als Gruppen vorsieht. Für die Cicero-Stelle ist das vertretbar; das Modell verallgemeinert aber gern: Partizip → Prädikat.

Ihr neuer Beispielsatz („Aurum Metelli sumitur a Clodia …“) entschärft das bereits, weil er finite Formen verwendet. Es bleibt die Frage, ob der Prompt zusätzlich ein Beispiel für eine echte Partizipialkonstruktion mit Klammer enthalten soll — dann sieht das Modell einmal, wie eine solche Gruppe aussieht.

Vorschlag: so lassen, bis sich zeigt, dass Partizipialkonstruktionen tatsächlich zu selten erkannt werden. Ein zusätzliches Beispiel verlängert jeden Aufruf.

---

## 3. Beobachtungen zum Label-Set

Diese Punkte haben Sie bereits kommentiert; sie stehen hier nur noch als Zusammenfassung des Stands.

- **Mischung der Ebenen.** Die Liste vereint Kasus (`Ablativ`), Wortarten (`Konjunktion`, `Subjunktion`, `Infinitiv`) und Satzglieder (`Subjekt`, Objekte, `Prädikativum`). „Adverb“ heißt jetzt „Adverbiale Bestimmung“, was der tatsächlichen Verwendung entspricht. Für `Ablativ` haben Sie entschieden, es vorerst so zu lassen, obwohl ein Ablativ streng genommen etwas anderes ist als eine adverbiale Bestimmung — offen, aber bewusst offen.
- **Fehlende Kategorien.** Kein `Prädikatsnomen`, keine `Apposition`, kein `Attribut`. Das ist beabsichtigt: Ziel ist, dass Lernende Wortgruppen und Hierarchien erkennen, nicht jedes Wort einzeln bestimmen; zu viele Labels würden davon ablenken.
- **Synonymtabelle.** „adverbiale“ und „Prädikatsnomen“ sind ergänzt. Mit der KI-Anbindung ist das Modell ohnehin auf die erlaubten Labels festgelegt, die Tabelle greift also nur noch für importierte Fremd-Ausgaben.
- **Abkürzungen.** „Nebensatz“ wird jetzt als „N.satz“ gekürzt. „Prädikat“ bleibt bewusst ungekürzt, um es nicht mit „Präd“ für „Prädikativum“ zu verwechseln.

---

## 4. Bereits umgesetzt

### Von Ihnen entschieden und umgesetzt (6. September)

- **Feste Klammer-Labels für alle Stufen.** `Nebensatz`, `Relativsatz`, `AcI/NcI`, `Partizipialkonstruktion` und `Ablativus absolutus` gelten jetzt unabhängig vom gewählten Niveau. Der Prompt nennt sie getrennt von den Wort-Labels, der Import akzeptiert sie, und sie erscheinen in der Palette und im Antwortmenü der Schülerseite. Damit verliert eine Anfänger-Übung ihre korrekt beschriftete Klammer nicht mehr an „Sonstiges“.
- **`cum` ist aus der Präpositionsliste entfernt.** Aus „Cum Caesar venisset …“ wird keine Präpositionalphrase mehr; das Wort behält das Label, das das Modell vergibt („Subjunktion“), und die Nebensatz-Klammer entsteht wie vorgesehen.
- **„Adverb“ heißt im Deutschen „Adverbiale Bestimmung“**, „Nebensatz“ wird „N.satz“ abgekürzt, und `normalizeLabel` kennt „adverbiale“ und „Prädikatsnomen“.
- **Neues Prompt-Beispiel.** „Aurum Metelli sumitur a Clodia, venenum quaeritur quod Clodiae daretur.“ zeigt die Genitiv-Markierung an einem echten Genitivattribut (`Metelli`) und lässt das Dativobjekt `Clodiae` unmarkiert.
- **Rettung falsch gelabelter Genitivattribute.** Gibt das Modell trotz Regel 8 „Genitivattribut“ als Funktionslabel aus, übernimmt das Wort jetzt das Label seines Bezugsworts und behält die Unterstreichung, statt zu „Sonstiges“ zu werden.
- **Prüfungsmodus.** Knopf „Prüfung abgeben“: offene Wortgruppen werden aufgelöst und als Fehler gewertet, nicht gefundene Genitivattribute werden hervorgehoben, das Übersetzungsfeld erscheint, das Ergebnis wird berechnet. Genitivattribute zählen jetzt wie jede andere Aufgabe einen Punkt; falsche Versuche beim Suchen kosten keine Punkte mehr.

### Beim Zusammenführen korrigiert

- Ihre Genitiv-Rettung prüfte das bereits normalisierte Label; in der API-Fassung wird „Genitivattribut“ vorher zu „Sonstiges“, deshalb prüft sie jetzt die Roh-Antwort der KI.
- Im deutschen Beispiel stand `quaesitum`, im Beispielsatz aber `quaeritur`. Korrigiert; ein Test vergleicht jetzt Beispielsatz und Beispielanalyse Wort für Wort.
- Das englische „Adverb“ hatte durch die Umbenennung seine Farbe verloren und hat sie wieder.

### Danach ergänzt

- **„Adverb“ auch in den alten Übungen umbenannt.** Die 15 veröffentlichten Übungen sagen im Deutschen jetzt ebenfalls „Adverbiale Bestimmung“ (178 Stellen); die englische Beispielseite behält „Adverb“.
- **Keine unbenutzten Labels mehr im Antwortmenü.** Beim Export enthält das Menü die Standard-Labels der Stufe, die festen Klammer-Labels und jedes Label, das tatsächlich verwendet wurde. Hilfslabels, die beim Arbeiten angelegt, aber nie benutzt wurden, entfallen; die beiden Einträge „1“ und „2“ sind auch aus „pro Caelio 26“ entfernt.
- **Farbtabellen der Übungen repariert.** Bei der früheren Umbenennung „Verb“ → „Prädikat“ war in der englischen Beispielseite auch der Schlüssel in der Farbtabelle umbenannt worden, sodass deren zehn „Verb“-Antworten ohne Hintergrundfarbe blieben. Jede Übung enthält jetzt für jedes verwendete Label einen Eintrag in ihrer Farb-, Abkürzungs- und Übersetzungstabelle; ein Test prüft das.

### Vorher als Programmfehler behoben

- **„Genitivattribut“ ist kein halbes Label mehr.** Farbe und Abkürzung sind entfernt; ein Genitivattribut wird ausschließlich über `"u": true` am Wort ausgezeichnet, wie Regel 8 es vorsieht.
- **Deutscher und englischer Prompt sind deckungsgleich.** Gleiche zehn Regeln, gleiche Beispiel-Konjunktionen in Regel 4, gleiche Klammer-Labels in Regel 7 und 10, gleiche Erklärung der Genitiv-Markierung in Regel 8. Ein Test hält die Parität fest.
- **Einheitliche Labelnamen.** „Verb“ heißt überall „Prädikat“, „AcI“ und „Accusative with infinitive“ heißen „AcI/NcI“; die veröffentlichten Übungen wurden entsprechend umgeschrieben, alte Namen werden beim Import weiterhin erkannt.
- **Enklitika nur mit Bindestrich.** Ein alleinstehendes „ne“ wird nicht mehr an das vorhergehende Wort geklebt („Timeo ne veniat“ blieb „Timeone veniat“).
- **Keine doppelte Präpositionsverschmelzung.** Ein Token, das schon eine Phrase ist („a Clodia“), wird nicht erneut mit dem Folgewort verschmolzen.
- **Vollständigkeitsprüfung.** Vor dem Import wird geprüft, ob die Antwort der KI jedes Wort des Textes enthält; fehlende, veränderte oder erfundene Wörter werden benannt.
