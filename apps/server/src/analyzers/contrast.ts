import sharp from "sharp";
import type { BoundingBox, DeterministicFinding } from "@ai-screen-sense/shared";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** WCAG relative luminance, per https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
function relativeLuminance({ r, g, b }: Rgb): number {
  const toLinear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Finds the two most visually distinct dominant colors in a region — used as a
 * cheap proxy for "foreground text color" vs "background color" without DOM
 * access. This is intentionally approximate (see doc §5, vision-only mode);
 * DOM-aware mode (Phase 4) will read real computed CSS colors instead.
 */
async function dominantColorPair(
  imageBuffer: Buffer,
  region: BoundingBox
): Promise<[Rgb, Rgb]> {
  const { data, info } = await sharp(imageBuffer)
    .extract({
      left: Math.max(0, Math.round(region.x)),
      top: Math.max(0, Math.round(region.y)),
      width: Math.max(1, Math.round(region.width)),
      height: Math.max(1, Math.round(region.height)),
    })
    .resize(32, 32, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: Rgb[] = [];
  const channels = info.channels;
  for (let i = 0; i < data.length; i += channels) {
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }

  let maxDist = -1;
  let pair: [Rgb, Rgb] = [pixels[0], pixels[0]];
  for (let i = 0; i < pixels.length; i++) {
    for (let j = i + 1; j < pixels.length; j++) {
      const a = pixels[i];
      const b = pixels[j];
      const dist =
        Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
      if (dist > maxDist) {
        maxDist = dist;
        pair = [a, b];
      }
    }
  }
  return pair;
}

export async function checkContrast(
  imageBuffer: Buffer,
  region: BoundingBox
): Promise<DeterministicFinding> {
  const [fg, bg] = await dominantColorPair(imageBuffer, region);
  const ratio = contrastRatio(fg, bg);
  return {
    kind: "contrast",
    foreground: toHex(fg),
    background: toHex(bg),
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    region,
  };
}
