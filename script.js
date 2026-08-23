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

let fadeLastScrollY = window.scrollY;

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY >= fadeLastScrollY;
    fadeLastScrollY = currentScrollY;

    entries.forEach((entry) => {
      if (scrollingDown && entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else if (!scrollingDown && !entry.isIntersecting) {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
);

function initFadeInText(root = document) {
  root.querySelectorAll(".fade-in-text:not(.fade-in-observed)").forEach((el, index) => {
    el.classList.add("fade-in-observed");
    el.style.transitionDelay = `${index * 80}ms`;
    fadeInObserver.observe(el);
  });
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
// renderScale 0.45 (weiter runter von 0.6, siehe Chat-Feedback "ruckelt
// immer noch"): der Canvas deckt den kompletten Viewport ab und wird
// JEDEN Frame mit mehreren verschachtelten 6-Oktaven-fBm-Durchlaeufen neu
// gerechnet -- bei voller Aufloesung (dpr x 2) ist das auf schwaecheren
// GPUs/mobile Safari spuerbar teuer (siehe Chat-Feedback: "ruckelt immer
// noch ein wenig"). 45% interne Aufloesung, per CSS wieder hochskaliert,
// ist bei einer weichen, unscharfen Wolkentextur optisch praktisch nicht
// unterscheidbar, senkt die Pixel-Anzahl pro Frame aber deutlich.
const bgCloudShader = bgCloudCanvas ? initCloudShader(bgCloudCanvas, BG_CLOUD_PARAMS, true, 0.45) : null;

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
  const dropEls = document.querySelectorAll("#section-05-images-drops .tropfen");

  const section07El = document.querySelector("#section-07-footer");

  // Einmalig feststellen, ob der Browser native CSS-Scroll-Timelines
  // beherrscht (siehe @supports-Block in styles.css) -- wenn ja,
  // uebernimmt CSS die .bg-cloud-Opacity komplett off-main-thread, JS
  // schreibt dann bewusst nichts mehr in dieses Property (siehe Loop
  // unten). CSS.supports ist eine reine Capability-Abfrage, kein
  // Layout-Read, daher unproblematisch hier oben aufzurufen.
  const supportsNativeCloudFade =
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: view()");

  const bgCloudEl = document.querySelector(".bg-cloud");

  const BIRDS_SPEED = 0.6;
  const CLOUD_SPEED = 0.3;
  const BIRD_LG_PARALLAX = 0.06;
  const BIRD_SM_PARALLAX = 0.025;
  const IMG1_PARALLAX = 0.05;
  const IMG2_PARALLAX = 0.09;
  const DROP_PARALLAX_BY_SIZE = { "24": 0.035, "40": 0.09 };
  // Wie stark die Cloud dem normalen Scroll folgt: 0 = steht komplett
  // still, 1 = bewegt sich exakt wie ein normales, nicht-parallaxtes
  // Element, >1 = bewegt sich sogar staerker/schneller als der Rest der
  // Seite. War 0.5, dann 0.85, jetzt nochmal deutlich hoch auf 1.4 (siehe
  // Chat-Feedback: "koennen noch viel mehr mitscrollen"). Einfach diesen
  // einen Wert weiter anpassen, falls noch mehr/weniger gewuenscht.
  const CLOUD_DRIFT_STRENGTH = 1.4;
  const CLOUD_FADE_DISTANCE_PX = 400; // Strecke, über die die Cloud weich ein-/ausblendet
  // Glaettungs-Faktor fuer die Drift-Bewegung (0-1): faengt Spruenge ab,
  // die entstehen, wenn Safari beim schnellen Momentum-/Fling-Scrollen
  // mehrere Frames Distanz zusammenfasst, bevor rAF wieder drankommt.
  // 0.2 = folgt zuegig, aber nicht mehr hart/instant.
  const CLOUD_SMOOTHING = 0.2;

  let cloudFadeInDocTop = 0;
  let cloudFadeOutDocTop = 0;
  let currentCloudOffset = 0;
  let cloudOffsetInitialized = false;
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
  }

  if (bgCloudEl) {
    measureCloudAnchor();
    window.addEventListener("resize", handleResize);
    document.addEventListener("eatme:content-ready", () => {
      requestAnimationFrame(() => requestAnimationFrame(measureCloudAnchor));
    });
  }

  function parallaxLoop() {
    // ---- 1) ALLE READS ZUERST (ein Layout-Durchgang, keine Writes dazwischen) ----
    const stageRect = stageEl ? stageEl.getBoundingClientRect() : null;
    const section02Rect = section02El ? section02El.getBoundingClientRect() : null;
    const section03Rect = section03El ? section03El.getBoundingClientRect() : null;
    const section05Rect = section05El ? section05El.getBoundingClientRect() : null;
    const scrollY = window.scrollY; // kein Layout-Read, daher hier unproblematisch

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
    if (section05Rect && dropEls.length) {
      dropEls.forEach((el) => {
        // offsetParent ist null, wenn das Element (oder ein Vorfahre)
        // display:none hat -- z.B. die jeweils andere Breakpoint-Variante
        // (Desktop-/Mobile-Tropfen-Satz, siehe section-05-images-drops.css).
        // Unnötige Style-Writes auf unsichtbaren Elementen sparen, kleiner
        // zusätzlicher Perf-Gewinn v.a. in Safari.
        if (el.offsetParent === null) return;
        const factor = DROP_PARALLAX_BY_SIZE[el.dataset.size] || 0.05;
        el.style.transform = `translateY(${section05Rect.top * factor}px)`;
      });
    }
    if (bgCloudShader && bgCloudEl) {
      // .bg-cloud ist jetzt position:fixed (siehe styles.css) und daher
      // IMMER im Viewport -- Sichtbarkeit wird ueber opacity gesteuert.
      // Fade-IN beginnt, wenn section-03 von unten auftaucht; Fade-OUT
      // beginnt symmetrisch dazu, wenn die Footer-Sektion von unten
      // auftaucht.
      //
      // WICHTIG: Wenn der Browser native CSS-Scroll-Timelines unterstuetzt
      // (siehe @supports-Block in styles.css, Safari 26+/Chrome 115+),
      // uebernimmt CSS die komplette Opacity-Steuerung -- off-main-thread,
      // synchron zum Scrollen, ohne die JS/rAF-Main-Thread-Verzoegerung,
      // die auf Safari beim schnellen Momentum-Scrollen (Fling vom Footer
      // nach oben) das gemeldete Springen/Ruckeln verursacht hat. JS
      // schreibt in diesem Fall bewusst KEIN eigenes .style.opacity mehr
      // (sonst wuerden sich CSS und JS gegenseitig ueberschreiben).
      // fadeInProgress/fadeOutProgress dienen dann nur noch als grobe
      // JS-interne Heuristik dafuer, ob der teure Shader-Render-Call
      // ueberhaupt noetig ist (GPU sparen) -- muss dafuer nicht
      // pixelgenau sein.
      const fadeInProgress = Math.min(Math.max((scrollY - cloudFadeInDocTop) / CLOUD_FADE_DISTANCE_PX, 0), 1);
      const fadeOutProgress = Math.min(Math.max((scrollY - cloudFadeOutDocTop) / CLOUD_FADE_DISTANCE_PX, 0), 1);
      const opacity = fadeInProgress * (1 - fadeOutProgress);
      const isActive = opacity > 0; // ausserhalb davon: gar nicht rendern, GPU sparen

      if (!supportsNativeCloudFade) {
        // Fallback fuer Browser ohne Scroll-Timeline-Support (z.B. aktuell
        // Firefox stable): opacity IMMER schreiben (nicht nur wenn
        // isActive), damit der Wert beim Unsichtbarwerden nicht auf dem
        // letzten Stand einfriert -- die kurze CSS-Transition (siehe
        // styles.css) faengt zusaetzlich ab, falls doch mal ein groesserer
        // Sprung zwischen zwei Frames passiert.
        bgCloudEl.style.opacity = opacity;
      }

      if (isActive) {
        // Drift-Staerke bezieht sich auf den Fade-IN-Anker (dort beginnt
        // die Bewegung "bei 0"), nicht auf den alten section-02-Anker.
        const scrollDelta = scrollY - cloudFadeInDocTop;
        const targetOffset = scrollDelta * CLOUD_DRIFT_STRENGTH;

        if (!cloudOffsetInitialized) {
          // Beim ersten aktiven Frame direkt auf das Ziel springen (kein
          // Reinlaufen von 0 aus) -- das Fade-in uebernimmt ohnehin schon
          // die weiche Einfuehrung, die Glaettung unten ist nur fuer
          // Spruenge WAEHREND des Scrollens gedacht, nicht fuers
          // Sichtbarwerden.
          currentCloudOffset = targetOffset;
          cloudOffsetInitialized = true;
        } else {
          // Exponentielle Glaettung (Lerp) statt hartem Uebernehmen des
          // Zielwerts: Safari kann bei schnellem Momentum-/Fling-Scrollen
          // mehrere Frames Distanz zusammenfassen, bevor rAF ueberhaupt
          // wieder drankommt (Compositor-Thread laeuft unabhaengig vom
          // Main-Thread) -- der naechste targetOffset kann dadurch weit
          // vom vorherigen abweichen und wuerde sonst als sichtbarer
          // Sprung gerendert. Die Glaettung laesst currentCloudOffset
          // stattdessen ueber ein paar Frames sanft hinterherziehen.
          // CLOUD_SMOOTHING hoeher = folgt schneller/direkter (mehr
          // Sprung-Risiko), niedriger = weicher (aber minimal "hinterher").
          currentCloudOffset += (targetOffset - currentCloudOffset) * CLOUD_SMOOTHING;
        }

        bgCloudShader.render(currentCloudOffset);
      } else {
        cloudOffsetInitialized = false;
      }
    }

    requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);
})();
