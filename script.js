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
// aufrufen. Text blendet beim Reinscrollen ein UND beim Rausscrollen
// (in beide Richtungen) wieder aus -> is-visible wird bei jeder
// Intersection-Änderung neu gesetzt, kein einmaliges unobserve mehr.
// ==========================================================================

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
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

// Parallax: Wolken (Hintergrund) bewegen sich langsamer als die Vögel
// (Vordergrund) -> Tiefeneffekt statt einer flachen Fläche. Kein
// Scroll-Event-Listener (feuert unregelmäßig -> ruckelt), stattdessen ein
// durchgehender rAF-Loop, der jeden Frame den exakten Wert direkt setzt.
const stageEl = document.querySelector("#section-01-stage .stage");
const stageBirdsEl = document.querySelector("#section-01-stage .stage-birds");
const stageCloudEl = document.querySelector("#section-01-stage .stage-bg");

if (stageEl && stageBirdsEl && stageCloudEl) {
  const BIRDS_SPEED = 0.6; // Vordergrund: mehr Eigenbewegung
  const CLOUD_SPEED = 0.3; // Hintergrund: deutlich träger/ruhiger

  const parallaxLoop = () => {
    const rect = stageEl.getBoundingClientRect();
    stageBirdsEl.style.transform = `translateY(${-rect.top * (1 - BIRDS_SPEED)}px)`;
    stageCloudEl.style.transform = `translateY(${-rect.top * (1 - CLOUD_SPEED)}px)`;
    requestAnimationFrame(parallaxLoop);
  };
  requestAnimationFrame(parallaxLoop);
}

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

// Subtiler Scroll-Parallax für die blauen Vögel: die größere/vordere Vogel
// bewegt sich etwas schneller als die kleinere/hintere. Gleiches rAF-Muster
// wie section-01 (kein Scroll-Listener, stattdessen durchgehender Loop).
const section02El = document.querySelector("#section-02-text-01");
const birdLgEl = document.querySelector("#section-02-text-01 .bird-blue-lg");
const birdSmEl = document.querySelector("#section-02-text-01 .bird-blue-sm");

if (section02El && birdLgEl && birdSmEl) {
  const BIRD_LG_PARALLAX = 0.06; // vordere, größere Vogel — etwas schneller
  const BIRD_SM_PARALLAX = 0.025; // hintere, kleinere Vogel — langsamer

  const section02ParallaxLoop = () => {
    const rect = section02El.getBoundingClientRect();
    birdLgEl.style.transform = `translateY(${rect.top * BIRD_LG_PARALLAX}px)`;
    birdSmEl.style.transform = `translateY(${rect.top * BIRD_SM_PARALLAX}px)`;
    requestAnimationFrame(section02ParallaxLoop);
  };
  requestAnimationFrame(section02ParallaxLoop);
}

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

// Subtiler Scroll-Parallax auf beide Bandfotos, bewusst UNTERSCHIEDLICHE
// Faktoren (kein identisches Bewegungsmuster) -- gleiches rAF-Muster wie
// section-01/section-02 (kein Scroll-Event-Listener).
const section03El = document.querySelector("#section-03-images");
const section03Img1El = document.querySelector("#section-03-image-01");
const section03Img2El = document.querySelector("#section-03-image-02");

if (section03El && section03Img1El && section03Img2El) {
  const IMG1_PARALLAX = 0.05;
  const IMG2_PARALLAX = 0.09;

  const section03ParallaxLoop = () => {
    const rect = section03El.getBoundingClientRect();
    section03Img1El.style.transform = `translateY(${rect.top * IMG1_PARALLAX}px)`;
    section03Img2El.style.transform = `translateY(${rect.top * IMG2_PARALLAX}px)`;
    requestAnimationFrame(section03ParallaxLoop);
  };
  requestAnimationFrame(section03ParallaxLoop);
}

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

// Tropfen-Parallax: Faktor abhängig von der Tropfen-Größe (data-size,
// siehe sections/section-05-images-drops.css) -- größere Tropfen (40px)
// bewegen sich stärker/wirken näher, kleinere (24px) dezenter/wirken
// weiter weg. Gilt für Desktop- UND Mobile-Tropfen gleichermaßen (welcher
// Satz sichtbar ist, steuert allein das CSS über den 768px-Breakpoint).
// Gleiches rAF-Muster wie alle übrigen Parallax-Effekte auf der Seite.
function initDropsParallax() {
  const section = document.querySelector("#section-05-images-drops");
  const drops = document.querySelectorAll("#section-05-images-drops .tropfen");
  if (!section || !drops.length) return;

  const DROP_PARALLAX_BY_SIZE = {
    "24": 0.035,
    "40": 0.09,
  };

  const loop = () => {
    const rect = section.getBoundingClientRect();
    drops.forEach((el) => {
      const factor = DROP_PARALLAX_BY_SIZE[el.dataset.size] || 0.05;
      el.style.transform = `translateY(${rect.top * factor}px)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

initDropsParallax();


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
