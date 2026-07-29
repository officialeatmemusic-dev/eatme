# tokens.css — Notizen

## Quelle
Alle Werte stammen direkt aus den Figma-Variablen des Files
`njS6vA0NyvIyFcsPk3dDXH` (EatMe – Website), abgefragt auf Node `3:5404`
("full-page"). Der Button/Footer-Gradient stammt aus einem separaten
Figma Color-Style (nicht aus der Variablen-Collection), von Til direkt
als CSS-Snippet geliefert.

## Konvention für alle Sektions-Chats
- Keine neuen Hex-Codes, Font-Größen oder Letter-Spacing-Werte einführen.
- Immer die Variablen aus `tokens.css` referenzieren (`var(--...)`).
- Falls ein Wert für eine Sektion fehlt, der in Figma existiert aber hier
  noch nicht erfasst ist: hier in tokens.css ergänzen, nicht lokal in der
  Sektion hart codieren.

## Offene Punkte / zu verifizieren

1. **Letter-Spacing-Einheit unklar.**
   Figma liefert `letterSpacing: -10 / 6 / 8` als reine Zahl ohne Einheit.
   Aktuell als `px` angenommen. Bitte einmal im Figma-Inspector (Text
   auswählen → rechtes Panel → "Letter spacing") prüfen, ob es sich um
   px oder % handelt — vor allem bei `-10px` (highlight) macht das einen
   spürbaren Unterschied.

2. **`--gradient-buttons-footer` ist NICHT der Himmel-Hintergrund.**
   Das ist ausdrücklich der Verlauf für Buttons und Footer. Der
   durchgehende Himmel-Hintergrund über alle Sektionen wird separat in
   `background-and-motion.md` behandelt (eigene Logik, eigene Farbwerte/
   Textur, ggf. mit `--gradient-top` / `--gradient-bottom` als Ausgangsbasis,
   aber nicht zwingend identisch).

3. **EB Garamond nur als Italic erfasst.**
   Bisher taucht in den Figma-Variablen nur der `lyrics`-Stil (kursiv) auf.
   Falls EB Garamond irgendwo auch non-italic gebraucht wird, muss die
   zweite `@font-face`-Regel in tokens.css aktiviert und die passende
   `.woff2`-Datei ergänzt werden.

4. **Font-Dateien fehlen noch.**
   `tokens.css` verweist auf `/assets/fonts/Michroma-Regular.woff2` und
   `/assets/fonts/EBGaramond-Italic.woff2`. Diese Dateien müssen von
   Google Fonts (als Datei-Download, nicht als Web-Link/CDN-Einbindung —
   siehe DSGVO-Hinweis aus dem Architektur-Chat) besorgt und ins Repo unter
   `/assets/fonts/` gelegt werden, bevor die Fonts live sichtbar sind.

5. **Pfade immer relativ, nie mit führendem `/`.**
   GitHub Pages läuft hier als Project-Page unter `t-i-l.github.io/eatme/`
   (nicht als reine `username.github.io`-Hauptseite). Ein Pfad mit
   führendem `/` (z.B. `/assets/...`) zeigt von der Domain-Wurzel aus und
   würde am `/eatme/`-Unterordner vorbeizeigen → 404. Deshalb überall
   relative Pfade ohne führenden Slash verwenden (`assets/...`,
   `sound/...`). Betraf ursprünglich die Font-Pfade in `tokens.css`,
   wurde gefixt — bei neuen Asset-Referenzen (z.B. in
   `background-and-motion.md` oder Sektions-CSS) unbedingt genauso machen.

## Nicht in tokens.css enthalten (bewusst)
- Spacing-/Abstands-Skala — in Figma noch nicht als Variablen gesehen,
  wird ggf. pro Sektion aus den Frame-Maßen abgeleitet oder separat
  nachgezogen, falls sich ein wiederkehrendes Raster zeigt.
- Breakpoints — siehe eigener Abschnitt unten.

## Breakpoints & Skalierung (verbindlich für alle Sektions-Chats)

**Referenzbreite Desktop: 1280px** (entspricht dem Figma-Frame
`eatme-desktop`). In Figma existiert **kein separater Mobile-Frame** —
Mobile-Layout wird von uns entschieden, nicht 1:1 aus Figma übernommen.

**Ein einziger globaler Breakpoint: `768px`.**
- Kein Tablet-Zwischenschritt — nur Desktop und Mobile.
- Oberhalb von 768px: Desktop-Layout, **fluid skaliert** (Positionen/Größen
  wo möglich in `%`/`vw` statt fixen `px`, damit zwischen 1280px und 768px
  nichts abrupt bricht oder überlappt).
- Ab 768px und darunter: Wechsel von horizontaler/überlappender Anordnung
  auf **vertikalen Stack** — pro Sektion wird im jeweiligen Sektions-Chat
  entschieden, in welcher Reihenfolge die Elemente gestapelt werden.

**Wichtige technische Einschränkung:**
CSS-Custom-Properties (`var(--irgendwas)`) funktionieren **nicht** innerhalb
von `@media`-Queries — das ist eine CSS-Sprachgrenze, keine Design-
Entscheidung. Der Breakpoint-Wert muss daher als **fest verdrahtete Zahl**
in jeder Sektion identisch verwendet werden:

```css
@media (max-width: 768px) {
  /* Mobile-Anpassungen hier */
}
```

Nicht 767px, nicht 800px — immer exakt `768px`, damit alle Sektionen beim
Scrollen an derselben Stelle umschalten (sonst entstehen sichtbare Brüche,
besonders auffällig durch den durchgehenden Hintergrund-Layer).
