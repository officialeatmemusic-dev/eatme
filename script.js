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
// instagram-module — Insta-Post-Nachbildung (section-06-text-social)
// Komponente: components/instagram-module.css. Übernimmt Handle/Caption/
// Avatar/Follow-Link + Post-Bilder aus content.json
// (section-06-text-social.instagram_module), danach:
//   - Top-Bar draggable (bewegt das ganze Modul, kein Text-Select)
//   - 8 unsichtbare Resize-Zonen (4 Kanten + 4 Ecken), gegenüberliegende
//     Seite bleibt beim Ziehen exakt stehen
//   - Content-Bereich scrollt "endlos" (3 Kopien der Post-Bilder, Scroll-
//     Position wird beim Erreichen eines Rands unsichtbar zurückgesetzt)
//   - Ab WIDE_BREAKPOINT Modul-Breite: 2 unabhängige Bilder-Spalten
//     (echtes Masonry statt starrer Grid-Zeilen)
// Bilder behalten ihr Original-Seitenverhältnis; einzige Ausnahme ist das
// jeweils letzte Bild der kürzeren Spalte, das minimal gestreckt/gecropt
// wird, damit beide Spalten pro "Set" bündig enden (siehe Kommentar bei
// .insta-set in components/instagram-module.css).
// ==========================================================================

function initInstagramModule(data) {
  const moduleEl = document.getElementById("instagram-module");
  if (!moduleEl || !data) return;

  const MIN_WIDTH = 260;
  const MAX_WIDTH = 800;
  const MIN_HEIGHT = 360;
  const MAX_HEIGHT = 760;
  const WIDE_BREAKPOINT = 460;

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

  const postImages = (data.post_images || []).map((img) => img.src);
  if (!postImages.length || !grid || !scrollEl || !dragHandle) return;

  // ---- Position/Größe komplett als px verwaltet (kein zentrierender
  // Container) -- dadurch wächst/schrumpft das Modul beim Resizen nur auf
  // der gezogenen Seite, die gegenüberliegende Kante bleibt exakt stehen. ----
  let state = { left: 0, top: 0, width: 340, height: 520 };

  function applyState() {
    moduleEl.style.left = `${state.left}px`;
    moduleEl.style.top = `${state.top}px`;
    moduleEl.style.width = `${state.width}px`;
    moduleEl.style.height = `${state.height}px`;
  }
  applyState();

  function makeImageEl(src, alt) {
    const wrap = document.createElement("div");
    wrap.className = "insta-image";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "";
    img.draggable = false;
    wrap.appendChild(img);
    return wrap;
  }

  // ---- Grid-Aufbau: 3 "Sets" (Kopien der Post-Bilder) für den Endlos-
  // Loop. Schmal: jedes Set eine einzelne vertikale Liste. Breit: jedes
  // Set eine Reihe aus 2 unabhängigen Spalten (Bilder wechselseitig
  // verteilt) -- kein Bild zwingt das andere mehr in eine gemeinsame
  // Zeilenhöhe. ----
  let isWide = false;

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
        (data.post_images || []).forEach((imgData, i) => {
          (i % 2 === 0 ? col0 : col1).appendChild(makeImageEl(imgData.src, imgData.alt));
        });
        setEl.appendChild(col0);
        setEl.appendChild(col1);
      } else {
        (data.post_images || []).forEach((imgData) => {
          setEl.appendChild(makeImageEl(imgData.src, imgData.alt));
        });
      }

      grid.appendChild(setEl);
    }
  }
  renderGrid();

  // ---- Gleicht pro Set die Gesamthöhe beider Spalten aus: NUR das
  // letzte Bild der kürzeren Spalte wird um die fehlende Differenz
  // gestreckt (object-fit:cover, siehe .is-stretched in der CSS) -- kein
  // zusätzliches Spacer-Element, das würde den Gap am Set-Übergang
  // aufblähen (siehe Kommentar in components/instagram-module.css). Vor
  // jeder Neuberechnung wird eine vorherige Streckung zurückgesetzt
  // (wichtig bei Live-Resize). ----
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
      const lastImg = shorterCol.lastElementChild;
      if (!lastImg || !lastImg.classList.contains("insta-image")) return;

      const currentHeight = lastImg.getBoundingClientRect().height;
      lastImg.style.height = `${currentHeight + diff}px`;
      lastImg.classList.add("is-stretched");
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

  const imgEls = Array.from(grid.querySelectorAll("img"));
  Promise.all(
    imgEls.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        })
    )
  ).then(() => scheduleRefresh());

  scrollEl.addEventListener("scroll", () => {
    if (!setHeight) return;
    if (scrollEl.scrollTop <= 0) {
      scrollEl.scrollTop += setHeight;
    } else if (scrollEl.scrollTop >= setHeight * 2) {
      scrollEl.scrollTop -= setHeight;
    }
  });

  // Modul-Größe ändert sich durch Resize (siehe unten) oder z.B. eine
  // Browser-Fenster-Änderung -> Spalten-Umbruch und Loop-Messung müssen
  // neu berechnet werden.
  const layoutObserver = new ResizeObserver(() => scheduleRefresh());
  layoutObserver.observe(moduleEl);

  // ---- Drag: nur über die Top-Bar, bewegt das Modul per left/top (px).
  // preventDefault() im pointerdown verhindert zusätzlich, dass der
  // Browser beim Ziehen über den Text eine Auswahl startet. ----
  let dragState = null;

  dragHandle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
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
  // der CSS). Die gegenüberliegende Seite bleibt IMMER exakt an ihrer
  // Bildschirmposition stehen -- auch bei MIN_/MAX_-Clamping, weil
  // left/top aus der bereits geclampten Breite/Höhe zurückgerechnet
  // werden (nicht aus dem rohen Maus-Delta). ----
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const resizeHandles = moduleEl.querySelectorAll(".resize-edge, .resize-corner");

  resizeHandles.forEach((handle) => {
    const dir = handle.dataset.dir;
    let resizeState = null;

    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
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
}

document.addEventListener("eatme:content-ready", (e) => {
  initInstagramModule(e.detail["section-06-text-social"]?.instagram_module);
});
