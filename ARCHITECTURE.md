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

- GitHub Pages, sobald Repo angelegt ist (noch offen — Til legt an, Claude
  begleitet die Schritte).
- Content-Pflege durch den Kunden **direkt im GitHub-Web-Interface**
  (Datei anklicken → Stift-Icon → Wert ändern → Commit). Kein CMS, kein
  Admin-Panel — bewusste Entscheidung, siehe Verlauf dieses Projekts.

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
   YouTube), Himmel-Hintergrund-Start, Vogelschwarm-Animation
   (`birds-stage.html` / Frame `html-visual-voegel`)
2. **section-02-text-01** — Intro-Text ("EatMe – Independent Pop between
   momentum and nostalgia" + Beschreibungsabsätze)
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

Der durchgehende Himmel-Hintergrund (über alle Sektionen) sowie
Parallax-/Animationsverhalten werden **separat** in
`background-and-motion.md` behandelt — noch nicht final spezifiziert, folgt
als nächster Schritt.

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
