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
