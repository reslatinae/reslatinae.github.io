# Review der Syntaxanalyse-Logik

Stand: 4. September 2026. Zeilenangaben beziehen sich auf `index.html` im Hauptzweig (Commit `98dc8c8`).

Dieses Dokument ändert keine Logik. Es sammelt Widersprüche und Beobachtungen aus dem KI-Prompt, den Label-Listen und der Schülerseite und macht Vorschläge. Alle Entscheidungen zur Grammatik liegen bei der Autorin; die Vorschläge sind als Diskussionsgrundlage gedacht.

**Kurzfassung der drei wichtigsten Punkte**

1. Das Beispiel im Prompt (Regel 9) markiert ein Dativobjekt (`Clodiae`) mit `"u": true`, obwohl Regel 8 dieses Kennzeichen für Genitivattribute reserviert. Das Modell lernt aus dem Beispiel und setzt die Unterstreichung falsch.
2. Regel 7 verlangt für jede Subjunktion und jedes Relativpronomen eine Klammer (`Nebensatz`/`Relativsatz`), aber auf der Stufe „Anfänger“ sind diese Labels nicht erlaubt; der Import macht daraus „Sonstiges“.
3. `cum` steht in der Präpositionsliste und wird deshalb immer mit dem Folgewort zu einer „Präpositionalen Bestimmung“ verschmolzen, auch als Subjunktion („cum Caesar venisset“).

---

## 1. Was geprüft wurde

| Bereich | Stelle |
|---|---|
| KI-Prompt, deutsch / englisch | Z. 2227–2238 / Z. 2239–2250 |
| Label-Listen pro Stufe (Anfänger, Fortgeschritten, Profi) | Z. 975–986 |
| Farben und Abkürzungen der Labels | Z. 950–974, Z. 987–990 |
| Synonym-Zuordnung `normalizeLabel` (bildet KI-Ausgaben auf die festen Labels ab) | Z. 2314–2356 |
| Präpositionsliste und Verschmelzungsregel | Z. 940, Z. 2287–2301 |
| Enklitika-Regel (-que, -ne, -ve) | Z. 2306 |
| Anleitungstexte der Schülerseite | Z. 2585–2614 |
| Prüfungsmodus und Punktevergabe | Z. 776–792 |
| Die 13 veröffentlichten Übungen (`cic_cael_*.html`) als Beleg für die tatsächliche Verwendung | – |

Tatsächliche Verwendung der Labels in den veröffentlichten Übungen (Anzahl markierter Wortgruppen):

| Label | Anzahl | | Klammer-Label | Anzahl |
|---|---|---|---|---|
| Prädikat | 196 | | Nebensatz | 85 |
| Adverb | 174 | | Relativsatz | 40 |
| Subjekt | 164 | | AcI | 32 |
| Akkusativobjekt | 163 | | Partizipialkonstruktion | 7 |
| Präpositionale Bestimmung | 128 | | Infinitiv | 2 |
| Verb (ältere Übungen) | 95 | | | |
| Infinitiv | 73 | | | |
| Sonstiges | 67 | | | |
| Prädikativum | 56 | | | |
| Subjunktion | 49 | | | |
| Dativobjekt | 46 | | | |
| Konjunktion | 40 | | | |
| Ablativ | 38 | | | |
| Vokativ | 14 | | | |
| Ablativus absolutus | 7 | | | |
| AcI (als Wortlabel) | 4 | | | |
| Genitivobjekt | 3 | | | |
| Partizipialkonstruktion (als Wortlabel) | 1 | | | |

Die Genitiv-Unterstreichung (`"u": true`) kommt bisher nur in „pro Caelio 26“ vor (18 Wörter).

---

## 2. Widersprüche

### 2.1 Das Prompt-Beispiel markiert ein Dativobjekt als Genitivattribut

Regel 8 (Z. 2235): Genitivattribute erhalten das Label ihres Bezugsworts und zusätzlich `"u": true`.

Regel 9 (Z. 2236) enthält aber: `{"w":"Clodiae","f":"Dativobjekt","u":true}`. In „quod Clodiae daretur“ ist `Clodiae` Dativ, kein Genitivattribut. Die englische Fassung (Z. 2248) hat denselben Fehler.

Warum es zählt: Sprachmodelle orientieren sich stärker am Beispiel als an der Regel. Die Folge sind falsche Unterstreichungen, die Schülerinnen und Schüler dann „finden“ sollen.

Vorschlag: `"u": true` beim Beispiel-Token entfernen und ein kurzes zweites Beispiel mit echtem Genitivattribut anfügen, z. B. `{"w":"amor","f":"Subjekt"},{"w":"patriae","f":"Subjekt","u":true}`.

### 2.2 Regel 7 verlangt Klammern, die auf der Stufe „Anfänger“ nicht erlaubt sind

Regel 7 (Z. 2234): Wer eine Subjunktion oder ein Relativpronomen erkennt, „MUSS zwingend“ eine entsprechende Gruppe erstellen. Regel 10 erlaubt aber nur die Labels der gewählten Stufe. Die Anfängerliste (Z. 982) enthält weder `Nebensatz`, `Relativsatz` noch `Subjunktion`. Beim Import werden Klammern mit unbekanntem Label auf „Sonstiges“ gesetzt (Z. 2399).

Mit der neuen KI-Anbindung wird das noch sichtbarer: Dort erhält das Modell die erlaubten Labels als festes Schema und kann für Klammern auf Anfängerstufe gar kein Satz-Label ausgeben.

Vorschlag: Eine feste Liste von Klammer-Labels, die auf allen Stufen gilt (`Nebensatz`, `Relativsatz`, `AcI/NcI`, `Partizipialkonstruktion`, `Ablativus absolutus`), getrennt von den Wort-Labels der Stufe. Alternativ Regel 7 für die Anfängerstufe streichen.

### 2.3 `cum` wird immer als Präposition verschmolzen

Die Präpositionsliste (Z. 940) enthält `cum`. Die Verschmelzungsregel (Z. 2287–2301) hängt jedes Wort aus dieser Liste an das folgende Wort und überschreibt das Label mit „Präpositionale Bestimmung“, auch wenn das Modell „Subjunktion“ gesagt hat. Aus „Cum Caesar venisset, …“ wird die Präpositionalphrase „Cum Caesar“.

Dasselbe Risiko besteht bei adverbialem Gebrauch von `ante`, `post`, `contra`, `circum`, `super`, `prope`.

Vorschlag (zwei Wege):

- a) `cum` aus der Liste streichen. `cum` + Ablativ erkennt das Modell ohnehin und vergibt das Label direkt.
- b) Nur verschmelzen, wenn das Modell beide Wörter bereits als „Präpositionale Bestimmung“ markiert hat. Die Liste dient dann nur noch der manuellen Erstellung, wo kein Modell beteiligt ist.

### 2.4 „Genitivattribut“ existiert als Farbe, Abkürzung und Synonym, aber nicht als Label

`Genitivattribut` hat eine Farbe (Z. 960), eine Abkürzung (Z. 989) und wird in der Synonym-Zuordnung erkannt (Z. 2326, Z. 2342). Es steht aber in keiner Stufenliste. Gibt das Modell entgegen Regel 8 „Genitivattribut“ aus, wird daraus beim Import „Sonstiges“ (Z. 2417); die Information geht verloren.

Vorschlag: Entweder das Label offiziell aufnehmen (dann wäre die Unterstreichung zweitrangig) oder im Prompt ausdrücklich verbieten („Verwende nie das Label Genitivattribut; markiere stattdessen mit u:true“) und die Reste aus Farben/Abkürzungen entfernen.

### 2.5 Deutscher und englischer Prompt sind nicht deckungsgleich

- Regel 4 (Koordination): deutsch mit Beispielen („et“, „aut“, „-que“), englisch ohne.
- Regel 7: deutsch nennt AcI/NcI und Partizipialkonstruktion als Beispiele, englisch nur „true multi-word clauses“.

Vorschlag: Eine Fassung als Vorlage pflegen und die andere daraus übersetzen, damit beide Sprachen dieselbe Analyse liefern.

### 2.6 Partizipien im Beispiel sind „Prädikat“ ohne Klammer

Im Beispielsatz sind `sumptum` und `quaesitum` als „Prädikat“ markiert (elliptisch, „est“ fehlt), ohne Klammer „Partizipialkonstruktion“, obwohl Regel 7 solche Konstruktionen als Gruppen vorsieht. Für die Cicero-Stelle ist das vertretbar; das Modell verallgemeinert aber: Partizip → Prädikat.

Vorschlag: Beispielsatz mit finiten Verben wählen oder den elliptischen Charakter im Beispiel kurz benennen.

### 2.7 Uneinheitliche Labelnamen in den veröffentlichten Übungen

Ältere Übungen (1,1; 1,2; 2,3-4; 5; 6) zeigen „Verb“ und „AcI“, neuere „Prädikat“ und „AcI/NcI“. Schülerinnen und Schüler begegnen je nach Übung unterschiedlichen Namen für dieselbe Funktion (95 × „Verb“ gegenüber 196 × „Prädikat“).

Vorschlag: Einen Namen festlegen und die betroffenen Übungen neu exportieren. Alternativ „Verb“ als Alias in der Übersetzungstabelle der Schülerseite führen.

---

## 3. Beobachtungen zum Label-Set (zur Entscheidung)

- **Mischung der Ebenen.** Die Liste vereint Kasus (`Ablativ`), Wortarten (`Adverb`, `Konjunktion`, `Subjunktion`, `Infinitiv`) und Satzglieder (`Subjekt`, Objekte, `Prädikativum`). Die 174 „Adverb“-Markierungen zeigen, dass das Label faktisch als „Adverbiale Bestimmung“ dient. Frage: Soll „Adverb“ in „Adverbiale Bestimmung“ umbenannt werden, und soll „Ablativ“ eine Funktion benennen (z. B. „Adverbiale Bestimmung (Abl.)“)?
- **Fehlende Kategorien.** Es gibt kein `Prädikatsnomen`, keine `Apposition`, kein `Attribut`. Adjektivattribute werden laut Regel 8 mit dem Bezugswort zusammengefasst (konsistent), Appositionen bleiben unbestimmt.
- **Synonymtabelle.** `normalizeLabel` kennt „Attribut“, „Apposition“, „Adverbiale“, „Objekt“ nicht; solche Ausgaben werden „Sonstiges“. Wenn die Liste bleibt, wie sie ist, könnten wenigstens „Adverbiale“ → „Adverb“ und „Prädikatsnomen“ → „Prädikativum“ ergänzt werden. Mit der KI-Anbindung ist das Modell ohnehin auf die erlaubten Labels festgelegt; die Tabelle greift dann praktisch nicht mehr.
- **Tastenkürzel.** Die Kürzeltabellen (Z. 444 Schülerseite, Z. 1360 Editor) nennen noch „Accusative with infinitive“ und „AcI“; das aktuelle Label heißt „AcI/NcI“. Das Kürzel `c` funktioniert nur zufällig, weil der Buchstabe frei ist.
- **Abkürzungen.** „Prädikat“ und „Nebensatz“ werden nicht gekürzt (Z. 989) und sind unter kurzen Wörtern breiter als das Wort.

---

## 4. Fragen zur Schülerseite (Produktentscheidungen)

- **Prüfungsmodus ohne Ende.** Das Ergebnis erscheint nur, wenn alle Wortgruppen bestimmt *und* alle versteckten Genitivattribute markiert sind (Z. 776). Wer ein Genitivattribut nicht findet, bekommt weder Ergebnis noch Übersetzungsfeld noch einen Hinweis, was fehlt. Vorschlag: Button „Prüfung abgeben“, der nicht markierte Genitive als Fehler zählt, und/oder ein Hinweis „Es fehlen noch n Genitivattribute“.
- **Asymmetrische Punkte.** Falsche Genitiv-Tipps ziehen Punkte ab (Z. 782), falsche Labels im Prüfungsmodus kosten nur den Punkt der Aufgabe. Ist das gewollt?
- **Alle Palettenlabels im Antwortmenü.** Beim Export landen alle Labels der Palette im Menü der Schülerseite (Z. 2577, Z. 2662), auch unbenutzte Hilfslabels; in „pro Caelio 26“ stehen „1“ und „2“ zur Auswahl. Vorschlag: nur im Text verwendete Labels plus eine feste Menge an Ablenkern exportieren.

---

## 5. Bereits im Cleanup geändert (Code-Fehler, keine Grammatikentscheidung)

- **Enklitika nur mit Bindestrich.** Bisher wurde jedes alleinstehende „ne“ oder „ve“ an das vorhergehende Wort geklebt („Timeo ne veniat“ → „Timeone veniat“). Jetzt gilt die Regel nur für „-que“, „-ne“, „-ve“ mit Bindestrich.
- **Keine doppelte Präpositionsverschmelzung.** Ein Token, das schon eine Phrase ist („a Clodia“, wie im Prompt-Beispiel vorgegeben), wurde erneut mit dem Folgewort verschmolzen („in foro Romae ambulabat“ als eine Präpositionalphrase, samt falscher Genitiv-Unterstreichung). Jetzt werden nur einzelne Wörter aus der Präpositionsliste verschmolzen.

Beides beseitigt offensichtliches Fehlverhalten; die Präpositionsliste, die Regeln des Prompts und die Label-Listen sind unverändert.
