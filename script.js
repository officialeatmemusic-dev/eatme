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
    container.appendChild(p);
  });
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
