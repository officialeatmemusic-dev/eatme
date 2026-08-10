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
  `tokens.css`, wurde gefixt. Gilt für alle Asset-Referenzen (Sektions-CSS,
  `styles.css` etc.) — siehe auch `tokens-notes.md`.

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
├── styles.css                  ← globales Grundgerüst + globale Konventionen (Hover, Fade-In, Bild-Drag)
├── script.js                   ← globale Logik + eine Sektion pro Kommentarblock
├── content.json                ← alle Texte, Bildpfade, Links
├── imprint.html                ← einfache statische Seite (Imprint +
│                                  Datenschutz zusammen, siehe unten)
├── /sound                      xyz.mp3 — Hintergrund-Song, an/aus schaltbar
├── /assets
│   ├── /fonts                  Michroma-Regular.woff2, EBGaramond-Italic.woff2
│   ├── /images                 eatme-image-01/02.jpg, eatme-image-04.webp
│   │                           (ersetzt eatme-image-03.jpg, siehe section-05
│   │                           unten), -footer.jpg, insta-avatar.png
│   │   └── /insta              Bilder + Videos fürs Instagram-Modul
│   │                           (section-06) -- wird zur Laufzeit per
│   │                           GitHub Contents API ausgelesen, NICHT über
│   │                           content.json gepflegt. Einfach Dateien
│   │                           hochladen/löschen, kein Code-/JSON-Edit
│   │                           nötig. Bild vs. Video über Dateiendung
│   │                           erkannt (.jpg/.jpeg/.png/.webp/.gif vs.
│   │                           .mp4/.webm/.mov), siehe Details section-06.
│   ├── /logo                   eatme_logo.png
│   └── /visuals
│       ├── birds-black.webp
│       ├── birds-stage.html    ← fertiger Vogelschwarm-Animations-Prototyp,
│       │                         in section-01-stage eingebaut
│       ├── /birds-blue         bird-blue-sm.svg, bird-blue-lg.svg (section-02)
│       ├── /drops              01–04.png
│       ├── /scribble           scribble-sm.svg, scribble-lg.svg
│       └── /backgrounds        cloud-stage-background.jpg, clouds.webp
│                                (ersetzt cloud.png/clouds.png aus früheren
│                                Chat-Ständen; verkleinert auf
│                                1200×2794px/~260KB, siehe "Hintergrund &
│                                Motion" unten)
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
7. **section-07-footer** — Songzeile (Lyrics-Komponente), zwei Scribble-
   Grafiken (sm/lg), Booking-CTA (Mailto), Footer-Links (Imprint,
   Datenschutz). Fertig, Details siehe eigener Abschnitt unten. Ein
   Hintergrundbild (Duoton-Bandfoto) ist für diese Sektion vorgesehen,
   kommt aber in einem eigenen, späteren Chat dazu — siehe Sektions-Status
   unten.

Jede Sektion bekommt einen eigenen Chat innerhalb dieses Projekts, um
Kontext-Bleed zu vermeiden.

## Zusätzliche Seiten (kein eigener Sektions-Chat nötig)

- `imprint.html` — einfache statische Seite, minimaler Aufwand.
  **Update:** enthält Imprint- UND Datenschutz-Inhalt zusammen — Til hat
  entschieden, sich die zweite Seite (`datenschutz.html`, ursprünglich
  separat geplant) zu sparen. Der Footer-Link ("Imprint and data" in der
  `eatme-footer`-Pill) zeigt entsprechend nur noch auf diese eine Seite.

Nutzt dieselben Tokens (Fonts/Farben) wie die Hauptseite, aber ohne
Parallax/Animation — reine Textseite.

## Komponenten (aus Figma bekannt)

Wiederverwendbare Bausteine, jeweils eigene Datei unter `/components`,
referenziert von den Sektionen, die sie brauchen:

- `eatme-navigation` — Nav mit Social-Links
- `eatme-lyrics` — ✅ **implementiert** (`components/eatme-lyrics.css`,
  Rendering über `renderLyricsModule()` in `script.js`). Songzeilen-Block
  (nutzt `.text-lyrics` aus tokens.css), komplett klickbar, Link-Ziel kommt
  aus `content.json` (`lyrics.song_link`). In section-03-images,
  section-05-images-drops und section-07-footer verbaut (alle drei fertig).
- `icon-play` — Play-Icon für Songzeilen. Aktuell als Inline-SVG direkt im
  Markup jeder Sektion (kein separates Asset), siehe Details
  section-03-images unten.
- `eatme-button` — Button (nutzt `--gradient-buttons-footer`)
- `eatme-footer` — ✅ **implementiert** (`components/eatme-footer.css`).
  Pill-Bar (Figma-Node 1:3461), nutzt `--gradient-buttons-footer` +
  denselben Inset-Shadow wie `.eatme-button`. Zwei Links: Mailto links,
  Link zur zusammengelegten Imprint/Datenschutz-Seite rechts — beide
  bewusst "Hug" (nicht `flex:1 0 0`), Abstand kommt über
  `justify-content:space-between` auf der Pill, damit nur der sichtbare
  Text klickbar/hover-fähig ist (ursprünglich war der Mailto-Link
  fill-width, in Figma korrigiert). Content-Rendering über
  `renderFooterBar()` in `script.js`. Sitzt in `section-07-footer`
  **nicht mehr** in einem eigenen Padding-Wrapper, sondern direkt absolut
  positioniert (`left/right/bottom:12px`) relativ zur gesamten Sektion,
  siehe Details section-07-footer unten.
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

- **Hover (Buttons):** `opacity: 0.6` bei Hover, `transition: opacity 0.2s
  ease` — unverändert seit section-01 (Sound-Toggle).
- **Hover (Links, `<a>`):** eigene, seit der Nav-Komponente überarbeitete
  Convention — zusätzlich zur Opacity (0.6) auch `filter: blur(4px)`,
  beides über `transition: opacity 0.6s ease, filter 0.6s ease`. Dazu
  zwingend `display: inline-block` (sonst schneidet der Browser den Blur
  am inline-Textrahmen ab) sowie ein Padding/negatives-Margin-Paar als
  Safari-Fix (Safari bemisst die Filter-Fläche sonst zu knapp -> harte
  Kante statt weichem Verlauf). Alles zentral in `styles.css`, siehe
  Kommentar dort für die genaue Begründung. **Faustregel für neue
  Sektionen:** horizontales Padding + negatives Margin zusammen sollten
  unter der Hälfte des tatsächlichen Link-Gaps bleiben, sonst überlappen
  sich die Klickflächen benachbarter Links (getestete Standardgröße: 6px
  pro Seite bei 16px Gap).
- **Kein Bild-Drag (`img`):** jedes `<img>` auf der Seite bekommt
  `-webkit-user-drag: none` + `user-select: none` global in `styles.css`
  — Bandfotos lassen sich dadurch genauso wenig aus dem Browser ziehen
  wie die dekorativen Grafiken (Vögel, Tropfen), die das vorher schon
  einzeln gesetzt hatten. Verhindert nur das Draggen, nicht "Bild
  speichern unter" per Rechtsklick — das lässt sich browserseitig nicht
  zuverlässig blocken.
- **Scroll-Fade-In für Texte (`.fade-in-text`):** Klasse auf beliebige
  Text-Elemente setzen → startet unsichtbar + leicht geblurred (`filter:
  blur(10px)`), wird beim Reinscrollen scharf/sichtbar
  (`transition: opacity 2s ease, filter 0.6s ease`). **Keine
  Positionsverschiebung** — bewusst nur opacity + filter, kein
  translateY. Erkennung läuft über einen einzigen globalen
  `IntersectionObserver` in `script.js` (`initFadeInText()`). Respektiert
  `prefers-reduced-motion`.
  **Update (Richtungsabhängig, ersetzt die frühere beidseitige Version):**
  Einblenden nur beim Runterscrollen, Ausblenden nur beim Hochscrollen.
  Konkret: Runterscrollen + Element kommt in den Viewport → einblenden;
  Runterscrollen + Element verlässt den Viewport oben → nichts tun (bleibt
  sichtbar); Hochscrollen + Element verlässt den Viewport → ausblenden;
  Hochscrollen + Element kommt von oben in den Viewport → nichts tun (kein
  erneutes Einblenden beim Zurückscrollen). Scroll-Richtung wird über
  `window.scrollY`-Vergleich zwischen zwei Observer-Callbacks bestimmt
  (kein Layout-Read, unproblematisch im Callback).
  **Für neue Sektionen:** Klasse `fade-in-text` auf die Text-Elemente
  setzen, danach einmal `initFadeInText(containerElement)` aufrufen
  (wichtig bei dynamisch aus `content.json` gerendertem Content — muss
  NACH dem Einfügen der Elemente ins DOM passieren). Stagger-Delay
  zwischen mehreren Elementen im selben Container passiert automatisch
  (80ms pro Element, `index`-basiert).

## Sektions-Status

- ✅ **eatme-navigation** (Komponente, kein eigener Sektions-Slot) — fixe
  Top-Nav (Logo + Social-Links), liegt als Overlay über section-01-stage
  (`position: fixed`, kein eigener Platz im Dokumentfluss). Logo skaliert
  fluid via `clamp(330px, 80vw, 743px)`. Eigene CSS:
  `components/eatme-navigation.css`, Content-Rendering (Logo-Pfad,
  Social-Links aus `content.json`) in `script.js` (`renderNav()`).
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
- ✅ **section-03-images** — fertig (Bandfoto links oben-links, Songtext-
  Modul + zweites Bandfoto rechts oben-zentriert, Details siehe eigener
  Abschnitt unten). Eigene CSS: `sections/section-03-images.css` (reine
  Positionierung), Songtext-Modul selbst ausgelagert nach
  `components/eatme-lyrics.css`. Content-Rendering (Bilder + Songzeilen +
  Link-Ziel aus `content.json`) über die gemeinsame Funktion
  `renderLyricsModule()`, Fade-In-Registrierung und Bild-Parallax in
  `script.js`.
- ✅ **section-04-text-02** — fertig (reiner Fließtext, einspaltig,
  linksbündig, Height Hug, Details siehe eigener Abschnitt unten). Eigene
  CSS: `sections/section-04-text-02.css`, Content-Rendering +
  Fade-In-Registrierung in `script.js` (`renderSection04()`).
- ✅ **section-05-images-drops** — fertig (Bandfoto links oben-links,
  Songtext-Modul rechts zentriert, zusätzlich 19 frei positionierte
  Wassertropfen mit größenabhängigem Parallax, Details siehe eigener
  Abschnitt unten). **Update:** Bandfoto ist jetzt `eatme-image-04.webp`
  im Querformat (ersetzt das ursprüngliche Hochformat-Foto
  `eatme-image-03.jpg`), Tropfen-Positionen entsprechend an den
  aktualisierten Figma-Referenzrahmen (1280×657 statt 1280×688)
  angepasst. Eigene CSS: `sections/section-05-images-drops.css`.
  Content-Rendering (Bild + Songzeilen aus `content.json`) über
  `renderSection05()` + die gemeinsame `renderLyricsModule()`,
  Tropfen-Parallax in `initDropsParallax()`, beides in `script.js`.
- ✅ **section-06-text-social** — fertig (zwei gleich breite Spalten:
  Ankündigungstext links, Instagram-Modul rechts, Details siehe eigener
  Abschnitt unten). Eigene CSS: `sections/section-06-text-social.css`,
  Content-Rendering in `script.js` (`renderSection06Text()`). Das
  Instagram-Modul selbst (Komponente `components/instagram-module.css` +
  `initInstagramModule()`/`setupInstagramInteraction()` in `script.js`)
  wurde im Zuge dessen um Background-Blur, dynamisches Laden aus
  `assets/images/insta/` und Mobile-Reset erweitert.
- ✅ **section-07-footer** — fertig (Songzeile links oben, scribble-sm
  links unten, scribble-lg rechts, mittig absolut zentrierter
  Booking-CTA, Details siehe eigener Abschnitt unten). Eigene CSS:
  `sections/section-07-footer.css`, Content-Rendering (Lyrics + CTA-Text)
  in `script.js` (`renderSection07()` + `renderFooterCta()`).
  **Offen (eigener, späterer Chat):** Hintergrundbild (Duoton-Bandfoto).
  `content.json` → `section-07-footer.background_image` ist bereits
  befüllt, aber aktuell **ungenutzt** — bewusst noch nicht ins Layout
  eingebaut, kein zusätzliches Feld in `content.json` nötig, wenn es so
  weit ist.

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
  `-webkit-user-drag: none` (rein dekorativ, nicht draggable/klickbar;
  seit dem globalen `img`-Drag-Reset in `styles.css` technisch redundant,
  bleibt aber unschädlich stehen).
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

### Details section-03-images (für Anschluss-Kontext)

- Zwei-Spalten-Layout via **Flexbox** (nicht Grid wie section-02), da hier
  keine %-positionierten absoluten Kinder vorkommen -- Flexbox reicht.
  Linke Spalte: Bandfoto 1 (216x288, fix), rechte Spalte: Songtext-Modul +
  200px Gap + Bandfoto 2 (500x375, fluid gedeckelt).
- **Songtext-Modul (`eatme-lyrics-link`) ist als eigene Komponente
  ausgelagert** (`components/eatme-lyrics.css` + `renderLyricsModule()` in
  `script.js`), weil es laut `content.json` in section-03, section-05 und
  section-07 vorkommt -- Styling/Rendering also nur einmal geschrieben,
  nicht dreimal. `sections/section-03-images.css` enthält dadurch nur noch
  die Positionierung (Spalten, Gaps, Bildgrößen), nicht mehr das Modul
  selbst.
- Modul ist bewusst `width: fit-content` (Hug) statt fix/prozentual --
  damit es immer genau so breit ist wie seine längste Zeile. Zeilen
  bekommen `white-space: nowrap` (kein Umbruch). Intern sind Zeilen +
  Songtitel-Zeile **linksbündig zueinander** (`align-items: flex-start` im
  Modul selbst) -- nur die Box als Ganzes zentriert sich dank
  `align-items: center` auf der übergeordneten Spalte im Column. Wichtige
  Lektion aus dem Bau: erst `align-items: center` + `text-align: center`
  auch INNERHALB des Moduls gesetzt, wodurch der Songtitel bei ungleich
  langen Zeilen sichtbar relativ zu den Songzeilen verschoben wirkte --
  korrigiert auf linksbündig innen / zentriert außen.
- Das **komplette Modul (Zeilen + icon-play + Songtitel) ist EIN `<a>`**,
  klickbar, mit der globalen Hover-Convention aus `styles.css` als Basis,
  aber **verstärktem Blur (14px statt der globalen 4px)** speziell für
  dieses Modul. `href` kommt zur Laufzeit aus `content.json`
  (`lyrics.song_link`) -- fällt auf `#` zurück, falls das Feld leer bleibt.
  Songzeilen und `song_title` sind für section-03/05/07 mittlerweile die
  finalen Texte ("Trustfalling"/"Drizzle"/"Drown"); nur `song_link` ist in
  allen drei Sektionen weiterhin leer/TODO (Streaming-Link folgt später).
- **Anzahl der Songzeilen ist bewusst flexibel, kein Fixwert.**
  `renderLyricsModule()` iteriert einfach über das `lines`-Array aus
  `content.json` -- egal ob 4 oder 5 (oder mehr) Zeilen, jede wird als
  eigener `<p>` mit `.fade-in-text` gerendert und staggert automatisch mit
  ein. Das Modul selbst ist `width: fit-content` (siehe oben), wächst also
  in der Breite mit der längsten Zeile, nicht in eine feste Zeilenzahl
  hinein -- Til kann die Zeilenzahl pro Song in `content.json` frei
  anpassen, ohne dass CSS oder JS angefasst werden müssen.
- **`icon-play` ist als Inline-SVG direkt im Markup** (kein separates
  Asset) -- Nachbau des Figma-Icons (Play-Dreieck, `currentColor`), da der
  Original-Export aus Figma technisch nicht abrufbar war. Falls das
  Original-SVG aus Figma vorliegt, 1:1 austauschbar (nur der `<path>` im
  `icon-play`-SVG in `index.html`).
- Bandfoto 2 (`eatme-image-02`) nutzt **`width: 100%` + `max-width: 500px`
  + `aspect-ratio: 500/375`** statt der fixen 500x375px aus Figma, da die
  Spalte zwischen 1280px und 768px irgendwann schmaler als 500px wird
  (reiner Fixwert würde überlaufen) -- gleiches Prinzip wie bei den blauen
  Vögeln in section-02 (width in % + aspect-ratio statt width+height).
  Bandfoto 1 (216x288) bleibt bewusst fix, da es auch bei 768px noch
  komfortabel in seine Spalte passt.
- **Fade-In zeilenweise + Songtitel:** jede Songzeile bekommt einzeln
  `.fade-in-text` (nicht eine gemeinsame Wrapper-Div), zusätzlich auch die
  Songtitel-Zeile (`.song-link`) -- `initFadeInText()` staggert sie
  automatisch nacheinander ein (80ms pro Element, index-basiert), Zeilen
  zuerst, Songtitel als letztes Element.
- **Subtiler Scroll-Parallax auf beiden Bandfotos**, bewusst mit
  UNTERSCHIEDLICHEN Faktoren (Bandfoto 1: `0.05`, Bandfoto 2: `0.09`) --
  kein identisches Bewegungsmuster, gleiches rAF-Muster wie
  section-01/section-02 (kein Scroll-Event-Listener).
- Mobile (≤768px): rechte Spalte rutscht unter die linke, 100px Gap
  zwischen den Spalten (statt 12px auf Desktop), interner Gap der rechten
  Spalte 100px statt 200px. Alignment pro Spalte bleibt unverändert (links
  weiterhin oben-links, rechts weiterhin oben-zentriert bzw. modulintern
  linksbündig).

### Details section-04-text-02 (für Anschluss-Kontext)

- Einspaltiges Layout, kein Grid/Flex-Row nötig (kein zweites Element wie
  Bilder oder Vögel in dieser Sektion) — `#section-04-text-02` ist ein
  einzelner Flex-Container mit `justify-content: center; align-items: center`
  (1:1 aus Figma-Node 1:3441), `.text-container` darin mit
  `align-items: flex-start` für die Linksbündigkeit.
- Textstil identisch zu section-02 (`.text-copy-l`, Michroma 14px,
  line-height 1.8, letter-spacing 0) — kein neuer Font-Wert, `max-width:
  320px` wie bei section-02 übernommen.
- **Bewusst Height Hug:** keine feste Höhe gesetzt, die Sektion wächst mit
  ihrem Textinhalt — nur vertikales Padding (`100px`, wie die anderen
  Text-Sektionen) sorgt für Abstand nach oben/unten.
- Content-Rendering (`renderSection04()` in `script.js`) ist bewusst
  simpler als `renderSection02()`: nur `paragraphs`-Array aus
  `content.json`, keine zusätzliche Headline.
- Kein Parallax in dieser Sektion (keine Bilder/Grafiken vorhanden) — nur
  `.fade-in-text` auf beide Absätze, gleiches globales Stagger-Verhalten
  wie überall sonst.
- Mobile (≤768px): keine Layout-Umstellung nötig (schon einspaltig), nur
  horizontales Padding auf `16px` reduziert — identisch zum Muster bei
  section-02/section-03.
- **Vogel-Silhouetten-Übergang laut Sektionsliste bewusst NICHT
  enthalten** — Til hat entschieden, das Vögel-Thema für alle Sektionen
  ganz zum Schluss des Projekts zu bündeln, nachdem die Struktur aller 7
  Sektionen steht. Wird in einem eigenen späteren Schritt nachgezogen
  (eigener Figma-Node/eigene Klärung nötig, war nicht Teil von Node 1:3441).

### Details section-05-images-drops (für Anschluss-Kontext)

- Zwei-Spalten-Layout via **Flexbox**, strukturell identisch zu
  section-03 (Bandfoto links oben-links via `image-container`
  `h-full`/`items:flex-start`, Songtext-Modul rechts über die gemeinsame
  Komponente `components/eatme-lyrics.css` + `renderLyricsModule()`).
  Einziger struktureller Unterschied zu section-03: hier gibt es kein
  zweites Bild rechts, das Lyrics-Modul steht allein in seiner Spalte und
  wird beidachsig zentriert (`justify-content:center` zusätzlich zu
  `align-items:center` auf `.col-text-image`).
- **Bandfoto-Update: `eatme-image-04.webp` (Querformat) ersetzt
  `eatme-image-03.jpg` (Hochformat).** Design-Maß aus Figma jetzt 387×257
  statt vorher 216×288 -- Seitenverhältnis 774/514 entspricht exakt der
  neuen Asset-Datei (774×514px). Umgesetzt als `width: 100%; max-width:
  387px; aspect-ratio: 774/514` statt fixer px (gleiches Prinzip wie
  Bandfoto 2 in section-03), damit es zwischen 1280px und 768px fluid
  mitskaliert statt zu überlaufen. Klassenname entsprechend von
  `.eatme-image-03` auf `.eatme-image-04` umbenannt (CSS + `index.html`).
- `padding-bottom: 200px` auf `.image-container` bleibt unverändert
  korrekt: Bild (257px Design-Höhe) + 200px Padding ergibt weiterhin exakt
  die 457px Spaltenhöhe aus Figma, kein Nachjustieren nötig.
- **Tropfen-Layer (Eigenart dieser Sektion):** 19 Instanzen, in Figma
  **nicht** im Autolayout, sondern frei/absolut auf der Sektion platziert
  (Node 1:3415). **Referenzrahmen hat sich mit dem Bildwechsel verschoben:
  aktuell 1280×657 (vorher 1280×688)** -- alle `top`-%-Werte in
  `index.html` wurden anhand der aktuellen Figma-Metadaten neu berechnet.
  Die `left`-%-Werte blieben für 18 von 19 Tropfen unverändert (Rahmen-
  breite 1280 ist gleich geblieben); **ein 40px-Tropfen ist laut Figma
  zusätzlich deutlich weiter nach links gerückt (`left: 5.313%` statt
  vorher `17.226%`)**. 4 Formen (`assets/visuals/drops/01–04.png`) × 2
  Größen (24px/40px). Tropfen-Größe bewusst **nicht fluid** (bleibt fix
  24px/40px, anders als z.B. die blauen Vögel in section-02). Rein
  dekorativ, **nicht** `content.json`-gesteuert -- Positionen/Assets fest
  im Markup, gleiches Prinzip wie die blauen Vögel in section-02.
- **Tropfen-Parallax nach Größe** (`initDropsParallax()` in `script.js`):
  40px-Tropfen bekommen einen stärkeren Faktor (`0.09`) als 24px-Tropfen
  (`0.035`) — größere wirken dadurch näher/schneller, kleinere weiter
  weg/dezenter, simple Tiefenwirkung. Gleiches rAF-Muster wie alle
  übrigen Parallax-Effekte (kein Scroll-Event-Listener). Faktor kommt aus
  `data-size` auf jedem `.tropfen`-Element. Von der Positions-Aktualisierung
  unberührt, da rein größenbasiert.
- **Zwei getrennte Tropfen-Sätze für Desktop/Mobile**, keine reine
  Ausblendung auf Mobile: `.tropfen--desktop` (die 19 %-positionierten)
  werden ab 768px per CSS ausgeblendet, dafür erscheint `.tropfen--mobile`
  (9 Stück, siehe unten). Grund: die %-Positionen der Desktop-Tropfen
  beziehen sich auf das Zwei-Spalten-Layout und ergeben im gestapelten
  Zustand keinen Sinn mehr.
- **Mobile-Tropfen sind in px verankert, nicht in %** — anders als die
  Desktop-Tropfen. Begründung: Bild + Bild-Padding-Bottom (auf Mobile
  reduziert auf 48px) + Spalten-Gap (100px) ergeben auf Mobile eine feste,
  von der Songtext-Länge unabhängige Höhe -- px-Werte bleiben daher
  stabil, unabhängig davon, wie lang der Songtext in der Spalte darunter
  wird. Vom Bildwechsel unberührt (Mobile-Layout stapelt ohnehin, das
  Querformat-Bild schrumpft dort automatisch mit der Spaltenbreite mit).
  Verteilt auf zwei Zonen: ~4 Tropfen oben rechts neben dem Bild (das oben
  links sitzt, ca. y 100–380px), ~5 Tropfen im Gap zwischen Bild und
  Lyrics-Modul (ca. y 400–560px), über die Breite verteilt.
- Mobile (≤768px) sonst identisch zu section-03: rechte Spalte rutscht
  unter die linke, 100px Gap zwischen den Spalten (statt 12px Desktop),
  Bild-Bottom-Padding von 200px auf 48px reduziert.
- Songzeilen + `song_title` (`content.json` →
  `section-05-images-drops.lyrics`) sind die finalen Texte für "Drizzle"
  (4 Zeilen) — nur `song_link` ist weiterhin leer/TODO. Siehe auch die
  Notiz zur flexiblen Zeilenanzahl bei section-03 oben: gilt identisch
  für alle drei Lyrics-Module.

### Details section-06-text-social (für Anschluss-Kontext)

- **Bugfix-Runde (siehe Chat):** `.insta-content-scroll` fehlte ein
  eigenes `margin: 0` -- dadurch griff die globale `a`-Konvention
  (`margin: -10px -6px`) durch und hat das Element unter den Header
  geschoben (wirkte wie "Avatar überlappt den Header") sowie Bilder
  links über den Modul-Rand hinaus verschoben. Zusätzlich fehlte ein
  `:hover`-Override für `.insta-header-link`/`.insta-content-scroll`,
  wodurch der globale Link-Hover (Blur+Opacity) sichtbar wurde, obwohl
  beide Flächen bewusst ohne Hover-Effekt sein sollten. Beides jetzt
  gefixt, siehe Kommentare in `components/instagram-module.css` und die
  neue Lektion oben ("`<a>`-Elemente als Fläche/Block").
- **Padding-Restrukturierung (Figma-Update, Node 1:3600):** Til hat in
  Figma die Innenabstände von der äußeren Ebene (`.insta-header`, hatte
  vorher `padding:4px; gap:4px`) in die interaktiven Kind-Ebenen
  verschoben: `.insta-top-bar` hat jetzt `padding: 4px 4px 0` (kein
  padding-bottom), `.insta-header-link` hat `padding: 4px 8px`.
  `.insta-header` selbst hat gar kein padding/gap mehr. Ziel: kein
  "toter" Zwischenraum zwischen Drag-Griff (Top-Bar) und Klick-Fläche
  (Header-Link) -- jeder Pixel Abstand gehört jetzt zu genau einer
  interaktiven Fläche.

- Zwei-Spalten-Layout via **Flexbox**, beide Spalten `flex: 1 0 0` und
  jeweils `align-items:center; justify-content:center` -- Textblock
  links ist in der Spalte zentriert (Höhe + Breite), Instagram-Modul
  rechts ebenso. 1:1 aus Figma-Node 1:3376 übernommen.
- **Rechte Spalte ("Hug", wächst nie mit"):** `.instagram-module-stage`
  hat eine FESTE `height: 520px` (entspricht der Default-Modulgröße, kein
  `min-height` mehr). Das Modul selbst ist `position: absolute` innerhalb
  dieser Stage -- zieht man es per Resize-Handles größer (bis 800x760),
  ragt es rein visuell über die Stage hinaus, ohne dass Spalte/Sektion
  mitwächst. Beim Laden wird das Modul zusätzlich automatisch **innerhalb
  der Stage zentriert** (vorher stand es fix bei `left:0/top:0`) und
  bleibt zentriert, solange man es noch nicht selbst gezogen/resized hat
  (`hasInteracted`-Flag in `script.js`) -- danach respektiert es die
  manuell gesetzte Position.
- **z-index-Schichtung:** `.instagram-module` hat einen festen
  `z-index: 2` (nicht mehr nur während Drag/Resize) -- damit liegt es
  immer über benachbarten Sektionen, falls es beim Resizen dort
  hineinragt, bleibt aber unter `#site-nav` (`z-index: 10`, siehe
  `styles.css`). Während Drag/Resize kurzzeitig `z-index: 3`.
- **Background-Blur:** `backdrop-filter: blur(16px)` (+ `-webkit-`-Präfix
  für Safari/iOS) auf `.instagram-module` für einen Glass-Effekt --
  reiner Effekt-Wert wie die Box-Shadows, kein Farb-Token, daher direkt
  in `components/instagram-module.css` gesetzt statt in `tokens.css`.
  Der bereits vorhandene, leicht transparente Hintergrund
  (`--color-blue-05`) lässt den Blur durchscheinen.
- **Bilder/Videos kommen NICHT mehr aus `content.json`**, sondern werden
  zur Laufzeit aus `assets/images/insta/` geladen (GitHub Contents API,
  `fetchInstaFolder()` in `script.js`) -- flexible Anzahl, Til muss nur
  Dateien im Ordner hochladen/löschen, kein JSON-Edit nötig. Bild vs.
  Video wird über die Dateiendung erkannt (`.jpg/.jpeg/.png/.webp/.gif`
  vs. `.mp4/.webm/.mov`). `content.json` → `section-06-text-social.
  instagram_module` enthält dadurch nur noch `handle`, `caption`,
  `avatar_image`, `follow_url` -- das frühere `post_images`-Array wurde
  entfernt.
  - **Rate-Limit:** Die GitHub Contents API erlaubt unauthentifiziert
    60 Requests/Stunde pro IP. Ergebnis wird deshalb 5 Minuten pro Tab in
    `sessionStorage` gecacht (`INSTA_CACHE_KEY`/`INSTA_CACHE_TTL_MS`).
    Bei viel gleichzeitigem Traffic aus derselben IP (z.B. Firmennetz)
    könnte das Limit trotzdem greifen -- aktuell bewusst in Kauf
    genommen, keine feste Fallback-Liste vorgesehen.
  - **Empty-State:** Ist der Ordner leer oder die API nicht erreichbar,
    erscheint im Grid ein kurzer Text-Hinweis (`.insta-empty-state`)
    statt eines stillen Fehlers/leeren Moduls.
  - Videos: `muted`, `loop`, `autoplay`, `playsinline` (Attribut UND
    Property, wegen iOS-Safari), **keine Controls** -- laufen also
    lautlos im Loop wie ein GIF. Da der Endlos-Loop alle Post-Elemente
    3x dupliziert, laufen bei mehreren Videos im Ordner entsprechend
    viele Video-Instanzen gleichzeitig im Autoplay (Performance im Blick
    behalten, falls der Ordner stark wächst).
- **Fade-in pro Medienelement:** Jedes Bild/Video ist zunächst
  `opacity: 0` (Klasse `.insta-media`) und blendet **einzeln** ein
  (`.is-loaded`, `opacity 0.4s ease`), sobald es geladen ist -- bei
  Bildern via `load`, bei Videos via `loadeddata` (erster Frame steht,
  kein schwarzes Flackern). Kein Warten auf die anderen Elemente im Set;
  die weiße `.insta-image`-Hintergrundfarbe dient währenddessen als
  simpler Ladeplatzhalter. Respektiert `prefers-reduced-motion`
  (Transition wird dann übersprungen, Elemente erscheinen direkt).
- **Mobile-Reset (≤768px):** Modul wird per `matchMedia`-Listener
  automatisch auf die Default-Größe (340x520) zurückgesetzt und neu
  zentriert (`applyMobileReset()`), sobald der 768px-Breakpoint
  unterschritten wird -- inkl. Zurücksetzen von `hasInteracted`, damit es
  beim Zurückwechseln zu Desktop wieder frisch zentriert startet.
  Drag/Resize sind auf Mobile deaktiviert: JS-seitig über einen
  `mobileQuery.matches`-Check am Anfang jedes `pointerdown`-Handlers,
  zusätzlich `pointer-events: none` auf den Resize-Zonen in der CSS als
  zweite Absicherung (verhindert versehentliches Ziehen auf
  Touch-Geräten).
- Modul-Breite/-Höhe-Grenzen (260-800 x 360-760), Endlos-Scroll,
  Spalten-Ausgleich (`equalizeColumns()`) und der Wechsel auf
  zwei Spalten ab `WIDE_BREAKPOINT` (460px Modul-Breite) sind
  unverändert wie zuvor -- nur die Datenquelle (Ordner statt
  `content.json`) und die Medien-Erzeugung (`makeMediaEl()` statt
  `makeImageEl()`, jetzt mit Video-Unterstützung) haben sich geändert.

### Details section-07-footer (für Anschluss-Kontext)

- Zwei-Spalten-Layout via **CSS Grid** (nicht Flexbox wie section-03/05/06)
  -- bewusste Abweichung, weil die linke Spalte zuverlässig "Height Fill"
  (`height:100%` + `justify-content:space-between`) bekommen sollte,
  während die rechte Spalte (scribble-lg) als höchstes Element die
  Zeilenhöhe selbst vorgibt und nur ihren eigenen Inhalt "hugged". Grid
  stretcht Items per Default auf die vom Inhalt bestimmte Row-Höhe --
  robuster als der bekannte Flexbox-Fall aus den "Gelernten Lektionen"
  unten (%-Höhen bei `align-self:stretch` ohne explizite Parent-Höhe).
  Kein `max-width` auf Sektion/Spalten -- Inhalt reicht bis zum
  Viewport-Rand, nur 32px/100px Padding + die Größe der Grafiken selbst
  begrenzen.
- `eatme-lyrics` (Songzeile "Drown") oben in der linken Spalte, Breite hier
  abweichend von section-03/05 auf `width:100%; max-width:320px`
  überschrieben (Figma-Vorgabe für diese Sektion) statt der
  komponenteneigenen `width:fit-content`.
- **scribble-sm/scribble-lg bewusst NICHT responsiv** (fixe px-Maße, 1:1
  aus Figma: 117px / 416px) -- anders als die meisten anderen
  Deko-Grafiken der Seite. `scribble-lg` darf dadurch bei schmalen
  Viewports über den rechten Rand hinauslaufen (Bleed-Effekt); das erzeugt
  kein horizontales Scrollen, weil `body { overflow-x: hidden; }` bereits
  global in `styles.css` gesetzt ist.
- **`eatme-footer`-Pille ist jetzt absolut positioniert**
  (`left/right/bottom:12px`) statt wie ursprünglich in einem eigenen
  Padding-Wrapper -- Komponente selbst setzt `width:100%`
  (`components/eatme-footer.css`), das kollidiert mit den Insets, daher
  `width:auto`-Override in `sections/section-07-footer.css`.
- **Booking-CTA ("Open for Booking") ist mit `bottom:50vh` statt `top:50%`
  zentriert.** Grund: die Sektion kann durch die fixen Scribble-Größen
  höher werden als der Viewport (scribble-lg allein 784px + 200px
  vertikales Padding). `top:50%` wäre relativ zur ggf. zu hohen
  Sektion zentriert und läge dann sichtbar zu weit oben, sobald ganz nach
  unten gescrollt ist. Der untere Rand der Sektion fällt dagegen -- weil
  dies die letzte Sektion der Seite ist -- am Ende immer exakt mit dem
  unteren Viewport-Rand zusammen; `bottom:50vh` (gemessen vom unteren
  Sektionsrand) trifft dadurch zuverlässig die Bildschirmmitte, egal wie
  hoch die Sektion durch ihren Inhalt tatsächlich wird. Siehe auch
  "Gelernte Lektionen" unten -- gilt für jede künftige Sektion, die exakt
  Bildschirmmitte treffen soll. **Textklasse: `text-highlight`** (30px,
  passt zur 36px-Höhe des Figma-Textknotens für diesen CTA — nicht
  `text-copy-l`, das war ein falscher Zwischenstand).
- **Kein Scroll-Parallax auf dem Booking-CTA** -- ursprünglich vorhanden
  (verschiedene Faktoren durchprobiert: `0.05`/`0.15`/`0.08`), fühlte sich
  aber ruckelig/laggy an und wurde auf Wunsch komplett wieder entfernt.
  Falls später erneut gewünscht: der CTA ist gleichzeitig zentriert
  (`bottom:50vh` + `transform`), ein Scroll-Versatz müsste in den
  bestehenden `transform`-String hineingerechnet werden (`translate(-50%,
  calc(50% + Npx))`), nicht per eigenständigem `translateY` überschrieben.
- **CTA bekommt bewusst KEIN `.fade-in-text`** -- siehe "Gelernte
  Lektionen" unten (IntersectionObserver-Stagger via Inline-Style bricht
  sonst den eigenen, schnelleren Hover).
- **Mobile: bewusst KEIN Stack/Umbruch** -- einzige Sektion, die auf
  allen Breiten horizontal (zwei Spalten) bleibt, anders als
  section-03/05/06. **Eigener, engerer vertikaler Mobile-Padding-Wert**
  (Wunsch): `40px` oben/unten statt der sonst üblichen 100px. Horizontal
  bewusst `16px` -- **kein** von den anderen Sektionen abweichender Wert
  (ein kurzer Zwischenstand mit 8px wirkte inkonsistent, z.B. lag das
  Lyrics-Modul dadurch näher am Rand als in allen anderen Sektionen --
  zurück auf den site-weiten 16px-Mobile-Standard korrigiert). Weitere
  Mobile-Anpassungen: (1) Songzeilen dürfen umbrechen
  (`white-space:normal` statt dem komponenteneigenen `nowrap`), sonst
  sprengen lange Zeilen die schmale Spalte; (2) linke Spalte bekommt einen
  fixen `32px`-Gap zwischen Lyrics und scribble-sm statt der Desktop-
  "Height Fill"; (3) Booking-CTA bricht nach dem ersten Wort um (aktuell
  "Open" / "for Booking") über ein `<br class="footer-cta-break">`, das
  per CSS nur ab dem 768px-Breakpoint sichtbar wird -- Rendering splittet
  generisch am ersten Leerzeichen im Text, nicht hart am String "Open",
  bleibt also gültig, falls `cta_text` sich später ändert.

## Gelernte Lektionen (für alle künftigen Sektionen relevant)

- **`<a>`-Elemente, die als Fläche/Block genutzt werden** (nicht als
  Inline-Text-Link) — z.B. eine ganze Karte oder ein scrollbarer Bereich,
  der komplett anklickbar ist — **müssen `margin`, `padding`, `display`
  UND `:hover` explizit selbst setzen**, sonst greift die globale
  Link-Konvention aus `styles.css` (`padding:10px 6px; margin:-10px -6px;
  a:hover{opacity:0.6; filter:blur(4px)}`, gedacht für Inline-Text-Links)
  ungewollt durch. Fehlt auch nur eine dieser vier Eigenschaften am
  eigenen Klassen-Selektor, wirkt der globale Wert trotzdem (z.B. hat ein
  vergessenes `margin:0` beim Instagram-Modul das Element per negativem
  Margin verschoben/verbreitert und unter den Header geschoben — siehe
  Details section-06 unten). Faustregel: bei jedem "Fläche-als-Link"-Case
  eine kurze Checkliste durchgehen — margin, padding, display, :hover.
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
- **Wenn sich ein Bild-Asset auf Quer-/Hochformat ändert, den
  Figma-Referenzrahmen für alle %-positionierten Geschwister-Elemente neu
  prüfen** (siehe section-05: Bildwechsel auf `eatme-image-04.webp`
  Querformat hat den Tropfen-Referenzrahmen von 1280×688 auf 1280×657
  verschoben) — nicht nur die Bildmaße selbst anpassen, sondern per
  `get_metadata`/`get_design_context` gegenchecken, ob sich dadurch auch
  die %-Positionen frei platzierter Deko-Elemente in derselben Sektion
  verschoben haben.
- **Live-Vorschau-Sandbox blockiert externe Requests** (z.B.
  `raw.githubusercontent.com` für Fonts/SVGs) — führt zu fehlenden
  Schriften und winzigen/kaputten Bildern, die leicht als "Vögel zu
  klein"/"Schrift lädt nicht" fehlinterpretiert werden. Fix: Assets für
  die Vorschau als Base64 direkt in die HTML einbetten (Font als
  `data:font/woff2;base64,...`, SVGs als `data:image/svg+xml;base64,...`).
  Betrifft nur die Vorschau-Datei, nicht die Produktionsversion (die nutzt
  die echten relativen Repo-Pfade).
- **`.fade-in-text` + eigener Hover auf demselben Element verträgt sich
  nicht ohne Weiteres.** Der gemeinsame `IntersectionObserver`
  (`initFadeInText()`) setzt pro Element zusätzlich ein individuelles
  `transitionDelay` **per Inline-Style** (für den Stagger-Effekt) --
  Inline-Style schlägt IMMER jede Stylesheet-Regel, unabhängig von deren
  Selektor-Spezifität. Ein Element, das gleichzeitig `.fade-in-text` UND
  einen eigenen, schnelleren Hover-Effekt haben soll, bekommt dadurch
  einen spürbar "verzögerten"/"verbuggten" Hover, selbst wenn die
  `transition-duration` in der eigenen Regel korrekt überschrieben wurde
  (siehe section-07-footer, Booking-CTA). Faustregel: Elemente mit
  eigenem, prominentem Hover (nicht nur die globale Link-Convention)
  bekommen KEIN `.fade-in-text` -- Scroll-Reveal und individueller Hover
  auf demselben Element sauber trennen, nicht kombinieren.
- **Zentrierung "exakt Bildschirmmitte" bei variabler Sektionshöhe:
  `bottom:50vh` statt `top:50%` verwenden, wenn es die LETZTE Sektion der
  Seite ist und ihr Inhalt höher werden kann als der Viewport.** `top:50%`
  zentriert relativ zur GESAMTEN (ggf. zu hohen) Sektion -- ist die Sektion
  höher als der Viewport, liegt ihr oberer Rand beim finalen Scrollstand
  bereits über dem sichtbaren Bereich, wodurch `top:50%` sichtbar zu weit
  oben landet. Der untere Rand der letzten Sektion fällt dagegen am Ende
  immer exakt mit dem unteren Viewport-Rand zusammen (man kann nicht weiter
  scrollen) -- `bottom:50vh` (vom unteren Sektionsrand gemessen) trifft
  dadurch zuverlässig die Bildschirmmitte, unabhängig von der tatsächlichen
  Sektionshöhe. Braucht `transform:translate(-50%, 50%)` statt `(-50%,
  -50%)` (das `50%` statt `-50%` auf der Y-Achse verschiebt das Element von
  seiner Unterkante aus wieder um die halbe eigene Höhe nach unten).
- **Text mit bedingtem, per Breakpoint umschaltbarem `<br>`: das
  Leerzeichen gehört ans Ende des vorherigen Textknotens, nicht an den
  Anfang des nächsten.** Soll ein `<br>` nur ab einem bestimmten
  Breakpoint sichtbar werden (`display:none` → `display:inline`, siehe
  `.footer-cta-break` in section-07-footer) und der Text davor/danach ein
  normales Leerzeichen behalten, muss das Leerzeichen als Teil des ERSTEN
  Textknotens gerendert werden. Sitzt es stattdessen am Anfang des
  zweiten Knotens, geht es beim `display:none` des `<br>` optisch
  komplett verloren (Wörter kleben ohne Space aneinander) und erzeugt
  zusätzlich einen unschönen Einzug am Zeilenanfang, sobald der `<br>`
  aktiv wird.

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
   zur Sektion selbst, unabhängig vom sitewide System unten.
2. **Durchgehender, seitenweiter Himmel-Hintergrund** (Cloud + Footer) —
   ✅ **fertig**, siehe Details unten.

### Details sitewide Hintergrund (Cloud + Footer)

Zwei Bild-Ebenen im `.page-background`-Layer (`index.html`), CSS in
`styles.css` (Kommentarblock "Sitewide Himmel-Hintergrund"),
Positionierung/Parallax im konsolidierten Loop in `script.js` (siehe
"Parallax-Konsolidierung" unten).

- **Cloud** (`assets/visuals/backgrounds/clouds.webp`): Startet bei
  `CLOUD_ANCHOR_FRACTION = 1.2` (120% der section-02-Höhe, dynamisch aus
  `offsetTop + offsetHeight` berechnet — nicht der feste Figma-Pixelwert,
  da die reale Seite nie exakt die Figma-Canvas-Höhe hat). Parallax-Faktor
  `0.5` (scrollt halb so schnell wie die Seite), berechnet aus
  `window.scrollY` (kein `getBoundingClientRect()`, siehe
  Performance-Abschnitt unten). Kein CSS-Fade/Maske nötig — das WebP hat
  bereits einen eingebauten Alpha-Fade oben UND unten (Transparenz-Kanal
  fädet im Asset selbst weich von 0 auf 255 über die ersten ~500px von
  4658px Original-Höhe). Kein Opacity-Fade-in (war zwischenzeitlich per
  `IntersectionObserver` geplant, aber wegen Timing-Problemen — Observer
  wurde vor dem `eatme:content-ready`-Rendering aufgesetzt, erste
  Intersection-Messung fiel dadurch fälschlich früh "true" aus — wieder
  verworfen). Cloud ist permanent sichtbar, ihre Sichtbarkeit ergibt sich
  rein aus der Scroll-Position (sitzt initial ohnehin außerhalb des
  Viewports).
- **Footer** (`assets/images/eatme-image-footer.jpg`): `position:
  absolute; bottom: 0` im Hintergrund-Layer → hängt immer exakt am
  Dokumentende, unabhängig von der realen Seitenhöhe. Kein Parallax
  ("scrollt normal"). Höhe eingefroren ab Referenzbreite 1080px (`height:
  min(117.2vw, 1266px)` — 1080 × 1.172, das Bildverhältnis), damit das
  Bild auf großen Screens nicht endlos höher wächst (sonst rutschen die
  Gesichter auf dem Bandfoto aus dem sichtbaren Bereich, da die Box vom
  unteren Rand aus nach oben wächst). `object-position: center 36%` hält
  den sichtbaren Ausschnitt über den gesamten Crop-Bereich (1080px bis
  Ultra-Wide) auf den Gesichtern (sitzen bei ca. 40–49% der Bildhöhe,
  nicht im oberen Drittel, wie zunächst angenommen). Bekommt eine echte
  `mask-image` für den weichen oberen Rand (JPG hat keinen Alpha-Kanal,
  im Gegensatz zur Cloud) — unproblematisch für Performance, da der
  Footer nie animiert wird.
- **Mobile (≤768px):** Beide Bilder frieren ihre Breite auf `768px` ein
  (kein weiteres Schrumpfen), `.page-background` hat `overflow: hidden` →
  werden links/rechts angeschnitten statt zu skalieren. Footer-Höhe hier
  explizit `900px` (768 × 1.172).

### Parallax-Konsolidierung (Performance)

Alle Scroll-Parallax-Effekte der Seite (Stage-Wolken/-Vögel,
section-02-Vögel, section-03-Bandfotos, section-05-Tropfen, jetzt auch
die sitewide Cloud) laufen in **einem einzigen** `requestAnimationFrame`-
Loop am Ende von `script.js` — nicht mehr in fünf unabhängigen Loops wie
in früheren Sektions-Ständen. Grund: jeder einzelne Loop rief für sich
`getBoundingClientRect()` auf und schrieb direkt danach ein
`style.transform` — mehrere solcher Lese-Schreib-Paare **innerhalb
desselben Frames** zwingen den Browser wiederholt zu synchronen
Layout-Reflows. Chrome verkraftet das gut, **Safari deutlich schlechter**
(sichtbares Ruckeln dort, obwohl Chrome smooth blieb). Der konsolidierte
Loop liest zuerst **alle** Positionen (`getBoundingClientRect()` je
Sektion + `window.scrollY` für die Cloud), schreibt danach **alle**
Transforms — pro Frame maximal ein Layout-Read-Durchgang, keine
verschachtelten Lese-/Schreibzyklen mehr.

Weitere Perf-Maßnahmen aus demselben Anlass:
- Tropfen-Parallax überspringt unsichtbare Elemente (`el.offsetParent ===
  null`, greift für die jeweils andere Breakpoint-Variante).
- Cloud-Asset von PNG (1,24MB, 2000×4658px) auf WebP (260KB,
  1200×2794px) verkleinert — Dateiformat/-größe wirkt sich vor allem auf
  die Ladezeit aus, die **Pixel-Auflösung** ist der eigentliche Hebel für
  die Compositing-Kosten pro Frame.
- **Ausprobiert, wieder verworfen:** `contain: layout paint` +
  `-webkit-backface-visibility: hidden` auf `.bg-cloud`/`.bg-footer` als
  Safari-Compositing-Hints — verursachten in der Praxis genau das
  Gegenteil (kurzes Flackern/Verschwinden der Cloud beim Scrollen in
  Safari, bekanntes WebKit-Verhalten bei dieser Kombination mit
  `transform` auf großen Bildern). Ersatzlos entfernt, falls jemand
  denselben Ansatz nochmal probieren will.

**Bewusste Reihenfolge (historisch):** Erst alle 7 Sektionen strukturell
gebaut (Layout, Content, Responsive), das durchgehende Hintergrund-System
zuletzt.

## Content-Struktur

Alle Texte, Bildpfade und Links liegen in `content.json`, getrennt vom
HTML/Code. Struktur wird sektionsweise erweitert, sobald die jeweilige
Sektion gebaut wird. Grundprinzip: fixe Layout-Slots (Positionen/Rotation
bleiben Code, nicht editierbar), aber Text/Bild/Link-Inhalt editierbar.

**Sonderfall section-07-footer:** `background_image`/`background_image_alt`
sind in `content.json` bereits befüllt (Duoton-Bandfoto für den Footer),
werden aktuell aber bewusst **nicht** ins Layout eingebaut — kommt in
einem eigenen, späteren Chat dazu (siehe Sektions-Status). Kein
zusätzliches Content-Update nötig, wenn es so weit ist, die Felder sind
schon da.

## Arbeitsweise / Workflow

- Ein Chat pro Sektion (in diesem Projekt), um Kontext klein zu halten
- Jeder Sektions-Chat referenziert: `tokens.css`, `content.json`,
  `styles.css` (globale Konventionen, inkl. sitewide Hintergrund),
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
- Neue globale Konventionen (Hover, Fade-In, Bild-Drag, künftige) gehören
  nach `styles.css`, nicht in einzelne Sektions-Dateien — siehe Abschnitt
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
