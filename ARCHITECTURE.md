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
├── background-and-motion.md    ← Himmel-Hintergrund + Parallax/Animation-Logik (separat)
├── content.json                ← alle Texte, Bildpfade, Links
├── imprint.html                ← einfache statische Seite
├── datenschutz.html            ← einfache statische Seite
├── /sound                      xyz.mp3 — Hintergrund-Song, an/aus schaltbar
├── /assets
│   ├── /fonts                  Michroma-Regular.woff2, EBGaramond-Italic.woff2
│   ├── /images                 eatme-image-01/02/03.jpg, -footer.jpg, insta-avatar.png
│   ├── /logo                   eatme_logo.png
│   └── /visuals
│       ├── birds-black.webp
│       ├── birds-stage.html    ← fertiger Vogelschwarm-Animations-Prototyp,
│       │                         wird in section-01-stage eingebaut
│       ├── /birds-blue         bird-blue-sm.svg, bird-blue-lg.svg
│       ├── /drops              01–04.png
│       ├── /scribble           scribble-sm.svg, scribble-lg.svg
│       └── /backgrounds        cloud-stage-background.jpg, clouds.png
├── /components                 wiederverwendbare Bausteine, siehe unten
└── /sections                   eine Datei/Ordner pro Sektion, siehe unten
```

`.gitignore` schließt `.DS_Store` aus.

## Sektionsliste

Direkt aus Figma übernommen (Section-Namen im File), 7 Sektionen:

1. **section-01-stage** — Hero: Logo, Social-Links (Spotify/TikTok/Instagram/
   YouTube), Vogelschwarm-Animation (`birds-stage.html` / Frame
   `html-visual-voegel`). Hat einen **eigenen Stage-Hintergrund**
   (vermutlich `assets/visuals/backgrounds/cloud-stage-background.jpg`),
   der zur Sektion selbst gehört und im section-01-Chat gebaut wird —
   **das ist NICHT** der durchgehende, seitenweite Himmel-Hintergrund.
   Der (Thema von `background-and-motion.md`) startet erst ab section-02
   und wird bewusst zuletzt spezifiziert, nachdem die Struktur aller
   Sektionen steht.
2. **section-02-text-01** — Intro-Text ("EatMe – Independent Pop between
   momentum and nostalgia" + Beschreibungsabsätze). Der durchgehende,
   seitenweite **Himmel-Hintergrund beginnt hier.**
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

## Globale Interaktions-Convention

**Hover (alle Sektionen):** Interaktive Elemente (Links, Buttons) werden bei
Hover leicht transparent (`opacity: 0.6`, `transition: 0.2s ease`). Einmal
zentral in `styles.css` definiert (`a, button` global) — nicht pro Sektion
neu schreiben, gilt automatisch für alle künftigen Sektionen.

## Sektions-Status

- ✅ **section-01-stage** — fertig (Stage-Modul mit Cloud-Hintergrund +
  Vogelschwarm-Animation als zwei unabhängige Parallax-Ebenen, secondary-nav
  mit Mailto-Link + Sound-Toggle). Eigene CSS: `sections/section-01-stage.css`,
  Verhalten (Sound-Toggle, Parallax) in `script.js`.
- ⬜ section-02-text-01 … section-07-footer — noch offen, siehe Sektionsliste
  oben.

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
   zur Sektion selbst, wird im section-01-Chat gebaut, kein Bezug zu
   `background-and-motion.md`.
2. **Durchgehender, seitenweiter Himmel-Hintergrund** — startet erst ab
   section-02 (siehe Sektionsliste oben), zieht sich über alle weiteren
   Sektionen. Wird **separat** in `background-and-motion.md` behandelt
   (Verlauf, Textur, Parallax-/Animationsverhalten).

**Bewusste Reihenfolge:** Erst alle 7 Sektionen strukturell bauen (Layout,
Content, Responsive), das durchgehende Hintergrund-System (Punkt 2)
zuletzt. Til möchte die Struktur sichtbar haben, bevor der seitenweite
Hintergrund reinkommt. Bis dahin nutzt `styles.css` einen simplen
Platzhalter-Verlauf aus den Tokens (`--gradient-top` / `--gradient-bottom`)
über die ganze Seite, der später durch die finale Logik aus
`background-and-motion.md` ersetzt wird (inkl. Korrektur, dass er erst ab
section-02 einsetzt und section-01 seinen eigenen Stage-Hintergrund behält).

## Content-Struktur

Alle Texte, Bildpfade und Links liegen in `content.json`, getrennt vom
HTML/Code. Struktur wird sektionsweise erweitert, sobald die jeweilige
Sektion gebaut wird. Grundprinzip: fixe Layout-Slots (Positionen/Rotation
bleiben Code, nicht editierbar), aber Text/Bild/Link-Inhalt editierbar.

## Arbeitsweise / Workflow

- Ein Chat pro Sektion (in diesem Projekt), um Kontext klein zu halten
- Jeder Sektions-Chat referenziert: `tokens.css`, `content.json`,
  `background-and-motion.md`, ggf. betroffene `/components`-Dateien
- Screenshot-Vergleich als Feedback-Loop: bauen → Screenshot → neben
  Referenzbild legen → Abweichungen benennen (konkrete Werte statt
  "sieht komisch aus")
- Mobile-Anpassungen werden im jeweiligen Sektions-Chat mitentschieden,
  kein separater Mobile-Chat

## Live-Vorschau während des Bauens einer Sektion

Damit Til jede Sektion sofort im Chat sieht — ganz ohne GitHub-Upload —
gilt für jeden Sektions-Chat:

- Claude zeigt die Sektion als **Artifact (Live-Vorschau im Chat)**, direkt
  testbar, mit sofortigem Feedback-Loop (Til sieht Ergebnis → gibt
  Feedback → Claude passt an).
- Damit die Vorschau ohne Server/Build-Step läuft, wird sie als
  **eigenständige, einzelne HTML-Datei** gebaut: Content wird direkt
  eingebettet statt per `fetch("content.json")` geladen (das würde in der
  Vorschau-Umgebung nicht zuverlässig funktionieren — echte `fetch`-Aufrufe
  auf lokale Dateien brauchen einen Server oder GitHub Pages).
- Bilder: Til lädt die relevanten Bilddateien für genau diese Sektion
  einzeln hoch (kein ZIP — ZIPs werden im Chat/Projekt-Kontext nicht
  zuverlässig gelesen). Claude bettet sie base64-codiert in die
  Vorschau-Datei ein, damit sie sofort sichtbar sind.
- Für die **finale Produktionsdatei** (die später ins Repo kommt) nutzt
  Claude stattdessen die reguläre Multi-Datei-Struktur: separate
  `content.json` (per `fetch` geladen) und reguläre Bildpfade
  (`/assets/images/eatme-image-01.jpg` etc.).
- Unterschied zwischen Vorschau- und Produktionsversion betrifft nur diese
  technischen Lade-Mechanismen (Content/Bilder), nicht Layout/Design.
- GitHub wird erst für zwei Dinge gebraucht: (1) das finale Live-Hosting
  der Seite, (2) die spätere Content-Pflege durch den Kunden direkt im
  GitHub-Web-Interface. Fürs Iterieren beim Bauen ist kein Upload nötig.
