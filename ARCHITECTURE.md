# EatMe — Architecture

Dieses Dokument ist die zentrale Referenz für alle Chats in diesem Projekt.
Jeder neue Sektions-Chat sollte kurz darauf verweisen ("lies ARCHITECTURE.md"),
statt Kontext neu zu erklären.

## Überblick

One-Page-Website für die Band/das Musikprojekt EatMe. Design-lastig: frei
positionierte Bilder, Grafiken, Songzeilen, Parallax- und Animationseffekte,
durchgehender Himmel-Hintergrund über alle Sektionen. Responsive
(Desktop-first, Mobile-Anpassungen pro Sektion).

Referenz-Design: Figma-File `njS6vA0NyvIyFcsPk3dDXH` ("EatMe – Website").

## Tech-Stack

**Vanilla HTML / CSS / JS. Kein Framework, kein Build-Step.**
Begründung: One-Pager dieser Größe braucht keinen Build-Prozess — einfacher
zu hosten (GitHub Pages direkt), einfacher zu debuggen, kein npm-Ballast,
leichter für Til selbst nachvollziehbar/wartbar.

## Hosting & Repo

- Live unter GitHub Pages: `https://t-i-l.github.io/eatme/` (Repo:
  `t-i-l/eatme`, Branch `main`, Ordner `/ (root)`).
- Content-Pflege durch den Kunden **direkt im GitHub-Web-Interface**
  (Datei anklicken → Stift-Icon → Wert ändern → Commit). Kein CMS, kein
  Admin-Panel — bewusste Entscheidung, siehe Verlauf dieses Projekts.
- **Wichtige Regel: Immer relative Pfade, nie mit führendem `/`.**
  Da dies eine GitHub-Pages-*Project-Page* ist (URL hat `/eatme/` als
  Unterordner, keine reine `username.github.io`-Hauptseite), zeigt ein
  Pfad mit führendem `/` von der Domain-Wurzel aus und würde am
  Unterordner vorbeizeigen → 404. Betraf ursprünglich die Font-Pfade in
  `tokens.css`, wurde gefixt. Gilt für alle künftigen Asset-Referenzen
  (Sektions-CSS, `background-and-motion.md` etc.) — siehe auch
  `tokens-notes.md`.

### Übergabe an den Kunden (später)

- **Repo-Ownership übertragen** (empfohlen für die finale Übergabe):
  Settings → ganz unten "Transfer ownership" → GitHub-Username des
  Kunden eingeben → Kunde bestätigt. Repo inkl. Historie und
  GitHub-Pages-Settings wandert komplett zu seinem Account.
  Alternative für eine Übergangsphase: Kunde als Collaborator einladen
  (Settings → Collaborators), Repo bleibt vorerst bei Til.
- Nach einer Übertragung ggf. **GitHub Pages einmal neu aktivieren**
  (Settings → Pages, Branch nochmal auswählen/speichern) — läuft meist
  automatisch weiter, kurz gegenchecken.
- Weil alle Pfade relativ sind (siehe oben), funktioniert die Seite
  automatisch unter jeder neuen URL/jedem Unterordner, ohne Anpassungen.
- **Custom Domain** (falls später gewünscht, z.B. `eatmemusic.com`):
  Domain-Registrierung/DNS läuft komplett getrennt vom GitHub-Repo, über
  den Domain-Anbieter des Kunden. GitHub-Pages-Hosting selbst bleibt
  kostenlos, nur die Domain-Registrierung kostet (Registrar-abhängig).

## Ordnerstruktur

```
/
├── index.html
├── tokens.css                  ← einzige Quelle für Farben & Fonts, siehe unten
├── tokens-notes.md             ← offene Punkte/Herkunft der Tokens
├── styles.css                  ← globales Grundgerüst + globale Konventionen (Hover, Fade-In)
├── script.js                   ← globale Logik + eine Sektion pro Kommentarblock
├── background-and-motion.md    ← Himmel-Hintergrund + Parallax/Animation-Logik (separat)
├── content.json                ← alle Texte, Bildpfade, Links
├── imprint.html                ← einfache statische Seite
├── datenschutz.html             ← einfache statische Seite
├── /sound                      xyz.mp3 — Hintergrund-Song, an/aus schaltbar
├── /assets
│   ├── /fonts                  Michroma-Regular.woff2, EBGaramond-Italic.woff2
│   ├── /images                 eatme-image-01/02/03.jpg, -footer.jpg, insta-avatar.png
│   ├── /logo                   eatme_logo.png
│   └── /visuals
│       ├── birds-black.webp
│       ├── birds-stage.html    ← fertiger Vogelschwarm-Animations-Prototyp,
│       │                         in section-01-stage eingebaut
│       ├── /birds-blue         bird-blue-sm.svg, bird-blue-lg.svg (section-02)
│       ├── /drops              01–04.png
│       ├── /scribble           scribble-sm.svg, scribble-lg.svg
│       └── /backgrounds        cloud-stage-background.jpg, clouds.png
├── /components                 wiederverwendbare Bausteine, siehe unten
└── /sections                   eine Datei pro Sektion, siehe unten
```

`.gitignore` schließt `.DS_Store` aus.

## Sektionsliste

Direkt aus Figma übernommen (Section-Namen im File), 7 Sektionen:

1. **section-01-stage** — Hero: Logo, Social-Links (Spotify/TikTok/Instagram/
   YouTube), Vogelschwarm-Animation (`birds-stage.html` / Frame
   `html-visual-voegel`). Hat einen **eigenen Stage-Hintergrund**, gehört
   zur Sektion selbst, **NICHT** der durchgehende, seitenweite
   Himmel-Hintergrund (der beginnt erst ab section-02).
2. **section-02-text-01** — Intro-Text ("EatMe – Independent Pop between
   momentum and nostalgia" + Beschreibungsabsätze) + zwei blaue
   Vogel-Grafiken (`bird-blue-sm`/`bird-blue-lg`). Der durchgehende,
   seitenweite **Himmel-Hintergrund beginnt hier** (aktuell noch
   Platzhalter-Weiß, siehe unten).
3. **section-03-images** — Bandfotos, Songzeile 1 (Lyrics-Komponente)
4. **section-04-text-02** — Fließtext über die Songthemen, Vogel-Übergang
   (schwarze Silhouetten)
5. **section-05-images-drops** — weiteres Bandfoto, Wassertropfen-Grafiken,
   Songzeile 2
6. **section-06-text-social** — Ankündigungstext (neues Album) + Instagram-Modul
7. **section-07-footer** — Songzeile, Booking-CTA, Kontakt, Footer-Links
   (Imprint, Datenschutz)

Jede Sektion bekommt einen eigenen Chat innerhalb dieses Projekts, um
Kontext-Bleed zu vermeiden.

## Zusätzliche Seiten (kein eigener Sektions-Chat nötig)

- `imprint.html` — einfache statische Seite, minimaler Aufwand
- `datenschutz.html` — einfache statische Seite, minimaler Aufwand

Beide nutzen dieselben Tokens (Fonts/Farben) wie die Hauptseite, aber ohne
Parallax/Animation — reine Textseiten.

## Komponenten (aus Figma bekannt)

Wiederverwendbare Bausteine, jeweils eigene Datei unter `/components`,
referenziert von den Sektionen, die sie brauchen:

- `eatme-navigation` — Nav mit Social-Links
- `eatme-lyrics` — Songzeilen-Block (nutzt `.text-lyrics` aus tokens.css)
- `icon-play` — Play-Icon für Songzeilen
- `eatme-button` — Button (nutzt `--gradient-buttons-footer`)
- `eatme-footer` — Footer-Leiste
- `instagram-module` — Insta-Post-Nachbildung (eigener Chat, siehe Verlauf)
- `tropfen` (4 Shape-Varianten) — Wassertropfen-Grafiken
- `sound-toggle` — **noch offen, eigener Chat geplant.** An/Aus-Button für
  einen Hintergrund-Song (`/sound/xyz.mp3`), sichtbar im Nav-Bereich
  (Label "Sound" im Referenz-Screenshot). Technisch: `<audio>`-Element +
  Play/Pause-Button, Autoplay-Policies der Browser beachten (kein
  automatischer Sound-Start ohne Nutzer-Interaktion möglich).

## Globale Interaktions-Conventions (in `styles.css`, gelten überall)

Zentral definiert statt pro Sektion neu geschrieben — jede neue Sektion
bekommt das automatisch:

- **Hover (alle interaktiven Elemente):** `opacity: 0.6` bei Hover auf
  `a`/`button`, `transition: opacity 0.2s ease`.
- **Scroll-Fade-In für Texte (`.fade-in-text`):** Klasse auf beliebige
  Text-Elemente setzen → startet unsichtbar + leicht geblurred (`filter:
  blur(10px)`), wird beim Reinscrollen scharf/sichtbar
  (`transition: opacity 2s ease, filter 0.6s ease`) und beim Rausscrollen
  (in beide Richtungen) wieder unsichtbar/unscharf. **Keine
  Positionsverschiebung** — bewusst nur opacity + filter, kein
  translateY. Erkennung läuft über einen einzigen globalen
  `IntersectionObserver` in `script.js` (`initFadeInText()`), der bei
  jeder Intersection-Änderung `is-visible` togglet (kein einmaliges
  `unobserve`, damit es beim Rausscrollen auch wieder ausblendet).
  Respektiert `prefers-reduced-motion`.
  **Für neue Sektionen:** Klasse `fade-in-text` auf die Text-Elemente
  setzen, danach einmal `initFadeInText(containerElement)` aufrufen
  (wichtig bei dynamisch aus `content.json` gerendertem Content — muss
  NACH dem Einfügen der Elemente ins DOM passieren). Stagger-Delay
  zwischen mehreren Elementen im selben Container passiert automatisch
  (80ms pro Element, `index`-basiert).

## Sektions-Status

- ✅ **section-01-stage** — fertig (Stage-Modul mit Cloud-Hintergrund +
  Vogelschwarm-Animation als zwei unabhängige Parallax-Ebenen, secondary-nav
  mit Mailto-Link + Sound-Toggle, responsive: fluide Breite bis max. 1280px,
  Stage-Höhe `85vh`, 768px-Breakpoint). Eigene CSS:
  `sections/section-01-stage.css`, Verhalten (Sound-Toggle, Parallax) in
  `script.js`.
- ✅ **section-02-text-01** — fertig (Intro-Text + zwei blaue Vögel,
  Details siehe eigener Abschnitt unten). Eigene CSS:
  `sections/section-02-text-01.css`, Content-Rendering + Vogel-Parallax +
  Fade-In-Registrierung in `script.js`.
- ⬜ section-03-images … section-07-footer — noch offen, siehe Sektionsliste
  oben.

### Details section-02-text-01 (für Anschluss-Kontext)

- Zwei-Spalten-Layout via **CSS Grid** (nicht Flexbox!), `grid-template-
  columns: 1fr 1fr`. Grund siehe "Gelernte Lektionen" unten.
- Vögel (`bird-blue-lg`/`bird-blue-sm`) sind absolut positioniert, Werte
  1:1 aus Figma übernommen, aber **manuell nachjustiert** auf Wunsch
  (große Vogel oben-links, kleine Vogel unten-rechts, beide dürfen leicht
  in die Textspalte überlappen — finale Werte stehen in der CSS-Datei).
- Vogel-Größe kommt aus `width: %` + `aspect-ratio` (intrinsische
  SVG-Maße: `bird-blue-lg` 203/205, `bird-blue-sm` 70/103) statt
  `width`+`height` in `%`, damit sie sich nie verziehen, egal wie hoch der
  Container durch den Text tatsächlich wird.
- Vögel: `pointer-events: none`, `user-select: none`,
  `-webkit-user-drag: none` (rein dekorativ, nicht draggable/klickbar).
- Mobile (≤768px): keine eigene Stack-Reihenfolge, sondern Vögel-Container
  und Textspalte liegen in **derselben Grid-Zelle übereinander**
  (`grid-column/row: 1`), Text mit `z-index: 1` über den Vögeln
  (`z-index: 0`) für Lesbarkeit. Vertikales Padding bleibt bei `100px`
  wie Desktop (nur horizontal auf `16px` reduziert).
- Subtiler Scroll-Parallax auf beide Vögel (`script.js`,
  `section02ParallaxLoop`): große/vordere Vogel Faktor `0.06`, kleine/
  hintere Vogel `0.025` — gleiches rAF-Muster wie section-01, kein
  Scroll-Event-Listener.
- Text nutzt `.fade-in-text` (siehe globale Konvention oben) mit Stagger.

## Gelernte Lektionen (für alle künftigen Sektionen relevant)

- **Sektions-CSS gehört zwingend nach `/sections`**, exakt unter dem Pfad,
  den `index.html` per `<link>` referenziert — eine Datei am falschen Ort
  (z.B. im Root) lädt nicht (404), ohne dass es einen Fehler im Code selbst
  gibt. Vor dem Testen kurz gegenchecken, dass Pfad in `index.html` und
  tatsächlicher Datei-Ort im Repo übereinstimmen.
- **Nie führendes `/` bei Asset-Pfaden** (Fonts, Bilder, etc.) — siehe
  Hosting-Hinweis oben, betrifft aber auch jede neue Sektion.
- **Links (`<a>`) brauchen expliziten Reset.** Eine Utility-Klasse wie
  `.text-copy-s` allein reicht nicht — ohne `color`/`text-decoration` in der
  Klasse selbst oder global (siehe `a { color: inherit; text-decoration: none; }`
  in `styles.css`) fällt der Browser auf Standard-Blau/Unterstrichen zurück.
- **Jeder per Parallax/Transform bewegte Layer braucht einen Überhang**
  (größer als sein Rahmen), sonst wird bei jedem Versatz — auch minimal beim
  initialen Laden, wenn `rect.top` nicht exakt 0 ist — der Rahmen-Hintergrund
  sichtbar. Faustregel: nur die Höhe vergrößern (nicht die Breite), damit bei
  Ebenen mit eigener "Cover"-Skalierung (wie `birds-stage.html`) der Zoom auf
  breiten Viewports unverändert bleibt (Breite bleibt der bestimmende Faktor).
- **Prozentuale `top`/`bottom` bei absolut positionierten Kindern brauchen
  eine "definite height" beim Elternelement.** Bei Flexbox reicht
  `align-self: stretch` dafür browserübergreifend NICHT zuverlässig aus —
  die gestreckte Höhe zählt in mehreren Browsern nicht als "definite" für
  die Prozent-Auflösung der Kinder, `top: X%` fällt dann auf 0 zurück
  (alle absolut positionierten Kinder landen oben, unabhängig vom
  eingetragenen Wert). **CSS Grid ist hier robuster** — Grid-Items, die
  sich strecken, liefern eine zuverlässig definite Höhe für ihre Kinder.
  Faustregel: sobald eine Sektion gleich hohe Spalten braucht UND eine
  Spalte davon %-positionierte absolute Kinder enthält (Deko-Grafiken
  o.ä.), Grid statt Flexbox für die Spalten-Reihe verwenden.
- **Bei Flex/Grid-Layouts, die zwischen Row (Desktop) und Column (Mobile)
  wechseln:** Flex-Shorthands wie `flex: 1 0 0` (flex-basis: 0) wirken
  auch entlang der neuen Hauptachse weiter, wenn man nur
  `flex-direction` umschaltet, und kollidieren dann mit expliziten
  Höhen/Breiten im Mobile-Query → im Zweifel im Mobile-Query explizit
  `flex: none` setzen (falls noch mit Flexbox statt Grid gearbeitet wird).
- **Vor Design-Änderungen an bereits abgenommenen Sektionen:** Bei
  section-02 gab es einen Rücksetzer, weil eine gut abgenommene
  Position (1:1 aus Figma) versehentlich durch eine "Verbesserung"
  ersetzt wurde. Faustregel: bei Unsicherheit erst nachfragen, ob sich
  die Änderung auf Desktop, Mobile oder beides beziehen soll, bevor die
  Basis-Werte (nicht nur die Mobile-Overrides) angefasst werden.
- **Live-Vorschau-Sandbox blockiert externe Requests** (z.B.
  `raw.githubusercontent.com` für Fonts/SVGs) — führt zu fehlenden
  Schriften und winzigen/kaputten Bildern, die leicht als "Vögel zu
  klein"/"Schrift lädt nicht" fehlinterpretiert werden. Fix: Assets für
  die Vorschau als Base64 direkt in die HTML einbetten (Font als
  `data:font/woff2;base64,...`, SVGs als `data:image/svg+xml;base64,...`).
  Betrifft nur die Vorschau-Datei, nicht die Produktionsversion (die nutzt
  die echten relativen Repo-Pfade).

## Design-Tokens

Siehe `tokens.css` + `tokens-notes.md`. Kurzfassung der Regel: **keine neuen
Hex-Codes, Font-Größen oder Farben in einzelnen Sektionen einführen** — immer
aus `tokens.css` referenzieren. Falls ein Wert fehlt, dort ergänzen, nicht
lokal hart codieren.

Fonts (Michroma, EB Garamond) sind **selbst gehostet** (`.woff2` in
`/assets/fonts`), nicht über Google Fonts CDN eingebunden — DSGVO-Grund
(IP-Übertragung an Google beim CDN-Einbinden gilt in Deutschland als
rechtlich riskant).

## Hintergrund & Motion

Zwei getrennte Hintergrund-Systeme, nicht verwechseln:

1. **Stage-Hintergrund** (section-01 only) — eigenes Bild/Asset, gehört
   zur Sektion selbst, kein Bezug zu `background-and-motion.md`.
2. **Durchgehender, seitenweiter Himmel-Hintergrund** — startet ab
   section-02 (jetzt fertig), zieht sich über alle weiteren Sektionen.
   Wird **separat** in `background-and-motion.md` behandelt (Verlauf,
   Textur, Parallax-/Animationsverhalten). **Noch offen** — aktuell nutzt
   `styles.css` weiterhin einfaches Weiß (`--color-white`) als
   Platzhalter über die ganze Seite, bis diese Logik kommt.

**Bewusste Reihenfolge:** Erst alle 7 Sektionen strukturell bauen (Layout,
Content, Responsive), das durchgehende Hintergrund-System zuletzt. Til
möchte die Struktur sichtbar haben, bevor der seitenweite Hintergrund
reinkommt.

## Content-Struktur

Alle Texte, Bildpfade und Links liegen in `content.json`, getrennt vom
HTML/Code. Struktur wird sektionsweise erweitert, sobald die jeweilige
Sektion gebaut wird. Grundprinzip: fixe Layout-Slots (Positionen/Rotation
bleiben Code, nicht editierbar), aber Text/Bild/Link-Inhalt editierbar.

## Arbeitsweise / Workflow

- Ein Chat pro Sektion (in diesem Projekt), um Kontext klein zu halten
- Jeder Sektions-Chat referenziert: `tokens.css`, `content.json`,
  `styles.css` (globale Konventionen!), `background-and-motion.md`,
  ggf. betroffene `/components`-Dateien
- Screenshot-Vergleich als Feedback-Loop: bauen → Screenshot → neben
  Referenzbild legen → Abweichungen benennen (konkrete Werte statt
  "sieht komisch aus")
- **Responsive wird von Anfang an mitgedacht, nicht nachträglich
  ergänzt.** Beim Bauen einer neuen Sektion wird direkt mit fluiden
  Einheiten gearbeitet (`%`, `vh`, `max-width` statt fixer `px`-Breiten/
  -Höhen wo sinnvoll) und der 768px-Breakpoint (siehe `tokens-notes.md`)
  gleich mit angelegt — nicht erst nach dem Desktop-Layout als separater
  Schritt nachgereicht.
- Mobile-Anpassungen werden im jeweiligen Sektions-Chat mitentschieden,
  kein separater Mobile-Chat
- Neue globale Konventionen (Hover, Fade-In, künftige) gehören nach
  `styles.css`, nicht in einzelne Sektions-Dateien — siehe Abschnitt
  "Globale Interaktions-Conventions" oben.

## Live-Vorschau während des Bauens einer Sektion

Damit Til jede Sektion sofort im Chat sieht — ganz ohne GitHub-Upload —
gilt für jeden Sektions-Chat:

- Claude zeigt die Sektion als **eigenständige HTML-Datei zum Download**
  (nicht als Artifact im Chat direkt, da externe Requests dort blockiert
  werden können — siehe "Gelernte Lektionen"), direkt im Browser testbar,
  mit sofortigem Feedback-Loop (Til sieht Ergebnis → gibt Feedback →
  Claude passt an).
- Damit die Vorschau ohne Server/Build-Step läuft, wird sie als
  **eigenständige, einzelne HTML-Datei** gebaut: Content wird direkt
  eingebettet statt per `fetch("content.json")` geladen (das würde in der
  Vorschau-Umgebung nicht zuverlässig funktionieren — echte `fetch`-Aufrufe
  auf lokale Dateien brauchen einen Server oder GitHub Pages).
- Bilder/Fonts: werden **Base64-codiert direkt in die Vorschau-Datei
  eingebettet** (nicht als externe URL, auch nicht `raw.githubusercontent.com`
  — das kann in der Vorschau-Sandbox blockiert sein, siehe "Gelernte
  Lektionen"). Falls Til die Asset-Dateien noch nicht im Repo hat, lädt er
  sie einzeln hoch (kein ZIP — ZIPs werden im Chat/Projekt-Kontext nicht
  zuverlässig gelesen); liegen sie schon im Repo, kann Claude sie selbst
  von dort holen und Base64-einbetten.
- Für die **finale Produktionsdatei** (die später ins Repo kommt) nutzt
  Claude stattdessen die reguläre Multi-Datei-Struktur: separate
  `content.json` (per `fetch` geladen) und reguläre relative Asset-Pfade
  (`assets/images/eatme-image-01.jpg` etc., ohne führenden `/`).
- Unterschied zwischen Vorschau- und Produktionsversion betrifft nur diese
  technischen Lade-Mechanismen (Content/Bilder/Fonts), nicht Layout/Design.
- GitHub wird erst für zwei Dinge gebraucht: (1) das finale Live-Hosting
  der Seite, (2) die spätere Content-Pflege durch den Kunden direkt im
  GitHub-Web-Interface. Fürs Iterieren beim Bauen ist kein Upload nötig.
- **Updates ans Repo passieren komplett über das GitHub-Web-Interface**
  (Datei anklicken → Stift-Icon → Inhalt ersetzen → Commit), kein
  Terminal/Git nötig. Claude liefert die kompletten, fertigen Dateien zum
  1:1-Ersetzen (nicht nur Diffs), wenn eine Sektion abgeschlossen ist.
