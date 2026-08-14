import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./config";
import type { BrandConfig } from "./config";
import { punchBackground } from "./cutout";
import type { RouteResult } from "./router";

export type Sidecar = {
  request: string;
  family: RouteResult["family"];
  tier: RouteResult["tier"];
  extracts: RouteResult["extracts"] & Record<string, string | undefined>;
  whatVaries: string;
  model: string | null;
  prompt: string;
  brand: {
    shape: string;
    borderMm: number;
    primaryHex: string;
    accentHex1: string;
    accentHex2: string;
    logoPath: string;
  };
  imagesAttached: {
    logo: boolean;
    refs: boolean;
  };
  dryRun: boolean;
  outputImage: string | null;
  createdAt: string;
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "badge";

export const modelSlug = (model: string): string =>
  model.replace(/\//g, "-").replace(/[^a-zA-Z0-9._-]+/g, "-");

export const extensionForMediaType = (mediaType: string): string => {
  if (mediaType.includes("jpeg") || mediaType.includes("jpg")) return "jpg";
  if (mediaType.includes("webp")) return "webp";
  if (mediaType.includes("gif")) return "gif";
  return "png";
};

export const ensureOutputDir = async () => {
  const dir = path.join(repoRoot(), "output");
  await mkdir(dir, { recursive: true });
  return dir;
};

export const buildBasenames = (request: string, model: string) => {
  const base = `${slugify(request)}__${modelSlug(model)}`;
  return {
    base,
    jsonName: `${base}.json`,
  };
};

export const writeSidecar = async (
  outputDir: string,
  jsonName: string,
  sidecar: Sidecar,
) => {
  const jsonPath = path.join(outputDir, jsonName);
  await writeFile(jsonPath, `${JSON.stringify(sidecar, null, 2)}\n`, "utf8");
  return jsonPath;
};

export const writeImage = async (
  outputDir: string,
  base: string,
  image: Uint8Array,
  _mediaType: string,
) => {
  const png = await punchBackground(image);
  const imageName = `${base}.png`;
  const imagePath = path.join(outputDir, imageName);
  await writeFile(imagePath, png);
  return { imagePath, imageName };
};

export const brandForSidecar = (brand: BrandConfig) => ({
  shape: brand.shape,
  borderMm: brand.borderMm,
  primaryHex: brand.primaryHex,
  accentHex1: brand.accentHex1,
  accentHex2: brand.accentHex2,
  logoPath: brand.logoPath,
});
