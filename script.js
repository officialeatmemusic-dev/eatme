// ==========================================================================
// EatMe — Grundgerüst
// Lädt content.json einmal beim Seitenaufruf. Die eigentliche Befüllung der
// einzelnen Sektionen (Text/Bilder einsetzen) passiert in den jeweiligen
// Sektions-Dateien, die diese Funktion importieren/aufrufen — nicht hier.
// ==========================================================================

async function loadContent() {
  const response = await fetch("content.json");
  if (!response.ok) {
    throw new Error(`content.json konnte nicht geladen werden: ${response.status}`);
  }
  return response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const content = await loadContent();
    // Sektionen greifen hierüber auf ihre jeweiligen Daten zu, z.B.:
    // content["section-02-text-01"].headline
    window.eatmeContent = content;
    document.dispatchEvent(new CustomEvent("eatme:content-ready", { detail: content }));
  } catch (err) {
    console.error("Fehler beim Laden von content.json:", err);
  }
});

// ==========================================================================
// Globale Scroll-Fade-In-Convention (für Texte, siehe styles.css)
// Ein einziger IntersectionObserver für die ganze Seite. Sektions-Chats
// müssen dafür nichts Eigenes bauen: einfach die Klasse .fade-in-text auf
// die gewünschten Text-Elemente setzen und initFadeInText() nach dem
// Einfügen neuer Elemente (z.B. nach dynamischem content.json-Rendering)
// aufrufen.
//
// Richtungsabhängig (Update, ersetzt die frühere beidseitige Version):
// - Runterscrollen + Element kommt in den Viewport -> einblenden.
// - Runterscrollen + Element verlässt den Viewport oben -> NICHTS tun
//   (bleibt sichtbar, kein Ausfaden während man weiter runterscrollt).
// - Hochscrollen + Element verlässt den Viewport -> ausblenden.
// - Hochscrollen + Element kommt (von oben) in den Viewport -> NICHTS
//   tun (kein erneutes Einblenden während man zurückscrollt).
// window.scrollY ist ein reiner Scroll-Offset-Wert, kein Layout-Read --
// unproblematisch hier im Callback (im Gegensatz zu
// getBoundingClientRect(), siehe Parallax-Loop weiter unten).
// ==========================================================================

// Scroll-Fade-In-Convention DEAKTIVIERT (25.08.2026, siehe styles.css
// Kommentar bei .fade-in-text): Der Effekt ist per CSS bereits neutralisiert
// (Texte permanent sichtbar), initFadeInText() macht daher bewusst nichts
// mehr -- spart den IntersectionObserver-Overhead komplett, statt ihn
// weiterlaufen zu lassen, ohne dass er noch etwas Sichtbares bewirkt.
// Aufruf-Stellen (DOMContentLoaded unten, renderSection0X() etc.) bleiben
// unveraendert im Code, rufen aber nur noch eine leere Funktion auf.
function initFadeInText(root = document) {
  // no-op
}

document.addEventListener("DOMContentLoaded", () => initFadeInText());

// ==========================================================================
// section-01-stage — Sound-Toggle + Zwei-Ebenen-Parallax (Wolken/Vögel)
// ==========================================================================

// Sound-Toggle: startet aus (Label durchgestrichen, siehe section-01-stage.css).
// Klick aktiviert Loop-Playback und entfernt die Durchstreichung.
const stageAudio = new Audio("sound/xyz.mp3");
stageAudio.loop = true;
const soundToggleBtn = document.querySelector("#section-01-stage .sound-toggle");
if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    const isOn = soundToggleBtn.dataset.state === "on";
    soundToggleBtn.dataset.state = isOn ? "off" : "on";
    if (isOn) {
      stageAudio.pause();
    } else {
      stageAudio.play().catch(() => {
        console.log("Autoplay/Play blockiert (Browser-Policy) oder Datei nicht gefunden.");
      });
    }
  });
}

// Parallax: siehe der EINE konsolidierte Loop weiter unten in dieser
// Datei ("KONSOLIDIERTER Parallax-Loop"), der Stage-, section-02-,
// section-03-, Tropfen- und Cloud-Parallax gemeinsam behandelt.

// ==========================================================================
// section-02-text-01 — Text aus content.json rendern + subtiler Parallax
// ==========================================================================

function renderSection02(data) {
  const container = document.querySelector("#section-02-copy");
  if (!container || !data) return;

  container.innerHTML = "";
  [data.headline, ...data.paragraphs].forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.classList.add("fade-in-text");
    container.appendChild(p);
  });
  initFadeInText(container);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection02(e.detail["section-02-text-01"]);
});

// ==========================================================================
// eatme-navigation — fixe Top-Nav: Logo + Social-Links aus content.json
// (site.logo -- momentan unter section-01-stage.logo_image geführt --
// und site.social_links). Reine DOM-Befüllung, kein eigenes Scroll-/
// Parallax-Verhalten -- die Nav bewegt sich nicht mit (position: fixed,
// siehe components/eatme-navigation.css).
// ==========================================================================

function renderNav(content) {
  if (!content) return;

  const logoImg = document.querySelector("#nav-logo");
  const linksContainer = document.querySelector("#nav-links");
  if (!logoImg || !linksContainer) return;

  const logoSrc = content["section-01-stage"]?.logo_image;
  if (logoSrc) {
    logoImg.src = logoSrc;
  }

  const socialLinks = content.site?.social_links || {};
  const labels = { spotify: "Spotify", tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };

  linksContainer.innerHTML = "";
  Object.keys(labels).forEach((key) => {
    const url = socialLinks[key];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.textContent = labels[key];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    linksContainer.appendChild(a);
  });
}

document.addEventListener("eatme:content-ready", (e) => {
  renderNav(e.detail);
});

// Subtiler Scroll-Parallax für die blauen Vögel: siehe der EINE
// konsolidierte Loop weiter unten in dieser Datei.

// ==========================================================================
// eatme-lyrics — gemeinsame Render-Funktion für das Songtext-Modul
// (Zeilen + icon-play + Songtitel + Link-Ziel), wiederverwendbar für
// section-03-images, section-05-images-drops und section-07-footer (siehe
// components/eatme-lyrics.css für das zugehörige Styling). Jede Sektion
// übergibt nur ihre eigenen Element-Referenzen + ihre eigenen
// content.json-Daten -- die Logik selbst ist identisch für alle drei.
// ==========================================================================

function renderLyricsModule({ linkEl, linesContainerEl, songTitleEl, songLinkRowEl }, lyricsData) {
  if (!linkEl || !linesContainerEl || !songTitleEl || !songLinkRowEl || !lyricsData) return;

  linkEl.href = lyricsData.song_link || "#";

  // Zeilen dynamisch rendern, jede Zeile bekommt einzeln .fade-in-text ->
  // initFadeInText() staggert sie automatisch (80ms pro Element,
  // index-basiert, siehe oben). Songtitel-Zeile bekommt die Klasse
  // ebenfalls, damit sie als letztes Element im Stagger mit einblendet
  // ("zeilenweise + Songtitel").
  linesContainerEl.innerHTML = "";
  (lyricsData.lines || []).forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    p.classList.add("fade-in-text");
    linesContainerEl.appendChild(p);
  });

  songTitleEl.textContent = lyricsData.song_title || "Song Title";
  songLinkRowEl.classList.add("fade-in-text");
}

// ==========================================================================
// section-03-images — Bildpfade aus content.json rendern, Songtext-Modul
// über renderLyricsModule() befüllen, Fade-In-Registrierung + subtiler
// Parallax auf beiden Bildern (unterschiedliche Faktoren, siehe unten).
// ==========================================================================

function renderSection03(data) {
  if (!data) return;

  const img1El = document.querySelector("#section-03-image-01");
  const img2El = document.querySelector("#section-03-image-02");
  const sectionEl = document.querySelector("#section-03-images");

  if (!img1El || !img2El || !sectionEl) return;

  const images = data.images || [];
  if (images[0]) {
    img1El.src = images[0].src;
    img1El.alt = images[0].alt || "";
  }
  if (images[1]) {
    img2El.src = images[1].src;
    img2El.alt = images[1].alt || "";
  }

  renderLyricsModule(
    {
      linkEl: document.querySelector("#section-03-lyrics-link"),
      linesContainerEl: document.querySelector("#section-03-lyrics-lines"),
      songTitleEl: document.querySelector("#section-03-song-title"),
      songLinkRowEl: document.querySelector("#section-03-images .song-link"),
    },
    data.lyrics
  );

  initFadeInText(sectionEl);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection03(e.detail["section-03-images"]);
});

// Subtiler Scroll-Parallax auf beide Bandfotos: siehe der EINE
// konsolidierte Loop weiter unten in dieser Datei.

// ==========================================================================
// section-04-text-02 — Fließtext (2 Absätze) aus content.json rendern.
// Kein Parallax, keine Bilder -- reines Fade-In auf die Absätze, gleiches
// Muster wie renderSection02 (dort mit Headline, hier nur Absätze).
// ==========================================================================

function renderSection04(data) {
  const container = document.querySelector("#section-04-copy");
  if (!container || !data) return;

  container.innerHTML = "";
  (data.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.classList.add("fade-in-text");
    container.appendChild(p);
  });
  initFadeInText(container);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection04(e.detail["section-04-text-02"]);
});

// ==========================================================================
// section-05-images-drops — Bildpfad aus content.json rendern, Songtext-
// Modul über die gemeinsame renderLyricsModule() befüllen (siehe
// section-03 oben), Fade-In-Registrierung. Tropfen-Layer ist NICHT
// content.json-gesteuert (rein dekorativ, feste Positionen direkt im
// Markup, wie die blauen Vögel in section-02) -- nur der Parallax-Loop
// dafür läuft hier (initDropsParallax()).
// ==========================================================================

function renderSection05(data) {
  if (!data) return;

  const imgEl = document.querySelector("#section-05-image-01");
  const sectionEl = document.querySelector("#section-05-images-drops");
  if (!imgEl || !sectionEl) return;

  const image = (data.images || [])[0];
  if (image) {
    imgEl.src = image.src;
    imgEl.alt = image.alt || "";
  }

  renderLyricsModule(
    {
      linkEl: document.querySelector("#section-05-lyrics-link"),
      linesContainerEl: document.querySelector("#section-05-lyrics-lines"),
      songTitleEl: document.querySelector("#section-05-song-title"),
      songLinkRowEl: document.querySelector("#section-05-images-drops .song-link"),
    },
    data.lyrics
  );

  initFadeInText(sectionEl);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection05(e.detail["section-05-images-drops"]);
});

// Tropfen-Parallax: siehe der EINE konsolidierte Loop weiter unten in
// dieser Datei.


// ==========================================================================
// section-06-text-social — Ankündigungstext aus content.json rendern.
// Gleiches Muster wie renderSection04 (nur Absätze, keine Headline).
// ==========================================================================

function renderSection06Text(data) {
  const container = document.querySelector("#section-06-copy");
  if (!container || !data) return;

  container.innerHTML = "";
  (data.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.classList.add("fade-in-text");
    container.appendChild(p);
  });
  initFadeInText(container);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection06Text(e.detail["section-06-text-social"]);
});

// ==========================================================================
// instagram-module — Insta-Post-Nachbildung (section-06-text-social)
// Komponente: components/instagram-module.css. Übernimmt Handle/Caption/
// Avatar/Follow-Link aus content.json (section-06-text-social.
// instagram_module), danach:
//   - Top-Bar draggable (bewegt das ganze Modul, kein Text-Select)
//   - 8 unsichtbare Resize-Zonen (4 Kanten + 4 Ecken), gegenüberliegende
//     Seite bleibt beim Ziehen exakt stehen
//   - Content-Bereich scrollt "endlos" (3 Kopien der Post-Elemente, Scroll-
//     Position wird beim Erreichen eines Rands unsichtbar zurückgesetzt)
//   - Ab WIDE_BREAKPOINT Modul-Breite: 2 unabhängige Spalten (echtes
//     Masonry statt starrer Grid-Zeilen)
//
// UPDATE (siehe Chat-Verlauf):
//   - Bilder/Videos kommen NICHT mehr aus content.json, sondern werden
//     LIVE aus assets/images/insta/ geladen (GitHub Contents API) --
//     flexible Anzahl, Til muss nur Dateien hochladen/löschen, kein
//     JSON-Edit nötig. Bild vs. Video wird über die Dateiendung erkannt.
//     Videos: muted/loop/autoplay/playsinline, KEINE Controls.
//   - Ergebnis wird 5 Minuten pro Tab in sessionStorage gecacht, um bei
//     mehreren Seitenaufrufen nicht sofort ins GitHub-Rate-Limit
//     (60 Requests/Stunde, unauthentifiziert) zu laufen.
//   - Bleibt die API einmal nicht erreichbar oder ist der Ordner leer,
//     erscheint ein kurzer Empty-State-Hinweis statt eines stillen
//     Fehlers (siehe .insta-empty-state in components/instagram-module.css).
//   - Jedes Bild/Video blendet EINZELN ein, sobald es geladen ist
//     (opacity 0 -> 1 über die Klasse .is-loaded, siehe CSS) -- kein
//     Warten auf die anderen Elemente im Set.
//   - Modul wird ab 768px (siehe tokens-notes.md-Breakpoint) automatisch
//     auf Default-Größe/-Position zurückgesetzt, Drag/Resize deaktiviert
//     (siehe applyMobileReset() unten + die pointer-events-Regel in der CSS).
// ==========================================================================

const INSTA_FOLDER_API = "https://api.github.com/repos/t-i-l/eatme/contents/assets/images/insta";
const INSTA_CACHE_KEY = "eatme-insta-folder-cache";
const INSTA_CACHE_TTL_MS = 5 * 60 * 1000;
const INSTA_IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const INSTA_VIDEO_EXT = ["mp4", "webm", "mov"];

// Fragt den Inhalt von assets/images/insta/ über die GitHub Contents API
// ab (funktioniert nur auf einer echten gehosteten Seite bzw. in einem
// normalen Browser-Tab, nicht in manchen Vorschau-Sandboxes -- siehe
// "Gelernte Lektionen" in ARCHITECTURE.md). Liefert eine flache Liste aus
// { type: "image"|"video", src, alt }, sortiert wie von der API geliefert
// (alphabetisch nach Dateiname).
async function fetchInstaFolder() {
  try {
    const cached = sessionStorage.getItem(INSTA_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < INSTA_CACHE_TTL_MS) return parsed.items;
    }
  } catch (err) {
    // sessionStorage kann in seltenen Kontexten fehlen/blockiert sein --
    // dann einfach live laden, nur der Cache fällt aus.
  }

  const res = await fetch(INSTA_FOLDER_API);
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const listing = await res.json();

  const items = listing
    .filter((entry) => entry.type === "file")
    .map((entry) => {
      const ext = entry.name.split(".").pop().toLowerCase();
      if (INSTA_IMAGE_EXT.includes(ext)) return { type: "image", src: entry.path, alt: entry.name };
      if (INSTA_VIDEO_EXT.includes(ext)) return { type: "video", src: entry.path, alt: entry.name };
      return null;
    })
    .filter(Boolean);

  try {
    sessionStorage.setItem(INSTA_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), items }));
  } catch (err) {
    // Speicher voll o.ä. -- nicht kritisch, betrifft nur den Cache.
  }

  return items;
}

function initInstagramModule(data) {
  const moduleEl = document.getElementById("instagram-module");
  const stageEl = document.getElementById("instagram-module-stage");
  if (!moduleEl || !stageEl || !data) return;

  const MIN_WIDTH = 260;
  const MAX_WIDTH = 800;
  const MIN_HEIGHT = 360;
  const MAX_HEIGHT = 760;
  const WIDE_BREAKPOINT = 460;
  const DEFAULT_STATE = { width: 340, height: 520 };

  // ---- Header-Content aus content.json befüllen ----
  const avatarEl = document.getElementById("instagram-avatar");
  const nameEl = document.getElementById("instagram-handle-name");
  const captionEl = document.getElementById("instagram-handle-caption");
  const headerLinkEl = document.getElementById("instagram-header-link");
  const scrollEl = document.getElementById("instagram-scroll");
  const dragHandle = document.getElementById("instagram-drag-handle");
  const grid = document.getElementById("instagram-grid");

  if (avatarEl && data.avatar_image) avatarEl.src = data.avatar_image;
  if (nameEl) nameEl.textContent = data.handle || "";
  if (captionEl) captionEl.textContent = data.caption || "";
  if (headerLinkEl && data.follow_url) headerLinkEl.href = data.follow_url;
  if (scrollEl && data.follow_url) scrollEl.href = data.follow_url;

  if (!grid || !scrollEl || !dragHandle) return;

  loadInstaPosts(grid, (items) => {
    setupInstagramInteraction({ moduleEl, stageEl, scrollEl, dragHandle, grid, MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT, WIDE_BREAKPOINT, DEFAULT_STATE, postItems: items });
  });
}

// Lädt die Post-Elemente (async, GitHub API) und ruft danach onReady()
// auf -- getrennt von setupInstagramInteraction(), damit Drag/Resize/
// Mobile-Reset auch dann korrekt initialisiert sind, wenn der Ordner
// (noch) leer ist oder die API nicht erreichbar war (Empty-State statt
// komplett fehlender Interaktion).
async function loadInstaPosts(grid, onReady) {
  let postItems = [];
  try {
    postItems = await fetchInstaFolder();
  } catch (err) {
    console.error("Insta-Ordner konnte nicht geladen werden (GitHub API):", err);
  }

  if (!postItems.length) {
    grid.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "insta-empty-state";
    empty.textContent = "Noch keine Instagram-Beiträge verfügbar.";
    grid.appendChild(empty);
    return;
  }

  onReady(postItems);
}

function setupInstagramInteraction({ moduleEl, stageEl, scrollEl, dragHandle, grid, MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT, WIDE_BREAKPOINT, DEFAULT_STATE, postItems: initialPostItems }) {
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  // ---- Position/Größe komplett als px verwaltet (kein zentrierender
  // Container) -- dadurch wächst/schrumpft das Modul beim Resizen nur auf
  // der gezogenen Seite, die gegenüberliegende Kante bleibt exakt stehen. ----
  let state = { left: 0, top: 0, width: DEFAULT_STATE.width, height: DEFAULT_STATE.height };
  let hasInteracted = false; // solange false: Modul bleibt bei Stage-Größenänderungen zentriert

  function centerInStage() {
    const stageRect = stageEl.getBoundingClientRect();
    state.left = Math.round((stageRect.width - state.width) / 2);
    state.top = Math.round((stageRect.height - state.height) / 2);
  }

  function applyState() {
    moduleEl.style.left = `${state.left}px`;
    moduleEl.style.top = `${state.top}px`;
    moduleEl.style.width = `${state.width}px`;
    moduleEl.style.height = `${state.height}px`;
  }

  // Mobile: Modul auf Default-Größe zurücksetzen + neu zentrieren.
  // hasInteracted wird ebenfalls zurückgesetzt, damit es beim Zurück-
  // wechseln zu Desktop wieder frisch zentriert startet.
  function applyMobileReset() {
    state.width = DEFAULT_STATE.width;
    state.height = DEFAULT_STATE.height;
    centerInStage();
    applyState();
    hasInteracted = false;
  }

  if (mobileQuery.matches) applyMobileReset();
  else {
    centerInStage();
    applyState();
  }

  // Beim Über-/Unterschreiten des 768px-Breakpoints während der Sitzung
  // (z.B. Fenster resizen, Gerät drehen).
  mobileQuery.addEventListener("change", (e) => {
    if (e.matches) applyMobileReset();
    else {
      centerInStage();
      applyState();
    }
  });

  // Sonstige Fenster-Größenänderungen (ohne Breakpoint-Wechsel): nur neu
  // zentrieren, solange der Mensch das Modul noch nicht selbst bewegt/
  // resized hat, und nicht im Mobile-Zustand (dort regelt applyMobileReset).
  window.addEventListener("resize", () => {
    if (hasInteracted || mobileQuery.matches) return;
    centerInStage();
    applyState();
  });

  // Erstellt ein Bild- oder Video-Element für den Endlos-Grid. Beide
  // Medientypen bekommen die Klasse .insta-media (Basis-Fade-Styling,
  // siehe CSS) und blenden individuell ein, sobald sie geladen sind --
  // "load"/"error" bei <img>, "loadeddata"/"error" bei <video> (erst wenn
  // der erste Frame steht, kein schwarzes Flackern).
  function revealWhenLoaded(el) {
    const reveal = () => el.classList.add("is-loaded");
    if (el.tagName === "IMG") {
      if (el.complete) reveal();
      else {
        el.addEventListener("load", reveal, { once: true });
        el.addEventListener("error", reveal, { once: true });
      }
    } else if (el.tagName === "VIDEO") {
      if (el.readyState >= 2) reveal(); // HAVE_CURRENT_DATA
      else {
        el.addEventListener("loadeddata", reveal, { once: true });
        el.addEventListener("error", reveal, { once: true });
      }
    }
  }

  // Für die initiale Höhenmessung/Spalten-Ausgleich (measureAndReset/
  // equalizeColumns) muss gewartet werden, bis alle Medien ihre
  // intrinsischen Maße kennen -- unabhängig vom individuellen Fade-in.
  function waitForMedia(el) {
    return new Promise((resolve) => {
      if (el.tagName === "IMG") {
        if (el.complete) resolve();
        else {
          el.addEventListener("load", resolve, { once: true });
          el.addEventListener("error", resolve, { once: true });
        }
      } else if (el.tagName === "VIDEO") {
        if (el.readyState >= 1) resolve(); // HAVE_METADATA
        else {
          el.addEventListener("loadedmetadata", resolve, { once: true });
          el.addEventListener("error", resolve, { once: true });
        }
      } else resolve();
    });
  }

  function makeMediaEl(item) {
    const wrap = document.createElement("div");
    wrap.className = "insta-image";

    if (item.type === "video") {
      const video = document.createElement("video");
      video.className = "insta-media";
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", ""); // iOS-Safari braucht das Attribut zusätzlich zur Property
      video.preload = "auto";
      revealWhenLoaded(video);
      wrap.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "insta-media";
      img.src = item.src;
      img.alt = item.alt || "";
      img.draggable = false;
      revealWhenLoaded(img);
      wrap.appendChild(img);
    }
    return wrap;
  }

  // ---- Grid-Aufbau: 3 "Sets" (Kopien der Post-Elemente) für den Endlos-
  // Loop. Schmal: jedes Set eine einzelne vertikale Liste. Breit: jedes
  // Set eine Reihe aus 2 unabhängigen Spalten (Elemente wechselseitig
  // verteilt) -- kein Element zwingt das andere mehr in eine gemeinsame
  // Zeilenhöhe. ----
  let isWide = false;
  let postItems = initialPostItems || [];

  function renderGrid() {
    grid.innerHTML = "";
    for (let copy = 0; copy < 3; copy++) {
      const setEl = document.createElement("div");
      setEl.className = "insta-set" + (isWide ? " is-row" : "");

      if (isWide) {
        const col0 = document.createElement("div");
        col0.className = "insta-col";
        const col1 = document.createElement("div");
        col1.className = "insta-col";
        postItems.forEach((item, i) => {
          (i % 2 === 0 ? col0 : col1).appendChild(makeMediaEl(item));
        });
        setEl.appendChild(col0);
        setEl.appendChild(col1);
      } else {
        postItems.forEach((item) => {
          setEl.appendChild(makeMediaEl(item));
        });
      }

      grid.appendChild(setEl);
    }
  }

  // ---- Gleicht pro Set die Gesamthöhe beider Spalten aus: NUR das
  // letzte Element der kürzeren Spalte wird um die fehlende Differenz
  // gestreckt (object-fit:cover, siehe .is-stretched in der CSS) -- kein
  // zusätzliches Spacer-Element, das würde den Gap am Set-Übergang
  // aufblähen. Vor jeder Neuberechnung wird eine vorherige Streckung
  // zurückgesetzt (wichtig bei Live-Resize). ----
  function resetStretch() {
    grid.querySelectorAll(".insta-image.is-stretched").forEach((el) => {
      el.classList.remove("is-stretched");
      el.style.height = "";
    });
  }

  function equalizeColumns() {
    resetStretch();
    if (!isWide) return;

    grid.querySelectorAll(".insta-set.is-row").forEach((setEl) => {
      const cols = setEl.querySelectorAll(".insta-col");
      if (cols.length !== 2) return;

      const h0 = cols[0].getBoundingClientRect().height;
      const h1 = cols[1].getBoundingClientRect().height;
      const diff = Math.round(Math.abs(h0 - h1));
      if (diff <= 0) return;

      const shorterCol = h0 < h1 ? cols[0] : cols[1];
      const lastEl = shorterCol.lastElementChild;
      if (!lastEl || !lastEl.classList.contains("insta-image")) return;

      const currentHeight = lastEl.getBoundingClientRect().height;
      lastEl.style.height = `${currentHeight + diff}px`;
      lastEl.classList.add("is-stretched");
    });
  }

  // ---- Endloser Scroll: Start-Position liegt am Anfang der mittleren der
  // 3 Kopien. Nähert man sich oben/unten der Kante, wird die Scroll-
  // Position per JS unsichtbar (kein smooth-behavior) um exakt eine
  // Kopien-Höhe zurückgesetzt -> fühlt sich endlos an, ohne dass der DOM
  // unendlich wächst. ----
  let setHeight = 0;

  function measureAndReset() {
    setHeight = grid.scrollHeight / 3;
    scrollEl.scrollTop = setHeight;
  }

  let rafPending = false;
  function scheduleRefresh() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const nowWide = moduleEl.getBoundingClientRect().width >= WIDE_BREAKPOINT;
      if (nowWide !== isWide) {
        isWide = nowWide;
        renderGrid();
      }
      equalizeColumns();
      measureAndReset();
    });
  }

  function bootstrapGrid(items) {
    postItems = items;
    renderGrid();

    const mediaEls = Array.from(grid.querySelectorAll("img, video"));
    Promise.all(mediaEls.map(waitForMedia)).then(() => scheduleRefresh());

    const layoutObserver = new ResizeObserver(() => scheduleRefresh());
    layoutObserver.observe(moduleEl);
  }

  scrollEl.addEventListener("scroll", () => {
    if (!setHeight) return;
    if (scrollEl.scrollTop <= 0) {
      scrollEl.scrollTop += setHeight;
    } else if (scrollEl.scrollTop >= setHeight * 2) {
      scrollEl.scrollTop -= setHeight;
    }
  });

  // ---- Drag: nur über die Top-Bar, bewegt das Modul per left/top (px).
  // Auf Mobile (<=768px) deaktiviert -- siehe mobileQuery-Check am Anfang
  // jedes Handlers, zusätzlich zur pointer-events:none-Regel in der CSS
  // für die Resize-Zonen. preventDefault() im pointerdown verhindert
  // zusätzlich, dass der Browser beim Ziehen über den Text eine Auswahl
  // startet. ----
  let dragState = null;

  dragHandle.addEventListener("pointerdown", (e) => {
    if (mobileQuery.matches) return;
    e.preventDefault();
    hasInteracted = true;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      originLeft: state.left,
      originTop: state.top,
      pointerId: e.pointerId,
    };
    dragHandle.setPointerCapture(e.pointerId);
    moduleEl.classList.add("is-dragging");
  });

  dragHandle.addEventListener("pointermove", (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    state.left = dragState.originLeft + (e.clientX - dragState.startX);
    state.top = dragState.originTop + (e.clientY - dragState.startY);
    applyState();
  });

  function endDrag(e) {
    if (!dragState || (e.pointerId !== undefined && e.pointerId !== dragState.pointerId)) return;
    dragState = null;
    moduleEl.classList.remove("is-dragging");
  }

  dragHandle.addEventListener("pointerup", endDrag);
  dragHandle.addEventListener("pointercancel", endDrag);

  // ---- Resize: 4 Kanten + 4 Ecken (siehe .resize-edge/.resize-corner in
  // der CSS). Auf Mobile ebenfalls deaktiviert (mobileQuery-Check). Die
  // gegenüberliegende Seite bleibt IMMER exakt an ihrer Bildschirm-
  // position stehen -- auch bei MIN_/MAX_-Clamping, weil left/top aus der
  // bereits geclampten Breite/Höhe zurückgerechnet werden (nicht aus dem
  // rohen Maus-Delta). ----
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const resizeHandles = moduleEl.querySelectorAll(".resize-edge, .resize-corner");

  resizeHandles.forEach((handle) => {
    const dir = handle.dataset.dir;
    let resizeState = null;

    handle.addEventListener("pointerdown", (e) => {
      if (mobileQuery.matches) return;
      e.preventDefault();
      hasInteracted = true;
      resizeState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: state.left,
        startTop: state.top,
        startWidth: state.width,
        startHeight: state.height,
        pointerId: e.pointerId,
      };
      handle.setPointerCapture(e.pointerId);
      moduleEl.classList.add("is-resizing");
    });

    handle.addEventListener("pointermove", (e) => {
      if (!resizeState || e.pointerId !== resizeState.pointerId) return;
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;

      let { left, top, width, height } = {
        left: resizeState.startLeft,
        top: resizeState.startTop,
        width: resizeState.startWidth,
        height: resizeState.startHeight,
      };

      if (dir.includes("e")) {
        width = clamp(resizeState.startWidth + dx, MIN_WIDTH, MAX_WIDTH);
      }
      if (dir.includes("w")) {
        width = clamp(resizeState.startWidth - dx, MIN_WIDTH, MAX_WIDTH);
        left = resizeState.startLeft + (resizeState.startWidth - width);
      }
      if (dir.includes("s")) {
        height = clamp(resizeState.startHeight + dy, MIN_HEIGHT, MAX_HEIGHT);
      }
      if (dir.includes("n")) {
        height = clamp(resizeState.startHeight - dy, MIN_HEIGHT, MAX_HEIGHT);
        top = resizeState.startTop + (resizeState.startHeight - height);
      }

      state = { left, top, width, height };
      applyState();
    });

    function endResize(e) {
      if (!resizeState || (e.pointerId !== undefined && e.pointerId !== resizeState.pointerId)) return;
      resizeState = null;
      moduleEl.classList.remove("is-resizing");
    }

    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);
  });

  bootstrapGrid(postItems);
}

document.addEventListener("eatme:content-ready", (e) => {
  initInstagramModule(e.detail["section-06-text-social"]?.instagram_module);
});

// ==========================================================================
// section-07-footer — Songtext-Modul über die gemeinsame
// renderLyricsModule() befüllen (siehe section-03/05 oben), Booking-CTA
// (Mailto-Text-Link) aus content.json (cta_text/cta_link) setzen,
// Fade-In-Registrierung. scribble-sm/scribble-lg sind NICHT
// content.json-gesteuert (rein dekorativ, fixe Pfade direkt im Markup,
// gleiches Prinzip wie die blauen Vögel/Tropfen in section-02/05) -- kein
// Parallax für die Scribbles, da für diese Sektion nicht gewünscht.
// ==========================================================================

// Rendert den Booking-CTA-Text mit einem <br class="footer-cta-break">
// GENAU nach dem ersten Wort ("Open" bei "Open for Booking") -- der Umbruch
// selbst ist per CSS standardmäßig unsichtbar (display:none) und wird erst
// ab dem 768px-Breakpoint aktiv (display:inline), siehe
// sections/section-07-footer.css. Bewusst am ersten Wort statt hart am
// String "Open" -- funktioniert dadurch unverändert weiter, falls der
// CTA-Text in content.json später mal geändert wird.
function renderFooterCta(ctaEl, text) {
  ctaEl.innerHTML = "";
  if (!text) return;

  const firstSpaceIndex = text.indexOf(" ");
  if (firstSpaceIndex === -1) {
    ctaEl.textContent = text;
    return;
  }

  // Leerzeichen bewusst am ENDE des ersten Textknotens (statt am Anfang
  // des zweiten) -- Bugfix: bei display:none auf .footer-cta-break (Desktop)
  // hätte ein am Anfang des zweiten Knotens sitzendes Leerzeichen zwischen
  // "Open" und "for" gefehlt (der Space wurde beim Splitten sonst nur an
  // den <br> "verschoben", der auf Desktop unsichtbar ist -- Leerzeichen
  // ging dadurch optisch komplett verloren). So bleibt der Space auch bei
  // ausgeblendetem <br> erhalten, UND es entsteht auf Mobile kein
  // unschöner eingerückter Zeilenanfang bei "for Booking".
  ctaEl.appendChild(document.createTextNode(text.slice(0, firstSpaceIndex + 1)));
  const breakEl = document.createElement("br");
  breakEl.className = "footer-cta-break";
  ctaEl.appendChild(breakEl);
  ctaEl.appendChild(document.createTextNode(text.slice(firstSpaceIndex + 1)));
}

function renderSection07(data) {
  if (!data) return;

  const sectionEl = document.querySelector("#section-07-footer");
  const ctaEl = document.querySelector("#section-07-cta");
  if (!sectionEl || !ctaEl) return;

  renderLyricsModule(
    {
      linkEl: document.querySelector("#section-07-lyrics-link"),
      linesContainerEl: document.querySelector("#section-07-lyrics-lines"),
      songTitleEl: document.querySelector("#section-07-song-title"),
      songLinkRowEl: document.querySelector("#section-07-footer .song-link"),
    },
    data.lyrics
  );

  ctaEl.href = data.cta_link || "#";
  renderFooterCta(ctaEl, data.cta_text);
  // Bewusst KEIN .fade-in-text auf dem CTA (siehe Feedback-Verlauf): der
  // gemeinsame IntersectionObserver (initFadeInText()) setzt pro Element
  // zusätzlich per Inline-Style ein individuelles transitionDelay (Stagger),
  // das JEDE CSS-Transition-Regel schlägt -- unabhängig von Spezifität,
  // Inline-Style gewinnt immer. Das war der eigentliche Grund für den
  // "verzögerten"/"verbuggten" Hover, nicht nur die transition-duration.
  // Der CTA bekommt daher nur den eigenen Hover (siehe
  // sections/section-07-footer.css), keinen Scroll-Reveal.

  initFadeInText(sectionEl);
}

document.addEventListener("eatme:content-ready", (e) => {
  renderSection07(e.detail["section-07-footer"]);
});

// ==========================================================================
// eatme-footer — Mailto (links) + Link zur Imprint/Datenschutz-Seite
// (rechts) aus content.json befüllen. Rein statisch, kein Parallax/Fade-In
// nötig -- kleine Pill-Bar ohne eigene Sichtbarkeits-Logik.
// ==========================================================================

function renderFooterBar(data) {
  if (!data) return;

  const contactLink = document.querySelector("#footer-contact-link");
  const legalLink = document.querySelector("#footer-legal-link");
  if (!contactLink || !legalLink) return;

  if (data.contact_email) {
    contactLink.href = `mailto:${data.contact_email}`;
    contactLink.textContent = data.contact_email;
  }

  if (data.footer_link_href) {
    legalLink.href = data.footer_link_href;
  }
  if (data.footer_link_label) {
    legalLink.textContent = data.footer_link_label;
  }
}

document.addEventListener("eatme:content-ready", (e) => {
  renderFooterBar(e.detail["section-07-footer"]);
});

// ==========================================================================
// Cloud-Shader (WebGL) — ersetzt das lange clouds.webp-Bitmap in .bg-cloud.
//
// Hintergrund/Perf-Fix im Detail: siehe Kommentarblock in styles.css
// ("Sitewide Himmel-Hintergrund"). Kurzfassung: das alte Bild wurde bei
// jedem Scroll-Frame per CSS-Transform bewegt (Safari musste die riesige
// Flaeche neu rastern/kompositieren -> Ruckeln). Der Canvas hier bleibt
// stattdessen komplett unbewegt (Transform bleibt fuer immer bei
// translate3d(-50%,0,0)) -- der Scroll-Parallax passiert stattdessen als
// Uniform-Wert INNERHALB des Shaders.
//
// Optik/Kalibrierung: Die Regler-Werte (Coverage, Warp etc.) sind
// dieselben wie beim section-01-Stage-Cloud-Shader, kalibriert anhand des
// Figma-Shader-Fills (Node 3:3664, per MCP ausgelesen) fuer einen
// konsistenten Look. Fuer DIESES konkrete Asset (clouds.webp) liegt mir
// kein eigener Figma-Node vor -- die Werte sind also eine bewusste
// Wiederverwendung fuer Konsistenz, keine 1:1-Kalibrierung dieses
// speziellen Bilds. Bei Bedarf einzeln in BG_CLOUD_PARAMS nachjustierbar.
// ==========================================================================

function hexToRgbFloat(hex) {
  const clean = hex.replace("#", "").trim();
  const bigint = parseInt(clean.slice(0, 6), 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

function readToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const CLOUD_VERTEX_SRC = `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const CLOUD_FRAGMENT_SRC = `
  precision highp float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform float uCoverage;
  uniform float uDensity;
  uniform float uBrightness;
  uniform float uDetail;
  uniform float uVariation;
  uniform float uWarpAmount;
  uniform float uWarpScale;
  uniform float uStretch;
  uniform float uPhase;
  uniform float uRadius;
  uniform float uDrift;
  uniform float uRise;
  uniform float uEdgeFade; // 0 = aus, 1 = weicher Rand oben/unten (fuer .bg-cloud)

  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uCloudLight;
  uniform vec3 uCloudShadow;
  uniform vec3 uFadeColor;

  // Standard value-noise + fBm -- oeffentlich bekannte Technik, keine
  // Figma-interne Formel (Figma liefert fuer Custom-Shader-Fills nur
  // Metadaten, keinen Rohquellcode).
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 78.233);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p, float persistence) {
    float value = 0.0;
    float amplitude = 0.5;
    // 4 statt 6 Oktaven -- der Shader ruft fbm() 5x pro Pixel auf
    // (Density, 2x Warp, Variation, Schatten), jede Oktave weniger spart
    // hier ca. 1/6 aller noise()-Aufrufe. Bei einer weichen Wolkentextur
    // optisch kaum ein Unterschied, GPU-seitig aber spuerbar (siehe
    // Chat-Feedback: "ruckelt immer noch").
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= persistence;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Aspect-Korrektur: verhindert, dass das Wolkenmuster beim Resize
    // gestaucht/gequetscht wird.
    float aspect = uResolution.x / uResolution.y;
    vec2 uvAspect = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);

    vec2 center = vec2(0.5, 0.5);
    float angle = 0.0;
    vec2 centered = uvAspect - center;
    float ca = cos(angle), sa = sin(angle);
    vec2 rotated = vec2(ca * centered.x - sa * centered.y, sa * centered.x + ca * centered.y) + center;

    float stretchFactor = 1.0 + uStretch / 6.0;
    vec2 p = vec2(rotated.x, rotated.y / stretchFactor) * 3.0;

    p.x += uTime * (uDrift / 100.0) * 0.05 + uPhase * 0.03;
    // MINUS hier (nicht Plus): beim Runterscrollen soll das Muster nach
    // OBEN wandern (wie der Rest der Seite, nur langsamer) -- mit Plus
    // wanderte es faelschlich nach unten (falsche Richtung, siehe
    // Chat-Feedback).
    p.y -= uScroll * 0.0006;
    p.y += uTime * (uRise / 100.0) * 0.02;

    float persistence = mix(0.35, 0.65, uDetail / 100.0);

    float variationField = fbm(p * 0.35 + 2.0, persistence) * (uVariation / 100.0);
    p += variationField * 0.6;

    vec2 warpP = p * (uWarpScale / 6.0);
    vec2 warp = vec2(
      fbm(warpP + vec2(1.7, 9.2), persistence),
      fbm(warpP + vec2(8.3, 2.8), persistence)
    );
    float warpAmount = uWarpAmount / 100.0;
    float densityField = fbm(p + warp * warpAmount * 2.0, persistence);

    float coverage = uCoverage / 100.0;
    float edge = max(1.0 - uDensity / 100.0, 0.03) * 0.4;
    float mask = smoothstep(coverage - edge, coverage + edge, densityField);

    float distFromCenter = length(centered) * 1.6;
    float radiusFalloff = smoothstep(uRadius / 100.0 + 0.5, uRadius / 100.0 - 0.15, distFromCenter);
    mask *= mix(0.85, 1.0, radiusFalloff);

    float shadowDetail = fbm(p * 2.3 + 4.0, persistence);
    float shadowMask = smoothstep(0.35, 0.75, shadowDetail) * mask;

    vec3 sky = mix(uSkyBottom, uSkyTop, uv.y);
    vec3 cloud = mix(uCloudLight, uCloudShadow, shadowMask);

    vec3 color = mix(sky, cloud, mask);
    color *= (uBrightness / 70.0);

    // Weicher Rand oben/unten (ersetzt den frueher ins clouds.webp
    // eingebackenen Alpha-Fade) -- blendet Richtung Seiten-Weiss statt
    // echter Transparenz, da .page-background ohnehin weiss ist.
    float fadeFraction = 0.11; // ~500px von 4658px Original-Bildhoehe
    float topFade = smoothstep(0.0, fadeFraction, uv.y);
    float bottomFade = smoothstep(0.0, fadeFraction, 1.0 - uv.y);
    float edgeFadeAmount = mix(1.0, topFade * bottomFade, uEdgeFade);
    color = mix(uFadeColor, color, edgeFadeAmount);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Cloud-Shader-Compile-Fehler:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Gemeinsame Farb-Uniforms fuer beide Cloud-Shader-Instanzen (section-01
// Stage + sitewide .bg-cloud) -- aus tokens.css gelesen statt Hex-Werte
// zu duplizieren.
function readCloudColors() {
  return {
    skyTop: hexToRgbFloat(readToken("--gradient-sky-top")),
    skyBottom: hexToRgbFloat(readToken("--gradient-sky-bottom")),
    cloudLight: hexToRgbFloat(readToken("--color-cloud-light")),
    cloudShadow: hexToRgbFloat(readToken("--color-blue")),
    fadeColor: hexToRgbFloat(readToken("--color-white")),
  };
}

// Fabrik: erzeugt einen unabhaengigen WebGL-Cloud-Shader auf dem
// uebergebenen Canvas. params = feste Parameter (Coverage, Warp etc.,
// siehe CLOUD_FRAGMENT_SRC), edgeFade = true/false (weicher Rand
// oben/unten, nur fuer .bg-cloud gedacht).
function initCloudShader(canvas, params, edgeFade, renderScale) {
  const scale = renderScale || 1; // < 1 = intern in niedrigerer Aufloesung rendern, CSS skaliert visuell wieder hoch
  // antialias:false -- wir zeichnen nur EIN bildschirmfuellendes Rechteck,
  // es gibt keine internen Polygonkanten zu glaetten. MSAA/Supersampling
  // kostet hier nur zusaetzliche Rechenzeit ohne sichtbaren Nutzen (im
  // Gegensatz zu einer Aufloesungs-Reduktion aendert das NICHTS am
  // sichtbaren Detailgrad).
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false }) ||
             canvas.getContext("experimental-webgl");
  if (!gl) {
    console.warn("WebGL nicht verfuegbar -- Cloud-Shader wird uebersprungen (CSS-Fallback greift, siehe styles.css).");
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, CLOUD_VERTEX_SRC));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, CLOUD_FRAGMENT_SRC));
  gl.linkProgram(program);
  gl.useProgram(program);

  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  [
    "uResolution", "uTime", "uScroll", "uCoverage", "uDensity", "uBrightness",
    "uDetail", "uVariation", "uWarpAmount", "uWarpScale", "uStretch", "uPhase",
    "uRadius", "uDrift", "uRise", "uEdgeFade",
    "uSkyTop", "uSkyBottom", "uCloudLight", "uCloudShadow", "uFadeColor",
  ].forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

  const colors = readCloudColors();
  gl.uniform3fv(u.uSkyTop, colors.skyTop);
  gl.uniform3fv(u.uSkyBottom, colors.skyBottom);
  gl.uniform3fv(u.uCloudLight, colors.cloudLight);
  gl.uniform3fv(u.uCloudShadow, colors.cloudShadow);
  gl.uniform3fv(u.uFadeColor, colors.fadeColor);

  gl.uniform1f(u.uCoverage, params.coverage);
  gl.uniform1f(u.uDensity, params.density);
  gl.uniform1f(u.uBrightness, params.brightness);
  gl.uniform1f(u.uDetail, params.detail);
  gl.uniform1f(u.uVariation, params.variation);
  gl.uniform1f(u.uWarpAmount, params.warpAmount);
  gl.uniform1f(u.uWarpScale, params.warpScale);
  gl.uniform1f(u.uStretch, params.stretch);
  gl.uniform1f(u.uPhase, params.phase);
  gl.uniform1f(u.uRadius, params.radius);
  gl.uniform1f(u.uDrift, params.drift);
  gl.uniform1f(u.uRise, params.rise);
  gl.uniform1f(u.uEdgeFade, edgeFade ? 1.0 : 0.0);

  // Resize NUR bei echten Breiten-Aenderungen (nicht pro Frame, und NICHT
  // bei reinen Hoehen-Aenderungen) -- Safari feuert "resize"-Events, wenn
  // beim Scrollen die Adressleiste ein-/ausblendet (keine echte Layout-
  // Aenderung, nur die sichtbare Viewport-Hoehe aendert sich kurzzeitig).
  // Ohne diese Absicherung wuerde JEDES Scrollen auf iOS Safari hier
  // wiederholt clientWidth/clientHeight auslesen (erzwingt synchrones
  // Layout) -- exakt dasselbe Problem, das handleResize() weiter unten
  // fuer den Anker bereits kennt und abfaengt, hier aber bisher NICHT
  // abgesichert war. Sehr wahrscheinliche Teilursache fuers gemeldete
  // Restruckeln.
  let lastCanvasViewportWidth = window.innerWidth;
  function doResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
    }
  }
  function resize() {
    if (window.innerWidth === lastCanvasViewportWidth) return; // nur Hoehe geaendert (Safari-Toolbar) -> ignorieren
    lastCanvasViewportWidth = window.innerWidth;
    doResize();
  }
  window.addEventListener("resize", resize);
  doResize(); // initiale Groesse IMMER setzen, unabhaengig vom Breiten-Guard oben

  const start = performance.now();

  return {
    // scrollValue: bereits gewichteter Scroll-/Drift-Rohwert (siehe
    // Aufrufer unten) -- kein zusaetzlicher Layout-Read hier drin.
    render(scrollValue) {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(u.uTime, t);
      gl.uniform1f(u.uScroll, scrollValue);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}

// Parameter 1:1 aus dem Figma-Shader-Fill-Panel (Node 3:3664) uebernommen,
// siehe Kommentarblock oben. .bg-cloud ist die einzige Stelle, die diesen
// Shader aktuell nutzt -- section-01 (.stage-bg) bleibt bewusst beim
// Original-Bild + CLOUD_SPEED-Transform (siehe Loop unten), das war nie
// das eigentliche Ruckel-Problem.
const BG_CLOUD_PARAMS = {
  // Gleiche Optik/Regler-Werte wie beim Stage-Shader fuer einen
  // konsistenten Look (siehe Kommentarblock oben -- kein eigener
  // Figma-Node fuer dieses konkrete Asset).
  // Drift jetzt aktiv (dezenter Wert, 15 statt section-01s 30 -- diese
  // Cloud ist grossflaechiger/langsamer): kostet KEINE zusaetzliche
  // Performance, die Drift-Rechnung laeuft im Shader ohnehin immer mit,
  // vorher war der Wert nur 0 (= wirkungslos, aber nicht "billiger").
  coverage: 52, density: 50, brightness: 70, detail: 55, variation: 100,
  warpAmount: 100, warpScale: 6, stretch: 0, phase: 12, radius: 60,
  drift: 15, rise: 0,
};

const bgCloudCanvas = document.getElementById("bg-cloud-canvas");
// renderScale zurueck auf volle Aufloesung (1): Til testet auf einem
// MacBook Pro M1, dessen GPU einen einzelnen Fullscreen-Noise-Shader
// muehelos in voller Aufloesung schafft -- die vorherige Reduktion (0.45)
// basierte auf einer GPU-Last-Theorie, die durch Tils praezisere
// Beobachtung widerlegt wird: NUR die Wolken-Bewegung selbst wirkt
// ruckelig, alle anderen JS-Parallax-Ebenen (selber rAF-Loop, selbes
// scrollY) bleiben butterweich. Waere es ein Framerate-/Timing-Problem,
// wuerde das gleichermaessig ALLES betreffen. Sehr wahrscheinlicher Grund
// stattdessen: bei niedriger interner Aufloesung + kontinuierlicher
// Scroll-Bewegung entsteht ein sichtbar "gestufter"/ruckeliger Look rein
// durchs grobe Pixelraster -- unabhaengig von der tatsaechlichen
// Framerate. Falls sich das jetzt als Ursache bestaetigt, koennen wir bei
// Bedarf einen Mittelweg (z.B. 0.75) fuer schwaechere Geraete finden.
const bgCloudShader = bgCloudCanvas ? initCloudShader(bgCloudCanvas, BG_CLOUD_PARAMS, true, 1) : null;

// ==========================================================================
// KONSOLIDIERTER Parallax-Loop -- ersetzt die vorher getrennten rAF-Loops
// (Stage, section-02-Vögel, section-03-Bilder, Tropfen, Cloud).
// Grund: jeder einzelne Loop rief für sich getBoundingClientRect() auf und
// schrieb direkt danach einen style.transform -- mehrere solcher
// Lese-Schreib-Paare INNERHALB DESSELBEN Frames zwingen den Browser
// wiederholt zu synchronen Layout-Reflows (Chrome verkraftet das
// offenbar gut, Safari deutlich schlechter -> sichtbares Ruckeln dort,
// obwohl Chrome smooth blieb). Fix: ALLE Reads zuerst (in einem Block),
// DANN alle Writes -- pro Frame maximal ein Layout-Read-Durchgang, keine
// verschachtelten Lese-/Schreibzyklen mehr.
// ==========================================================================

(function () {
  const stageEl = document.querySelector("#section-01-stage .stage");
  const stageBirdsEl = document.querySelector("#section-01-stage .stage-birds");
  const stageCloudEl = document.querySelector("#section-01-stage .stage-bg");

  const section02El = document.querySelector("#section-02-text-01");
  const birdLgEl = document.querySelector("#section-02-text-01 .bird-blue-lg");
  const birdSmEl = document.querySelector("#section-02-text-01 .bird-blue-sm");

  const section03El = document.querySelector("#section-03-images");
  const section03Img1El = document.querySelector("#section-03-image-01");
  const section03Img2El = document.querySelector("#section-03-image-02");

  const section05El = document.querySelector("#section-05-images-drops");
  const dropsCanvas = document.querySelector("#drops-canvas");

  const section07El = document.querySelector("#section-07-footer");

  const bgCloudEl = document.querySelector(".bg-cloud");

  const BIRDS_SPEED = 0.6;
  const CLOUD_SPEED = 0.3;
  const BIRD_LG_PARALLAX = 0.06;
  const BIRD_SM_PARALLAX = 0.025;
  const IMG1_PARALLAX = 0.05;
  const IMG2_PARALLAX = 0.09;
  const DROP_PARALLAX_BY_SIZE = { "24": 0.035, "40": 0.09 };

  // ==========================================================================
  // Tropfen (section-05) -- seit 25.08.2026 EIN <canvas> statt 28 einzelner
  // DOM-Elemente. Til hat per Web-Inspector-Aufnahme UND gezieltem Testen
  // (Bilder gegen ein simples SVG austauschen, will-change entfernen,
  // Gruppierung in 4 Wrapper) verifiziert, dass keiner dieser Zwischenschritte
  // ausreichte -- die schiere ANZAHL an DOM-Elementen war der Kostenfaktor,
  // unabhaengig von Bild-Inhalt oder Compositor-Hints. Alle Positions-/
  // Groessen-/Bild-Werte unten sind 1:1 aus dem alten Markup uebernommen
  // (siehe Kommentar in index.html), nur das Render-Verfahren ist neu.
  //
  // Desktop: left/top in % (relativ zur Sektionsgroesse). Mobile: left in %,
  // top in FESTEN px (war im alten Markup schon so gemischt, siehe
  // ARCHITECTURE.md Details section-05 -- unveraendert uebernommen).
  const DESKTOP_DROPS = [
    { leftPct: 49.786, topPct: 27.019, size: 24, img: "01" },
    { leftPct: 40.887, topPct: 58.617, size: 24, img: "01" },
    { leftPct: 63.465, topPct: 82.620, size: 24, img: "02" },
    { leftPct: 53.379, topPct: 65.090, size: 24, img: "02" },
    { leftPct: 53.222, topPct: 46.400, size: 24, img: "02" },
    { leftPct: 48.433, topPct: 39.647, size: 24, img: "02" },
    { leftPct: 32.260, topPct: 37.033, size: 24, img: "02" },
    { leftPct: 24.987, topPct: 68.216, size: 24, img: "03" },
    { leftPct: 25.629, topPct: 12.325, size: 24, img: "04" },
    { leftPct: 66.861, topPct: 41.836, size: 24, img: "04" },
    { leftPct: 33.972, topPct: 44.876, size: 24, img: "04" },
    { leftPct: 53.178, topPct: 30.454, size: 40, img: "01" },
    { leftPct: 42.516, topPct: 32.414, size: 40, img: "01" },
    { leftPct: 32.805, topPct: 59.001, size: 40, img: "02" },
    { leftPct: 5.313, topPct: 34.857, size: 40, img: "02" },
    { leftPct: 48.535, topPct: 71.401, size: 40, img: "03" },
    { leftPct: 65.613, topPct: 75.780, size: 40, img: "03" },
    { leftPct: 41.522, topPct: 45.717, size: 40, img: "03" },
    { leftPct: 74.852, topPct: 67.888, size: 40, img: "04" },
  ];
  const MOBILE_DROPS = [
    { leftPct: 78, topPx: 110, size: 24, img: "01" },
    { leftPct: 87, topPx: 250, size: 24, img: "03" },
    { leftPct: 68, topPx: 335, size: 24, img: "04" },
    { leftPct: 45, topPx: 450, size: 24, img: "02" },
    { leftPct: 28, topPx: 520, size: 24, img: "04" },
    { leftPct: 58, topPx: 545, size: 24, img: "01" },
    { leftPct: 58, topPx: 170, size: 40, img: "02" },
    { leftPct: 12, topPx: 405, size: 40, img: "01" },
    { leftPct: 74, topPx: 475, size: 40, img: "03" },
  ];

  function initDropsCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Die 4 Tropfen-Bilder EINMAL laden und wiederverwenden (nicht wie
    // vorher 28 einzelne <img>-Elemente, aber dieselben 4 Dateien).
    const images = {};
    ["01", "02", "03", "04"].forEach((n) => {
      const im = new Image();
      im.src = `assets/visuals/drops/${n}.png`;
      images[n] = im;
    });

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastViewportWidth = window.innerWidth;

    function doResize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    function resize() {
      // Safari feuert "resize", wenn beim Scrollen die Adressleiste
      // ein-/ausblendet (reine Hoehen-Aenderung) -- ignorieren, gleiches
      // Muster wie beim Cloud-Canvas (siehe initCloudShader() oben).
      if (window.innerWidth === lastViewportWidth) return;
      lastViewportWidth = window.innerWidth;
      doResize();
    }
    window.addEventListener("resize", resize);
    doResize();

    return {
      resync: doResize,
      // offsetsBySize: { "24": pxOffset, "40": pxOffset } -- aktueller
      // Parallax-Versatz in CSS-Pixeln, bereits mit dem jeweiligen
      // Groessen-Faktor gewichtet, siehe Aufrufer unten.
      render(offsetsBySize) {
        const cssWidth = canvas.width / dpr;
        const cssHeight = canvas.height / dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssWidth, cssHeight);

        const isMobile = window.innerWidth <= 768;
        const drops = isMobile ? MOBILE_DROPS : DESKTOP_DROPS;

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          const img = images[d.img];
          if (!img || !img.complete || img.naturalWidth === 0) continue; // noch nicht geladen -> diesen Frame ueberspringen, kein Fehler
          const x = (d.leftPct / 100) * cssWidth;
          const y = d.topPx !== undefined ? d.topPx : (d.topPct / 100) * cssHeight;
          const offsetY = offsetsBySize[d.size] || 0;
          ctx.drawImage(img, x, y + offsetY, d.size, d.size);
        }
      },
    };
  }

  const dropsCanvasHandle = dropsCanvas ? initDropsCanvas(dropsCanvas) : null;

  // Wie stark die Cloud dem normalen Scroll folgt: 0 = steht komplett
  // still, 1 = bewegt sich exakt wie ein normales, nicht-parallaxtes
  // Element, >1 = bewegt sich sogar staerker/schneller als der Rest der
  // Seite. Test mit 0.4 hat das Ruckeln NICHT behoben (siehe Chat) --
  // war also nicht die Ursache, daher zurueck auf 1.4.
  const CLOUD_DRIFT_STRENGTH = 1.4;
  const CLOUD_FADE_DISTANCE_PX = 400; // Strecke, über die die Cloud weich ein-/ausblendet

  let cloudFadeInDocTop = 0;
  let cloudFadeOutDocTop = 0;

  // Grobe Sichtbarkeits-Vorpruefung: Dokument-Position + Hoehe jeder
  // Sektion EINMAL gecacht (offsetTop/offsetHeight sind ebenfalls
  // Layout-Reads -- deshalb hier NICHT pro Frame, sondern nur bei
  // resize/content-ready neu gemessen, siehe measureSectionBounds()
  // unten). Damit kann der Frame-Loop unten scrollY (kein Layout-Read)
  // gegen diese gecachten Werte pruefen und getBoundingClientRect() +
  // die zugehoerigen Writes komplett ueberspringen, wenn eine Sektion
  // gerade weit ausserhalb des sichtbaren Bereichs liegt -- spart Arbeit
  // ohne einen einzigen zusaetzlichen Layout-Read.
  const sectionBounds = new Map(); // el -> { top, bottom }
  const VIEWPORT_BUFFER_PX = 600; // Puffer, damit nichts abrupt kurz vor Sichtbarkeit noch uebersprungen wird

  function measureSectionBounds() {
    [stageEl, section02El, section03El, section05El].forEach((el) => {
      if (!el) return;
      sectionBounds.set(el, { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight });
    });
  }

  function isNearViewport(el, scrollY, viewportHeight) {
    const bounds = sectionBounds.get(el);
    if (!bounds) return true; // noch nicht gemessen -> sicherheitshalber nicht ueberspringen
    const viewTop = scrollY - VIEWPORT_BUFFER_PX;
    const viewBottom = scrollY + viewportHeight + VIEWPORT_BUFFER_PX;
    return bounds.bottom >= viewTop && bounds.top <= viewBottom;
  }

  function measureCloudAnchor() {
    if (!bgCloudEl) return;
    // Fade-IN beginnt, wenn section-03 von unten im Viewport auftaucht
    // (ihre Oberkante erreicht den unteren Viewport-Rand) -- siehe
    // Chat-Feedback ("faengt zu spaet an ... koennte schon anfangen wenn
    // sektion 3 unten auftaucht").
    if (section03El) {
      cloudFadeInDocTop = section03El.offsetTop - window.innerHeight;
    }
    // Fade-OUT beginnt symmetrisch dazu, wenn die Footer-Sektion von unten
    // auftaucht.
    if (section07El) {
      cloudFadeOutDocTop = section07El.offsetTop - window.innerHeight;
    }
  }

  // Anker einmal sofort setzen (Fallback, falls Content-Ready schon
  // gefeuert war) UND nach echtem Content-Rendering neu messen -- vorher
  // (direkt beim Script-Start) kann section-02 noch leer/kollabiert sein,
  // weil der Text erst async über "eatme:content-ready" eingefügt wird,
  // was die Höhe (und damit den Anker) verfälschen würde.
  //
  // WICHTIG (Safari-Fix): Safari feuert "resize"-Events, wenn beim
  // Scrollen die Adressleiste/Toolbar ein-/ausblendet -- KEINE echte
  // Breiten-/Layout-Aenderung, nur die sichtbare Viewport-Hoehe aendert
  // sich kurzzeitig. Ein naiver resize-Listener wuerde dadurch MITTEN
  // IM SCROLLEN wiederholt offsetTop/offsetHeight neu auslesen (erzwingt
  // synchrones Layout). Fix: nur auf echte Breiten-Aenderungen reagieren
  // (Rotation, Fenster-Resize), Hoehen-Aenderungen durch die
  // Safari-Toolbar ignorieren.
  let lastViewportWidth = window.innerWidth;
  function handleResize() {
    if (window.innerWidth === lastViewportWidth) return; // nur Hoehe geaendert (Safari-Toolbar) -> ignorieren
    lastViewportWidth = window.innerWidth;
    measureCloudAnchor();
    measureSectionBounds();
  }

  measureSectionBounds();
  window.addEventListener("resize", handleResize);
  document.addEventListener("eatme:content-ready", () => {
    requestAnimationFrame(() => requestAnimationFrame(measureSectionBounds));
  });

  if (bgCloudEl) {
    measureCloudAnchor();
    document.addEventListener("eatme:content-ready", () => {
      requestAnimationFrame(() => requestAnimationFrame(measureCloudAnchor));
    });
  }

  function parallaxLoop() {
    // ---- 1) ALLE READS ZUERST (ein Layout-Durchgang, keine Writes dazwischen) ----
    const scrollY = window.scrollY; // kein Layout-Read, daher hier unproblematisch
    const viewportHeight = window.innerHeight; // ebenfalls kein Layout-Read

    // Grobe Vorpruefung gegen die gecachten Sektions-Grenzen (siehe
    // measureSectionBounds() oben) -- spart den eigentlichen
    // getBoundingClientRect()-Read (erzwingt Layout) komplett fuer
    // Sektionen, die gerade weit ausserhalb des sichtbaren Bereichs
    // liegen. scrollY/viewportHeight sind beide keine Layout-Reads,
    // die Pruefung selbst kostet also nichts.
    const stageRect = (stageEl && isNearViewport(stageEl, scrollY, viewportHeight)) ? stageEl.getBoundingClientRect() : null;
    const section02Rect = (section02El && isNearViewport(section02El, scrollY, viewportHeight)) ? section02El.getBoundingClientRect() : null;
    const section03Rect = (section03El && isNearViewport(section03El, scrollY, viewportHeight)) ? section03El.getBoundingClientRect() : null;
    const section05Rect = (section05El && isNearViewport(section05El, scrollY, viewportHeight)) ? section05El.getBoundingClientRect() : null;

    // Tropfen (25.08.2026): brauchen keinen offsetParent-Check mehr --
    // es gibt nur noch EIN Canvas-Element (siehe Kommentar bei
    // initDropsCanvas() oben), dessen Sichtbarkeit schon ueber
    // isNearViewport()/section05Rect abgedeckt ist. Mobile-vs-Desktop-
    // Auswahl passiert innerhalb von dropsCanvasHandle.render() selbst
    // (window.innerWidth-Check), kein separates DOM-Element mehr noetig.

    // ---- 2) ALLE WRITES DANACH (kein Read mehr bis zum nächsten Frame) ----
    if (stageRect && stageBirdsEl && stageCloudEl) {
      stageBirdsEl.style.transform = `translateY(${-stageRect.top * (1 - BIRDS_SPEED)}px)`;
      stageCloudEl.style.transform = `translateY(${-stageRect.top * (1 - CLOUD_SPEED)}px)`;
    }
    if (section02Rect && birdLgEl && birdSmEl) {
      birdLgEl.style.transform = `translateY(${section02Rect.top * BIRD_LG_PARALLAX}px)`;
      birdSmEl.style.transform = `translateY(${section02Rect.top * BIRD_SM_PARALLAX}px)`;
    }
    if (section03Rect && section03Img1El && section03Img2El) {
      section03Img1El.style.transform = `translateY(${section03Rect.top * IMG1_PARALLAX}px)`;
      section03Img2El.style.transform = `translateY(${section03Rect.top * IMG2_PARALLAX}px)`;
    }
    if (section05Rect && dropsCanvasHandle) {
      dropsCanvasHandle.render({
        24: section05Rect.top * DROP_PARALLAX_BY_SIZE["24"],
        40: section05Rect.top * DROP_PARALLAX_BY_SIZE["40"],
      });
    }
    if (bgCloudShader && bgCloudEl) {
      // .bg-cloud ist jetzt position:fixed (siehe styles.css) und daher
      // IMMER im Viewport -- Sichtbarkeit wird ueber opacity gesteuert.
      // Fade-IN beginnt, wenn section-03 von unten auftaucht; Fade-OUT
      // beginnt symmetrisch dazu, wenn die Footer-Sektion von unten
      // auftaucht.
      //
      // Fade-IN beginnt, wenn section-03 von unten auftaucht; Fade-OUT
      // beginnt symmetrisch dazu, wenn die Footer-Sektion von unten
      // auftaucht.
      const fadeInProgress = Math.min(Math.max((scrollY - cloudFadeInDocTop) / CLOUD_FADE_DISTANCE_PX, 0), 1);
      const fadeOutProgress = Math.min(Math.max((scrollY - cloudFadeOutDocTop) / CLOUD_FADE_DISTANCE_PX, 0), 1);
      const opacity = fadeInProgress * (1 - fadeOutProgress);
      const isActive = opacity > 0; // ausserhalb davon: gar nicht rendern, GPU sparen

      // opacity IMMER schreiben (nicht nur wenn isActive), damit der Wert
      // beim Unsichtbarwerden nicht auf dem letzten Stand einfriert -- die
      // kurze CSS-Transition (siehe styles.css) faengt zusaetzlich ab,
      // falls mal ein groesserer Sprung zwischen zwei Frames passiert.
      bgCloudEl.style.opacity = opacity;

      if (isActive) {
        // Drift-Staerke bezieht sich auf den Fade-IN-Anker (dort beginnt
        // die Bewegung "bei 0"), nicht auf den alten section-02-Anker.
        const scrollDelta = scrollY - cloudFadeInDocTop;
        const offset = scrollDelta * CLOUD_DRIFT_STRENGTH;
        bgCloudShader.render(offset);
      }
    }

    requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);
})();
