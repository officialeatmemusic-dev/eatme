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
