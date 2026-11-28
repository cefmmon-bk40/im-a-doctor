import { ClinicalRetouchPreset } from '../types/clinic';

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function ellipseWeight(
  nx: number,
  ny: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotRad: number = 0
): number {
  const dx = nx - cx;
  const dy = ny - cy;
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);
  const rxCoord = (dx * cos + dy * sin) / rx;
  const ryCoord = (-dx * sin + dy * cos) / ry;
  const dist = Math.sqrt(rxCoord * rxCoord + ryCoord * ryCoord);
  return 1 - smoothstep(0.45, 1.0, dist);
}

export function capsuleWeight(
  nx: number,
  ny: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number
): number {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = nx - x1;
  const wy = ny - y1;
  const lenSq = vx * vx + vy * vy;
  const proj = lenSq > 0 ? clamp01((wx * vx + wy * vy) / lenSq) : 0;
  const px = x1 + proj * vx;
  const py = y1 + proj * vy;
  const dist = Math.hypot(nx - px, ny - py);
  return 1 - smoothstep(radius * 0.55, radius, dist);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isWarmSkinPixel(r: number, g: number, b: number, minRB: number = 14): number {
  const brightness = smoothstep(95, 138, r);
  const notBlownOutWhite = 1 - smoothstep(238, 253, Math.min(r, g, b));
  const warmth = smoothstep(minRB - 4, minRB + 10, r - b);
  const redOverGreen = smoothstep(4, 16, r - g);
  return brightness * notBlownOutWhite * warmth * redOverGreen;
}

export function computeToothEnamelWeight(
  nx: number,
  ny: number,
  r: number,
  g: number,
  b: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): number {
  const spatial = ellipseWeight(nx, ny, cx, cy, rx, ry);
  if (spatial <= 0.001) return 0;

  const lum = (r + g + b) / 3;
  // Exclude dark oral cavity shadows & exclude pink gums/lips (which have high R-G & R-B)
  const brightEnough = smoothstep(92, 138, lum);
  const notPinkGumRMinusG = 1 - smoothstep(18, 38, r - g);
  const notPinkLipRMinusB = 1 - smoothstep(32, 64, r - b);

  return spatial * brightEnough * notPinkGumRMinusG * notPinkLipRMinusB;
}

export function computeLocalizedZoneMaskWeight(
  preset: ClinicalRetouchPreset,
  nx: number,
  ny: number,
  r: number,
  g: number,
  b: number
): number {
  switch (preset) {
    case 'dental-whitening':
      return computeToothEnamelWeight(nx, ny, r, g, b, 0.5, 0.51, 0.44, 0.27);

    case 'dental-alignment':
      return computeToothEnamelWeight(nx, ny, r, g, b, 0.5, 0.5, 0.36, 0.21);

    case 'laser-epilation': {
      const shin = capsuleWeight(nx, ny, 0.22, 0.88, 0.68, 0.28, 0.115);
      const thigh = capsuleWeight(nx, ny, 0.68, 0.28, 0.96, 0.19, 0.11);
      const forearm = capsuleWeight(nx, ny, 0.52, 0.44, 0.76, 0.07, 0.055);
      const spatial = Math.max(shin, thigh, forearm);
      if (spatial <= 0.001) return 0;
      return spatial * isWarmSkinPixel(r, g, b, 24);
    }

    case 'laser-rejuvenation': {
      const cheek = ellipseWeight(nx, ny, 0.58, 0.57, 0.16, 0.18, -0.2);
      const temple = ellipseWeight(nx, ny, 0.52, 0.37, 0.09, 0.08, 0.1);
      const spatial = Math.max(cheek, temple);
      if (spatial <= 0.001) return 0;
      return spatial * isWarmSkinPixel(r, g, b, 15);
    }

    case 'derma-acne': {
      const cheek = ellipseWeight(nx, ny, 0.52, 0.56, 0.135, 0.165, -0.24);
      if (cheek <= 0.001) return 0;
      return cheek * isWarmSkinPixel(r, g, b, 16);
    }

    case 'derma-melasma': {
      const cheekbone = ellipseWeight(nx, ny, 0.48, 0.42, 0.21, 0.18, -0.2);
      if (cheekbone <= 0.001) return 0;
      return cheekbone * isWarmSkinPixel(r, g, b, 14);
    }

    case 'doctor-inflammation': {
      const knee = ellipseWeight(nx, ny, 0.52, 0.38, 0.125, 0.14, -0.28);
      if (knee <= 0.001) return 0;
      return knee * isWarmSkinPixel(r, g, b, 18);
    }

    case 'doctor-recovery': {
      const forearm = ellipseWeight(nx, ny, 0.54, 0.47, 0.155, 0.085, 0.02);
      if (forearm <= 0.001) return 0;
      return forearm * isWarmSkinPixel(r, g, b, 20);
    }
  }
}

function clampByte(val: number): number {
  if (val <= 0) return 0;
  if (val >= 255) return 255;
  return Math.round(val);
}

function drawOverlayMasked(
  targetData: Uint8ClampedArray,
  overlayData: Uint8ClampedArray,
  weights: Float32Array
) {
  for (let i = 0; i < weights.length; i += 1) {
    const w = weights[i];
    if (w <= 0.01) continue;
    const p = i * 4;
    const alpha = (overlayData[p + 3] / 255) * w;
    if (alpha <= 0.005) continue;
    const inv = 1 - alpha;
    targetData[p] = clampByte(targetData[p] * inv + overlayData[p] * alpha);
    targetData[p + 1] = clampByte(targetData[p + 1] * inv + overlayData[p + 1] * alpha);
    targetData[p + 2] = clampByte(targetData[p + 2] * inv + overlayData[p + 2] * alpha);
  }
}

function createOverlayCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context');
  }
  return [c, ctx];
}

function applyLocalizedSoftSmooth(
  data: Uint8ClampedArray,
  src: Uint8ClampedArray,
  weights: Float32Array,
  width: number,
  height: number,
  blendStrength: number
) {
  const radius = 2;
  for (let y = radius; y < height - radius; y += 1) {
    for (let x = radius; x < width - radius; x += 1) {
      const idx = y * width + x;
      const w = weights[idx] * blendStrength;
      if (w <= 0.02) continue;

      let sr = 0;
      let sg = 0;
      let sb = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy += 2) {
        for (let dx = -radius; dx <= radius; dx += 2) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          sr += src[nIdx];
          sg += src[nIdx + 1];
          sb += src[nIdx + 2];
          count += 1;
        }
      }
      const p = idx * 4;
      const avgR = sr / count;
      const avgG = sg / count;
      const avgB = sb / count;
      data[p] = clampByte(src[p] * (1 - w) + avgR * w);
      data[p + 1] = clampByte(src[p + 1] * (1 - w) + avgG * w);
      data[p + 2] = clampByte(src[p + 2] * (1 - w) + avgB * w);
    }
  }
}

export function renderClinicalRetouchLayers(
  img: HTMLImageElement,
  beforeCanvas: HTMLCanvasElement,
  afterCanvas: HTMLCanvasElement,
  preset: ClinicalRetouchPreset
): void {
  const naturalW = img.naturalWidth || 1280;
  const naturalH = img.naturalHeight || 720;
  const maxW = 1280;
  const scale = naturalW > maxW ? maxW / naturalW : 1;
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  beforeCanvas.width = width;
  beforeCanvas.height = height;
  afterCanvas.width = width;
  afterCanvas.height = height;

  const beforeCtx = beforeCanvas.getContext('2d', { willReadFrequently: true });
  const afterCtx = afterCanvas.getContext('2d', { willReadFrequently: true });
  if (!beforeCtx || !afterCtx) return;

  beforeCtx.clearRect(0, 0, width, height);
  afterCtx.clearRect(0, 0, width, height);
  beforeCtx.drawImage(img, 0, 0, width, height);
  afterCtx.drawImage(img, 0, 0, width, height);

  const baseImage = beforeCtx.getImageData(0, 0, width, height);
  const src = baseImage.data;
  const beforeImgData = beforeCtx.createImageData(width, height);
  const afterImgData = afterCtx.createImageData(width, height);
  beforeImgData.data.set(src);
  afterImgData.data.set(src);

  const bData = beforeImgData.data;
  const aData = afterImgData.data;

  const pixelCount = width * height;
  const weights = new Float32Array(pixelCount);

  for (let y = 0; y < height; y += 1) {
    const ny = y / height;
    for (let x = 0; x < width; x += 1) {
      const nx = x / width;
      const idx = y * width + x;
      const p = idx * 4;
      weights[idx] = computeLocalizedZoneMaskWeight(
        preset,
        nx,
        ny,
        src[p],
        src[p + 1],
        src[p + 2]
      );
    }
  }

  const rand = mulberry32(
    preset.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17)
  );

  if (preset === 'dental-whitening') {
    for (let i = 0; i < pixelCount; i += 1) {
      const w = weights[i];
      if (w <= 0.005) continue;
      const p = i * 4;
      const r = src[p];
      const g = src[p + 1];
      const b = src[p + 2];

      // Avant: realistic tea-stained / yellowish dentin tint (#E5D19B) + mild surface dullness
      const targetBeforeR = r * 0.94 + 8 * w;
      const targetBeforeG = g * 0.87;
      const targetBeforeB = b * 0.62;
      bData[p] = clampByte(r * (1 - w) + targetBeforeR * w);
      bData[p + 1] = clampByte(g * (1 - w) + targetBeforeG * w);
      bData[p + 2] = clampByte(b * (1 - w) + targetBeforeB * w);

      // Après: bright natural pearl-white (#F7F8FA) preserving natural tooth grooves + gloss
      const lum = (r + g + b) / 3;
      const targetAfterR = Math.min(246, lum * 1.07 + 10);
      const targetAfterG = Math.min(247, lum * 1.08 + 12);
      const targetAfterB = Math.min(250, lum * 1.11 + 17);
      const aw = w * 0.78;
      aData[p] = clampByte(r * (1 - aw) + targetAfterR * aw);
      aData[p + 1] = clampByte(g * (1 - aw) + targetAfterG * aw);
      aData[p + 2] = clampByte(b * (1 - aw) + targetAfterB * aw);
    }
  } else if (preset === 'dental-alignment') {
    for (let y = 0; y < height; y += 1) {
      const ny = y / height;
      for (let x = 0; x < width; x += 1) {
        const nx = x / width;
        const idx = y * width + x;
        const w = weights[idx];
        if (w <= 0.005) continue;
        const p = idx * 4;
        const r = src[p];
        const g = src[p + 1];
        const b = src[p + 2];

        // Avant: uneven per-tooth shading + minor incisal wear near biting edge
        const toothWave = 0.5 + 0.5 * Math.sin((nx - 0.5) * 32 + 0.6);
        const lateralAsymmetry = smoothstep(0.06, 0.24, Math.abs(nx - 0.5));
        const incisalWear = ellipseWeight(nx, ny, 0.43, 0.515, 0.045, 0.018) * 0.85;
        const shadeFactor = 0.55 + 0.45 * toothWave + 0.25 * lateralAsymmetry;

        const targetBeforeR = r * (0.93 - incisalWear * 0.14);
        const targetBeforeG = g * (0.86 - 0.05 * shadeFactor - incisalWear * 0.15);
        const targetBeforeB = b * (0.64 - 0.08 * shadeFactor - incisalWear * 0.16);

        bData[p] = clampByte(r * (1 - w) + targetBeforeR * w);
        bData[p + 1] = clampByte(g * (1 - w) + targetBeforeG * w);
        bData[p + 2] = clampByte(b * (1 - w) + targetBeforeB * w);

        // Après: harmonious, bright, uniform pearl-white dental smile
        const lum = (r + g + b) / 3;
        const targetAfterR = Math.min(246, lum * 1.07 + 10);
        const targetAfterG = Math.min(247, lum * 1.08 + 12);
        const targetAfterB = Math.min(250, lum * 1.11 + 17);
        const aw = w * 0.78;
        aData[p] = clampByte(r * (1 - aw) + targetAfterR * aw);
        aData[p + 1] = clampByte(g * (1 - aw) + targetAfterG * aw);
        aData[p + 2] = clampByte(b * (1 - aw) + targetAfterB * aw);
      }
    }
  } else if (preset === 'laser-epilation') {
    // Après: subtle silky pore smoothing ONLY inside skin zone
    applyLocalizedSoftSmooth(aData, src, weights, width, height, 0.24);

    // Avant: draw fine natural curved dark hair stubble & slight post-shaving dots onto overlay
    const [overlay, oCtx] = createOverlayCanvas(width, height);
    oCtx.lineCap = 'round';

    for (let i = 0; i < 880; i += 1) {
      const nx = 0.15 + rand() * 0.82;
      const ny = 0.08 + rand() * 0.86;
      const px = Math.floor(nx * width);
      const py = Math.floor(ny * height);
      const w = weights[py * width + px];
      if (w < 0.3) continue;

      const x0 = nx * width;
      const y0 = ny * height;

      // Slight post-shaving follicular dot
      if (rand() < 0.76) {
        oCtx.fillStyle = `rgba(148, 76, 64, ${(0.24 + rand() * 0.18).toFixed(2)})`;
        oCtx.beginPath();
        oCtx.arc(x0, y0, (1.15 + rand() * 1.05) * (width / 1000), 0, Math.PI * 2);
        oCtx.fill();
      }

      // Fine curved dark hair follicle / stubble
      const len = (5.0 + rand() * 8.0) * (width / 1000);
      const angle = -0.82 + (rand() - 0.5) * 0.45;
      const x1 = x0 + Math.cos(angle) * len;
      const y1 = y0 + Math.sin(angle) * len;
      const cx = (x0 + x1) * 0.5 + (rand() - 0.5) * 2.2;
      const cy = (y0 + y1) * 0.5 - 1.2;

      oCtx.strokeStyle = `rgba(34, 24, 20, ${(0.62 + rand() * 0.28).toFixed(2)})`;
      oCtx.lineWidth = (1.0 + rand() * 0.65) * (width / 1000);
      oCtx.beginPath();
      oCtx.moveTo(x0, y0);
      oCtx.quadraticCurveTo(cx, cy, x1, y1);
      oCtx.stroke();
    }

    const oData = oCtx.getImageData(0, 0, width, height).data;
    drawOverlayMasked(bData, oData, weights);
  } else if (preset === 'laser-rejuvenation') {
    // Après: luminous firm smooth skin texture ONLY inside cheek/temple zone
    applyLocalizedSoftSmooth(aData, src, weights, width, height, 0.34);
    for (let i = 0; i < pixelCount; i += 1) {
      const w = weights[i];
      if (w <= 0.01) continue;
      const p = i * 4;
      aData[p] = clampByte(aData[p] + 7 * w);
      aData[p + 1] = clampByte(aData[p + 1] + 6 * w);
      aData[p + 2] = clampByte(aData[p + 2] + 5 * w);

      // Avant: duller skin tone + slightly amplified micro-contrast
      const luma = (src[p] + src[p + 1] + src[p + 2]) / 3;
      const contrastBoost = (src[p] - luma) * 0.14;
      bData[p] = clampByte(src[p] * (1 - 0.09 * w) + contrastBoost * w);
      bData[p + 1] = clampByte(src[p + 1] * (1 - 0.1 * w) + contrastBoost * w);
      bData[p + 2] = clampByte(src[p + 2] * (1 - 0.08 * w) + contrastBoost * w);
    }

    // Avant: localized enlarged pores on cheek + fine expression lines on outer temple
    const [, oCtx] = createOverlayCanvas(width, height);
    for (let i = 0; i < 240; i += 1) {
      const nx = 0.44 + rand() * 0.25;
      const ny = 0.42 + rand() * 0.28;
      const px = Math.floor(nx * width);
      const py = Math.floor(ny * height);
      if (weights[py * width + px] < 0.3) continue;
      oCtx.fillStyle = `rgba(128, 86, 72, ${(0.18 + rand() * 0.14).toFixed(2)})`;
      oCtx.beginPath();
      oCtx.arc(nx * width, ny * height, (0.9 + rand() * 0.9) * (width / 1000), 0, Math.PI * 2);
      oCtx.fill();
    }
    // Fine crow's-feet lines around outer eye temple (0.48..0.60, 0.33..0.43)
    oCtx.lineCap = 'round';
    const lineSpecs = [
      [0.57, 0.355, 0.515, 0.338],
      [0.568, 0.372, 0.508, 0.374],
      [0.564, 0.39, 0.512, 0.408],
      [0.545, 0.365, 0.495, 0.352],
    ];
    for (const [x1, y1, x2, y2] of lineSpecs) {
      oCtx.strokeStyle = 'rgba(132, 88, 76, 0.36)';
      oCtx.lineWidth = 1.35 * (width / 1000);
      oCtx.beginPath();
      oCtx.moveTo(x1 * width, y1 * height);
      oCtx.quadraticCurveTo(
        ((x1 + x2) * 0.5) * width,
        ((y1 + y2) * 0.5 + 0.005) * height,
        x2 * width,
        y2 * height
      );
      oCtx.stroke();
    }
    drawOverlayMasked(bData, oCtx.getImageData(0, 0, width, height).data, weights);
  } else if (preset === 'derma-acne') {
    // Après: calm clear smooth skin on the cheek
    applyLocalizedSoftSmooth(aData, src, weights, width, height, 0.22);

    // Avant: localized reddish acne blemishes, inflammatory spots & visible pores ONLY on cheek
    const [, oCtx] = createOverlayCanvas(width, height);
    const spots = [
      [0.48, 0.52, 7.5],
      [0.53, 0.57, 8.5],
      [0.46, 0.61, 6.5],
      [0.57, 0.51, 6.0],
      [0.51, 0.47, 5.5],
      [0.55, 0.63, 7.0],
      [0.44, 0.56, 5.2],
      [0.59, 0.58, 6.2],
      [0.49, 0.66, 5.8],
      [0.52, 0.53, 4.8],
      [0.47, 0.49, 4.6],
      [0.56, 0.46, 4.5],
      [0.61, 0.53, 4.4],
      [0.53, 0.68, 5.0],
    ];
    const scaleFactor = width / 1000;
    for (const [sx, sy, rad] of spots) {
      const cx = sx * width;
      const cy = sy * height;
      const rPx = rad * scaleFactor * 1.9;
      const grad = oCtx.createRadialGradient(cx, cy, 0, cx, cy, rPx);
      grad.addColorStop(0, 'rgba(154, 46, 44, 0.62)');
      grad.addColorStop(0.45, 'rgba(184, 70, 64, 0.40)');
      grad.addColorStop(1, 'rgba(194, 88, 80, 0)');
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(cx, cy, rPx, 0, Math.PI * 2);
      oCtx.fill();

      // Tiny central papule texture
      oCtx.fillStyle = 'rgba(135, 34, 34, 0.45)';
      oCtx.beginPath();
      oCtx.arc(cx + 0.5, cy + 0.5, rad * scaleFactor * 0.42, 0, Math.PI * 2);
      oCtx.fill();
    }
    // Enlarged localized pores around cheek blemishes
    for (let i = 0; i < 160; i += 1) {
      const nx = 0.41 + rand() * 0.22;
      const ny = 0.43 + rand() * 0.28;
      const px = Math.floor(nx * width);
      const py = Math.floor(ny * height);
      if (weights[py * width + px] < 0.35) continue;
      oCtx.fillStyle = `rgba(138, 72, 64, ${(0.18 + rand() * 0.14).toFixed(2)})`;
      oCtx.beginPath();
      oCtx.arc(nx * width, ny * height, (0.85 + rand() * 0.75) * scaleFactor, 0, Math.PI * 2);
      oCtx.fill();
    }
    drawOverlayMasked(bData, oCtx.getImageData(0, 0, width, height).data, weights);
  } else if (preset === 'derma-melasma') {
    // Avant: localized brownish hyperpigmentation / melasma & solar spots on cheekbone
    const [, oCtx] = createOverlayCanvas(width, height);
    const scaleFactor = width / 1000;
    const patches = [
      [0.46, 0.38, 48, 30, -0.25, 0.38],
      [0.54, 0.43, 42, 26, 0.15, 0.35],
      [0.39, 0.45, 34, 24, -0.1, 0.32],
      [0.5, 0.48, 36, 20, 0.2, 0.28],
    ];
    for (const [px, py, rx, ry, rot, alpha] of patches) {
      oCtx.save();
      oCtx.translate(px * width, py * height);
      oCtx.rotate(rot);
      oCtx.scale(1, ry / rx);
      const grad = oCtx.createRadialGradient(0, 0, 0, 0, 0, rx * scaleFactor);
      grad.addColorStop(0, `rgba(118, 66, 36, ${alpha})`);
      grad.addColorStop(0.6, `rgba(134, 80, 46, ${(alpha * 0.65).toFixed(2)})`);
      grad.addColorStop(1, 'rgba(140, 88, 54, 0)');
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(0, 0, rx * scaleFactor, 0, Math.PI * 2);
      oCtx.fill();
      oCtx.restore();
    }
    // Smaller scattered lentigo sun spots inside cheekbone zone
    for (let i = 0; i < 42; i += 1) {
      const nx = 0.34 + rand() * 0.28;
      const ny = 0.29 + rand() * 0.25;
      const pIdx = Math.floor(ny * height) * width + Math.floor(nx * width);
      if (weights[pIdx] < 0.35) continue;
      const rPx = (2.8 + rand() * 5.2) * scaleFactor;
      const grad = oCtx.createRadialGradient(
        nx * width,
        ny * height,
        0,
        nx * width,
        ny * height,
        rPx
      );
      grad.addColorStop(0, `rgba(104, 56, 30, ${(0.34 + rand() * 0.22).toFixed(2)})`);
      grad.addColorStop(1, 'rgba(116, 68, 38, 0)');
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(nx * width, ny * height, rPx, 0, Math.PI * 2);
      oCtx.fill();
    }
    drawOverlayMasked(bData, oCtx.getImageData(0, 0, width, height).data, weights);
  } else if (preset === 'doctor-inflammation') {
    // Avant: localized inflammatory redness and subtle swelling contour ONLY on knee joint zone
    for (let y = 0; y < height; y += 1) {
      const ny = y / height;
      for (let x = 0; x < width; x += 1) {
        const nx = x / width;
        const idx = y * width + x;
        const w = weights[idx];
        if (w <= 0.005) continue;
        const p = idx * 4;
        const r = src[p];
        const g = src[p + 1];
        const b = src[p + 2];

        const edemaCore = ellipseWeight(nx, ny, 0.515, 0.355, 0.072, 0.082, -0.2);
        const swellSheen = edemaCore * 9;

        bData[p] = clampByte(r + 28 * w + swellSheen);
        bData[p + 1] = clampByte(g - 26 * w + swellSheen * 0.28);
        bData[p + 2] = clampByte(b - 28 * w + swellSheen * 0.2);
      }
    }
  } else if (preset === 'doctor-recovery') {
    // Avant: localized pre-protocol soft-tissue redness & resolving ecchymosis on forearm
    const [, oCtx] = createOverlayCanvas(width, height);
    const scaleFactor = width / 1000;
    const patches = [
      [0.54, 0.465, 58, 28, 0.05, 0.44, 'rgba(156, 56, 60, 0.44)', 'rgba(182, 82, 72, 0.26)'],
      [0.51, 0.475, 36, 18, -0.1, 0.38, 'rgba(122, 68, 92, 0.38)', 'rgba(164, 96, 68, 0.20)'],
      [0.59, 0.46, 32, 16, 0.12, 0.34, 'rgba(170, 88, 58, 0.34)', 'rgba(186, 114, 72, 0.16)'],
    ] as const;

    for (const [px, py, rx, ry, rot, , c0, c1] of patches) {
      oCtx.save();
      oCtx.translate(px * width, py * height);
      oCtx.rotate(rot);
      oCtx.scale(1, ry / rx);
      const grad = oCtx.createRadialGradient(0, 0, 0, 0, 0, rx * scaleFactor);
      grad.addColorStop(0, c0);
      grad.addColorStop(0.55, c1);
      grad.addColorStop(1, 'rgba(160, 90, 70, 0)');
      oCtx.fillStyle = grad;
      oCtx.beginPath();
      oCtx.arc(0, 0, rx * scaleFactor, 0, Math.PI * 2);
      oCtx.fill();
      oCtx.restore();
    }
    drawOverlayMasked(bData, oCtx.getImageData(0, 0, width, height).data, weights);
  }

  beforeCtx.putImageData(beforeImgData, 0, 0);
  afterCtx.putImageData(afterImgData, 0, 0);
}
