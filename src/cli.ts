#!/usr/bin/env node
import { access } from "node:fs/promises";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineCommand, runMain } from "citty";
import { assemblePrompt } from "./assemble";
import {
  loadBrandConfig,
  resolveReferencePaths,
  resolveRepoPath,
} from "./config";
import {
  assertGatewayAuth,
  generateBadgeImage,
  usesMultimodalGenerateText,
} from "./generate";
import {
  parseFamilyOverride,
  routeRequest,
  type BadgeFamily,
} from "./router";
import {
  brandForSidecar,
  buildBasenames,
  ensureOutputDir,
  writeImage,
  writeSidecar,
  type Sidecar,
} from "./write";

loadDotenv({ path: path.resolve(process.cwd(), ".env") });

const DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview";

const parseModels = (model: string | undefined, compare: string | undefined) => {
  if (compare?.trim()) {
    const list = compare
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (list.length === 0) {
      throw new Error("--compare requires a comma-separated list of model slugs");
    }
    return list;
  }
  return [model?.trim() || DEFAULT_MODEL];
};

const ensureFileExists = async (filePath: string, label: string) => {
  try {
    await access(filePath);
  } catch {
    throw new Error(`${label} not found: ${filePath}`);
  }
};

const main = defineCommand({
  meta: {
    name: "generate",
    description: "Generate a Guild Enamel badge via Vercel AI Gateway",
  },
  args: {
    request: {
      type: "positional",
      description: 'Short request, e.g. "50K ultra" or "10x streak"',
      required: true,
    },
    model: {
      type: "string",
      description: `Image model slug (default: ${DEFAULT_MODEL})`,
      alias: "m",
    },
    compare: {
      type: "string",
      description: "Comma-separated model slugs to generate side-by-side",
    },
    family: {
      type: "string",
      description: "Force family: achievement|distance|streak|limited",
      alias: "f",
    },
    logo: {
      type: "string",
      description: "Path to logo image (overrides brand.config.json)",
      alias: "l",
    },
    primary: {
      type: "string",
      description: "Override primaryHex",
    },
    accent1: {
      type: "string",
      description: "Override accentHex1",
    },
    accent2: {
      type: "string",
      description: "Override accentHex2",
    },
    "dry-run": {
      type: "boolean",
      description: "Assemble prompt and write sidecar only (no API call)",
      default: false,
    },
    refs: {
      type: "boolean",
      description:
        "Attach original Guild Enamel contact-sheet style references (off by default; they leak numerals/grids)",
      default: false,
    },
  },
  async run({ args }) {
    const dryRun = Boolean(args["dry-run"]);
    const models = parseModels(args.model, args.compare);

    let familyOverride: BadgeFamily | undefined;
    if (args.family) {
      familyOverride = parseFamilyOverride(args.family);
    }

    const brand = await loadBrandConfig({
      logoPath: args.logo ? resolveRepoPath(args.logo) : undefined,
      primaryHex: args.primary,
      accentHex1: args.accent1,
      accentHex2: args.accent2,
    });

    await ensureFileExists(brand.logoPath, "Logo");
    const referencePaths = args.refs ? resolveReferencePaths() : [];
    for (const ref of referencePaths) {
      await ensureFileExists(ref, "Style reference");
    }

    const route = routeRequest(String(args.request), familyOverride);
    const outputDir = await ensureOutputDir();

    console.log(
      `Routed → family=${route.family} tier=${route.tier} extracts=${JSON.stringify(route.extracts)}`,
    );

    if (!dryRun) {
      assertGatewayAuth();
    }

    for (const model of models) {
      // Only Gemini-style multimodal generateText path actually sends logo/refs
      const attachImages = usesMultimodalGenerateText(model);
      const prompt = assemblePrompt(route, brand, { attachImages });
      const { base, jsonName } = buildBasenames(route.request, model);

      const sidecar: Sidecar = {
        request: route.request,
        family: route.family,
        tier: route.tier,
        extracts: route.extracts,
        whatVaries: route.whatVaries,
        model,
        prompt,
        brand: brandForSidecar(brand),
        imagesAttached: {
          logo: attachImages,
          refs: attachImages && referencePaths.length > 0,
        },
        dryRun,
        outputImage: null,
        createdAt: new Date().toISOString(),
      };

      if (dryRun) {
        const jsonPath = await writeSidecar(outputDir, jsonName, sidecar);
        console.log(`[dry-run] ${model}`);
        console.log(prompt);
        console.log(`Wrote ${path.relative(process.cwd(), jsonPath)}`);
        continue;
      }

      console.log(`Generating with ${model}…`);
      const result = await generateBadgeImage({
        model,
        prompt,
        logoPath: brand.logoPath,
        referencePaths,
      });

      const { imagePath, imageName } = await writeImage(
        outputDir,
        base,
        result.image,
        result.mediaType,
      );

      sidecar.imagesAttached = result.imagesAttached;
      sidecar.outputImage = imageName;

      const jsonPath = await writeSidecar(outputDir, jsonName, sidecar);
      console.log(
        `Saved ${path.relative(process.cwd(), imagePath)} + ${path.relative(process.cwd(), jsonPath)} (${result.mode})`,
      );
    }
  },
});

runMain(main).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
