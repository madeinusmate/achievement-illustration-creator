import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type BrandConfig = {
  shape: string;
  borderMm: number;
  primaryHex: string;
  accentHex1: string;
  accentHex2: string;
  logoPath: string;
};

export type BrandOverrides = {
  logoPath?: string;
  primaryHex?: string;
  accentHex1?: string;
  accentHex2?: string;
  shape?: string;
  borderMm?: number;
};

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const repoRoot = () =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Resolve a path relative to the repo root. Leading "/assets/..." style
 *  paths are treated as repo-relative (common config mistake), not FS root.
 *  Real absolute paths like /Users/... or /home/... are kept as-is. */
export const resolveRepoPath = (relativeOrAbsolute: string) => {
  const looksLikeOsAbsolute =
    path.isAbsolute(relativeOrAbsolute) &&
    /^\/(Users|home|var|tmp|private|Volumes|opt|usr|etc|mnt)\b/.test(
      relativeOrAbsolute,
    );

  if (looksLikeOsAbsolute) {
    return relativeOrAbsolute;
  }

  const relative = relativeOrAbsolute.replace(/^\/+/, "");
  return path.resolve(repoRoot(), relative);
};

const assertHex = (value: string, field: string) => {
  if (!HEX.test(value)) {
    throw new Error(`${field} must be a hex color like #FA4D1F (got ${value})`);
  }
};

export const loadBrandConfig = async (
  overrides: BrandOverrides = {},
): Promise<BrandConfig> => {
  const configPath = path.join(repoRoot(), "brand.config.json");
  const raw = JSON.parse(await readFile(configPath, "utf8")) as Partial<BrandConfig>;

  const config: BrandConfig = {
    shape: overrides.shape ?? raw.shape ?? "octagon",
    borderMm: overrides.borderMm ?? raw.borderMm ?? 4,
    primaryHex: overrides.primaryHex ?? raw.primaryHex ?? "#FA4D1F",
    accentHex1: overrides.accentHex1 ?? raw.accentHex1 ?? "#CC4200",
    accentHex2: overrides.accentHex2 ?? raw.accentHex2 ?? "#FFFFFF",
    logoPath: overrides.logoPath ?? raw.logoPath ?? "",
  };

  if (!config.logoPath) {
    throw new Error(
      "Logo path required: set logoPath in brand.config.json or pass --logo",
    );
  }

  assertHex(config.primaryHex, "primaryHex");
  assertHex(config.accentHex1, "accentHex1");
  assertHex(config.accentHex2, "accentHex2");

  config.logoPath = resolveRepoPath(config.logoPath);
  return config;
};

/** Contact sheets from the original skill. Opt-in only — attaching them
 *  by default makes models copy 1K/10K grids instead of the requested badge. */
export const REFERENCE_IMAGES = [
  "archive-skill/references/base-badge-numerals.png",
  "archive-skill/references/streak-chips.png",
  "archive-skill/references/holiday-editions.png",
] as const;

export const resolveReferencePaths = () =>
  REFERENCE_IMAGES.map((rel) => resolveRepoPath(rel));
