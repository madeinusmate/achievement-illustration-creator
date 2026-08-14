#!/usr/bin/env node
/**
 * Generate one Guild Enamel achievement badge per PuffPal achievement.
 * Usage: pnpm generate:puffpal [--dry-run] [--limit N] [--start ID]
 */
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { assemblePrompt } from "./assemble";
import {
  loadBrandConfig,
  repoRoot,
} from "./config";
import {
  assertGatewayAuth,
  generateBadgeImage,
  usesMultimodalGenerateText,
} from "./generate";
import { routeRequest } from "./router";
import { specForAchievement } from "./puffpal-motifs";
import {
  brandForSidecar,
  writeImage,
  writeSidecar,
  type Sidecar,
} from "./write";

loadDotenv({ path: path.resolve(process.cwd(), ".env") });

const DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview";

type Achievement = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type Catalog = {
  achievements: Achievement[];
};

const fileExists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const parseArgs = () => {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let limit: number | undefined;
  let startId: string | undefined;
  let model = DEFAULT_MODEL;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--limit") limit = Number(argv[++i]);
    else if (arg === "--start") startId = argv[++i];
    else if (arg === "--model") model = argv[++i] ?? model;
  }

  return { dryRun, limit, startId, model };
};

const motifRequest = (a: Achievement) =>
  `${a.title} (${a.description})`;

const main = async () => {
  const { dryRun, limit, startId, model } = parseArgs();
  const catalogPath = path.join(repoRoot(), "puffpal-achievements.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as Catalog;

  let list = catalog.achievements;
  if (startId) {
    const idx = list.findIndex((a) => a.id === startId);
    if (idx === -1) throw new Error(`Unknown start id: ${startId}`);
    list = list.slice(idx);
  }
  if (limit !== undefined && Number.isFinite(limit)) {
    list = list.slice(0, limit);
  }

  const brand = await loadBrandConfig();
  const referencePaths: string[] = [];
  const outputDir = path.join(repoRoot(), "output", "puffpal");
  await mkdir(outputDir, { recursive: true });

  if (!dryRun) assertGatewayAuth();

  const attachImages = usesMultimodalGenerateText(model);
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Generating ${list.length} achievement badges → ${outputDir} (model=${model}${dryRun ? ", dry-run" : ""})`,
  );

  for (const [i, achievement] of list.entries()) {
    const label = `[${i + 1}/${list.length}] ${achievement.id}`;
    const spec = specForAchievement(achievement.id, achievement);
    const request = motifRequest(achievement);
    const route = routeRequest(request, {
      family: "achievement",
      motif: spec.motif,
      numeral: spec.numeral,
      tier: spec.tier,
    });

    const prompt = assemblePrompt(route, brand, { attachImages });
    const base = achievement.id;

    // Skip if any image already exists for this id
    const existingExts = ["png"];
    let already = false;
    for (const ext of existingExts) {
      if (await fileExists(path.join(outputDir, `${base}.${ext}`))) {
        already = true;
        break;
      }
    }
    if (already && !dryRun) {
      console.log(`${label} skip (exists)`);
      skipped++;
      continue;
    }

    const sidecar: Sidecar = {
      request,
      family: route.family,
      tier: route.tier,
      extracts: {
        ...route.extracts,
        achievementId: achievement.id,
        achievementCategory: achievement.category,
      },
      whatVaries: route.whatVaries,
      model,
      prompt,
      brand: brandForSidecar(brand),
      imagesAttached: { logo: attachImages, refs: false },
      dryRun,
      outputImage: null,
      createdAt: new Date().toISOString(),
    };

    if (dryRun) {
      await writeSidecar(outputDir, `${base}.json`, sidecar);
      console.log(`${label} dry-run → ${base}.json`);
      ok++;
      continue;
    }

    try {
      console.log(`${label} generating…`);
      const result = await generateBadgeImage({
        model,
        prompt,
        logoPath: brand.logoPath,
        referencePaths,
      });
      const { imageName } = await writeImage(
        outputDir,
        base,
        result.image,
        result.mediaType,
      );
      sidecar.imagesAttached = result.imagesAttached;
      sidecar.outputImage = imageName;
      await writeSidecar(outputDir, `${base}.json`, sidecar);
      console.log(`${label} saved ${imageName} (png cutout, ${result.mode})`);
      ok++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${label} FAILED: ${message}`);
      sidecar.outputImage = null;
      await writeSidecar(outputDir, `${base}.error.json`, {
        ...sidecar,
        extracts: { ...sidecar.extracts, error: message },
      });
    }
  }

  console.log(`Done. ok=${ok} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
