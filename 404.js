// ==========================================================================
// EatMe — 404-Seite
// Eigenständiges Skript (nicht script.js), da diese Seite nur zwei
// Komponenten braucht: die Nav (dynamisch aus content.json, siehe unten)
// und das eigene Wolken-Visual. Lädt content.json trotzdem wie die
// Hauptseite (siehe loadContent()/renderNav() unten -- bewusste
// Duplizierung der jeweiligen Funktion aus script.js für nur diese eine
// Seite, siehe Kommentar an renderNav()).
// ==========================================================================

async function loadContent() {
  const response = await fetch("content.json");
  if (!response.ok) {
    throw new Error(`content.json konnte nicht geladen werden: ${response.status}`);
  }
  return response.json();
}

// ==========================================================================
// eatme-navigation — 1:1 dieselbe Logik wie renderNav() in script.js
// (Logo + Social-Links aus content.json: site.social_links,
// section-01-stage.logo_image). Bewusst hier dupliziert statt script.js
// komplett einzubinden -- script.js enthält zusätzlich die komplette
// Sektions-Rendering-/Parallax-Logik der Hauptseite, die auf dieser Seite
// nur nutzlos mitgeladen würde (die dortigen Elemente existieren hier gar
// nicht). Bei Änderungen an renderNav() in script.js bitte hier
// nachziehen.
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const content = await loadContent();
    renderNav(content);
  } catch (err) {
    console.error("404: Fehler beim Laden von content.json:", err);
  }
});

// ==========================================================================
// Cloud-Shader (WebGL) — Shader-Code (Noise/fBm, Uniform-Struktur) 1:1
// identisch zu script.js (initCloudShader()/CLOUD_FRAGMENT_SRC), eigene
// Instanz + eigene Form-Parameter (BG_CLOUD_404_PARAMS). Bei
// Shader-Bugfixes (z.B. Compile-Fehlern) bitte auch hier nachziehen.
//
// FARBEN: bewusst NICHT aus tokens.css gelesen (anders als der sitewide
// Shader in script.js) -- eigenes 404-spezifisches Farbschema, mit Til
// per Regler-Vorschau abgestimmt (28.08.2026). Gilt nur für diese Seite,
// tokens.css/--gradient-sky-top etc. bleiben unberührt.
// ==========================================================================

const CLOUD_404_COLORS = {
  skyTop: "#46676f",
  skyBottom: "#719da6",
  cloudLight: "#c8d2d9",
  cloudShadow: "#28535a",
  fadeColor: "#ffffff", // ungenutzt bei edgeFade: 0, siehe BG_CLOUD_404_PARAMS
};

function hexToRgbFloat(hex) {
  const clean = (hex || "").replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const bigint = parseInt(clean, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
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
  uniform float uEdgeFade;

  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uCloudLight;
  uniform vec3 uCloudShadow;
  uniform vec3 uFadeColor;

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
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= persistence;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

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

    float fadeFraction = 0.11;
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
    console.error("404 Cloud-Shader-Compile-Fehler:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

function readCloudColors() {
  return {
    skyTop: hexToRgbFloat(CLOUD_404_COLORS.skyTop),
    skyBottom: hexToRgbFloat(CLOUD_404_COLORS.skyBottom),
    cloudLight: hexToRgbFloat(CLOUD_404_COLORS.cloudLight),
    cloudShadow: hexToRgbFloat(CLOUD_404_COLORS.cloudShadow),
    fadeColor: hexToRgbFloat(CLOUD_404_COLORS.fadeColor),
  };
}

function initCloudShader(canvas, params) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false }) ||
             canvas.getContext("experimental-webgl");
  if (!gl) {
    console.warn("404: WebGL nicht verfuegbar -- Wolken-Visual wird uebersprungen.");
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

  function applyColors() {
    gl.useProgram(program);
    const colors = readCloudColors();
    gl.uniform3fv(u.uSkyTop, colors.skyTop);
    gl.uniform3fv(u.uSkyBottom, colors.skyBottom);
    gl.uniform3fv(u.uCloudLight, colors.cloudLight);
    gl.uniform3fv(u.uCloudShadow, colors.cloudShadow);
    gl.uniform3fv(u.uFadeColor, colors.fadeColor);
  }
  applyColors();

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
  gl.uniform1f(u.uEdgeFade, params.edgeFade);

  // Resize nur bei echten Breiten-Aenderungen -- Safari feuert "resize" beim
  // Ein-/Ausblenden der Adressleiste (siehe script.js-Kommentar zum
  // identischen Guard beim sitewide Shader).
  let lastCanvasViewportWidth = window.innerWidth;
  function doResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    if (window.innerWidth === lastCanvasViewportWidth) return;
    lastCanvasViewportWidth = window.innerWidth;
    doResize();
  }
  window.addEventListener("resize", resize);
  doResize();

  const start = performance.now();

  return {
    render() {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(u.uTime, t);
      gl.uniform1f(u.uScroll, 0); // diese Seite scrollt nicht
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}

// Mit Til per Regler-Vorschau final abgestimmte Werte (28.08.2026,
// zweite Runde inkl. eigenem Farbschema -- siehe CLOUD_404_COLORS oben).
// edgeFade: 0 -- diese Seite hat nur einen Viewport (kein Scroll), daher
// kein Rand-Fade wie beim sitewide .bg-cloud nötig.
const BG_CLOUD_404_PARAMS = {
  coverage: 36, density: 52, brightness: 71, detail: 65, variation: 160,
  warpAmount: 54, warpScale: 8, stretch: 0, phase: 100, radius: 150,
  drift: 100, rise: -100, edgeFade: 0,
};

const cloud404Canvas = document.getElementById("cloud-canvas-404");
const cloud404Shader = cloud404Canvas ? initCloudShader(cloud404Canvas, BG_CLOUD_404_PARAMS) : null;

function loop() {
  if (cloud404Shader) cloud404Shader.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
