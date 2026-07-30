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
