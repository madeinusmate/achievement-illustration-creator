import sharp from "sharp";

const KEY = { r: 255, g: 0, b: 255 };

const colorDist = (
  r: number,
  g: number,
  b: number,
  kr: number,
  kg: number,
  kb: number,
) => {
  const dr = r - kr;
  const dg = g - kg;
  const db = b - kb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const isMagentaKey = (r: number, g: number, b: number) =>
  colorDist(r, g, b, KEY.r, KEY.g, KEY.b) < 72 ||
  (r > 170 && b > 170 && g < 130 && (r + b) / 2 - g > 70);

const sampleCorner = (
  data: Buffer,
  width: number,
  height: number,
  x0: number,
  y0: number,
) => {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = y0; y < y0 + 6 && y < height; y++) {
    for (let x = x0; x < x0 + 6 && x < width; x++) {
      const i = (y * width + x) * 4;
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n };
};

const isBackground = (
  r: number,
  g: number,
  b: number,
  corner: { r: number; g: number; b: number },
) =>
  isMagentaKey(r, g, b) || colorDist(r, g, b, corner.r, corner.g, corner.b) < 38;

/** Knock out the generation backdrop to alpha. Preserves white enamel
 *  because flood-fill starts from the frame edge, not interior cells. */
export const punchBackground = async (input: Uint8Array): Promise<Buffer> => {
  const { data, info } = await sharp(Buffer.from(input))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const corner = sampleCorner(pixels, width, height, 0, 0);

  const queue: number[] = [];
  const pushIfBg = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackground(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, corner)) {
      return;
    }
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * 4;
    pixels[i + 3] = 0;
    pushIfBg(x + 1, y);
    pushIfBg(x - 1, y);
    pushIfBg(x, y + 1);
    pushIfBg(x, y - 1);
  }

  // Soften 1px fringe next to punched pixels (JPEG magenta/gray halo)
  const copy = Buffer.from(pixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (copy[i + 3] === 0) continue;
      const neighborClear =
        copy[((y - 1) * width + x) * 4 + 3] === 0 ||
        copy[((y + 1) * width + x) * 4 + 3] === 0 ||
        copy[(idx - 1) * 4 + 3] === 0 ||
        copy[(idx + 1) * 4 + 3] === 0;
      if (!neighborClear) continue;
      const r = copy[i]!;
      const g = copy[i + 1]!;
      const b = copy[i + 2]!;
      if (isBackground(r, g, b, corner) || isMagentaKey(r, g, b)) {
        pixels[i + 3] = 0;
      }
    }
  }

  return sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
};
