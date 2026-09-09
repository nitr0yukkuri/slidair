const COLOR_NAMES = Object.freeze({ black: [0, 0, 0], white: [1, 1, 1] });
const imageSamplerCache = new Map();

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function mixColor(first, second, amount) {
  return first.map((value, index) => value + (second[index] - value) * amount);
}

function oklchToRgb(lightness, chroma, hue) {
  const radians = hue * Math.PI / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  const linear = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
  return linear.map((value) => clamp(value <= 0.0031308 ? 12.92 * value : 1.055 * (value ** (1 / 2.4)) - 0.055));
}

export function parseCssColor(value) {
  const source = String(value ?? "").trim().toLowerCase();
  if (COLOR_NAMES[source]) return COLOR_NAMES[source].slice();
  if (source.startsWith("#")) {
    const hex = source.slice(1);
    const expanded = hex.length === 3 ? hex.split("").map((digit) => digit + digit).join("") : hex;
    if (/^[0-9a-f]{6}$/.test(expanded)) return [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16) / 255);
  }
  const rgb = source.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb) return rgb.slice(1, 4).map((channel) => clamp(Number(channel) / 255));
  const oklch = source.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?/);
  if (oklch) return oklchToRgb(Number(oklch[1]) / 100, Number(oklch[2]), Number(oklch[3]));
  return null;
}

export function relativeLuminance(rgb) {
  const linear = rgb.map((value) => {
    const channel = clamp(Number(value));
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(first, second) {
  const light = Math.max(relativeLuminance(first), relativeLuminance(second));
  const dark = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

export function scoreSafeArea(fields = []) {
  const results = fields.map((field) => {
    const textColor = field.textColor ?? [1, 1, 1];
    const backgrounds = Array.isArray(field.backgrounds) && field.backgrounds.length ? field.backgrounds : [[0.5, 0.5, 0.5]];
    const contrasts = backgrounds.map((background) => contrastRatio(textColor, background));
    const minContrast = Math.min(...contrasts);
    const targetContrast = field.targetContrast ?? 4.5;
    const contrastScore = clamp(minContrast / targetContrast, 0, 1) * 100;
    const texturePenalty = clamp(Math.max(0, (field.texture ?? 0) - 0.055) * 260, 0, 28);
    const score = Math.round(clamp(contrastScore - texturePenalty, 0, 100));
    return {
      label: field.label,
      score,
      minContrast: Number(minContrast.toFixed(2)),
      texture: Number((field.texture ?? 0).toFixed(3)),
    };
  });
  const score = results.length ? Math.round(results.reduce((sum, field) => sum + field.score, 0) / results.length) : 0;
  return { score, fields: results };
}

function extractBackgroundUrl(backgroundImage) {
  const match = String(backgroundImage ?? "").match(/url\(["']?([^"')]+)["']?\)/);
  return match?.[1] ?? null;
}

function filterNumber(filter, name, fallback) {
  const match = String(filter ?? "").match(new RegExp(name + "\\(([-\\d.]+)"));
  return match ? Number(match[1]) : fallback;
}

async function imageSampler(url) {
  if (!url || typeof Image === "undefined" || typeof document === "undefined") return null;
  if (!imageSamplerCache.has(url)) {
    imageSamplerCache.set(url, (async () => {
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 54;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        return (x, y) => {
          const ix = Math.min(canvas.width - 1, Math.max(0, Math.round(clamp(x) * (canvas.width - 1))));
          const iy = Math.min(canvas.height - 1, Math.max(0, Math.round(clamp(y) * (canvas.height - 1))));
          const offset = (iy * canvas.width + ix) * 4;
          return [pixels[offset] / 255, pixels[offset + 1] / 255, pixels[offset + 2] / 255];
        };
      } catch {
        return null;
      }
    })());
  }
  return imageSamplerCache.get(url);
}

function samplePoints(rect, slideRect) {
  const points = [[0.18, 0.2], [0.5, 0.5], [0.82, 0.2], [0.18, 0.8], [0.82, 0.8]];
  return points.map(([x, y]) => ({
    x: clamp((rect.left - slideRect.left + rect.width * x) / slideRect.width),
    y: clamp((rect.top - slideRect.top + rect.height * y) / slideRect.height),
  }));
}

export async function measureSlideSafety(slide, fields = []) {
  if (!slide || typeof getComputedStyle !== "function") return { score: 0, fields: [] };
  const slideStyle = getComputedStyle(slide);
  const sceneMark = slide.querySelector(".scene-mark");
  const sceneStyle = sceneMark ? getComputedStyle(sceneMark) : null;
  const baseA = parseCssColor(slideStyle.getPropertyValue("--base-a")) ?? [0.2, 0.24, 0.3];
  const baseB = parseCssColor(slideStyle.getPropertyValue("--base-b")) ?? [0.08, 0.12, 0.17];
  const sampler = await imageSampler(extractBackgroundUrl(sceneStyle?.backgroundImage));
  const imageOpacity = clamp(Number(sceneStyle?.opacity ?? 0));
  const brightness = filterNumber(sceneStyle?.filter, "brightness", 1);
  const slideRect = slide.getBoundingClientRect();
  const metrics = fields.filter((field) => field.element).map((field) => {
    const rect = field.element.getBoundingClientRect();
    const backgrounds = samplePoints(rect, slideRect).map(({ x, y }) => {
      const base = mixColor(baseA, baseB, clamp(x * 0.82 + y * 0.18));
      if (!sampler || imageOpacity <= 0) return base;
      const image = sampler(x, y).map((channel) => clamp(channel * brightness));
      return mixColor(base, image, imageOpacity * 0.86);
    });
    const luminance = backgrounds.map(relativeLuminance);
    const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
    const texture = Math.sqrt(luminance.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / luminance.length);
    return {
      label: field.label,
      textColor: parseCssColor(getComputedStyle(field.element).color) ?? parseCssColor(slideStyle.color) ?? [1, 1, 1],
      backgrounds,
      texture,
      targetContrast: field.targetContrast,
    };
  });
  return scoreSafeArea(metrics);
}