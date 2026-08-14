import type { BrandConfig } from "./config";
import type { RouteResult } from "./router";
import { familyDisplayName } from "./router";

const LOCKED_PHOTO =
  "Orthographic product render of a single physical badge: dead-on, centered, even studio lighting. Isolated on a perfectly flat solid #FF00FF (pure magenta) background. No drop shadow, no contact shadow, no reflection, no ground plane, no table, no glow, no vignette. Frame contains exactly one badge. No grid, no contact sheet, no extra badges, no hands, no packaging. Do not use magenta or fuchsia anywhere on the badge itself.";

const LOCKED_MATERIAL =
  "Material: raised polished metal border, glossy recessed enamel cells. Icons and numerals are embossed raised metal, sculpted like a die-stamped coin—never flat-printed, never colored graphics, never title lettering.";

export const assemblePrompt = (
  route: RouteResult,
  brand: BrandConfig,
  options: { attachImages: boolean },
): string => {
  const familyName = familyDisplayName(route.family);
  const matchClause = options.attachImages
    ? "If images are attached, use them only for metal/enamel material, lighting, and camera angle. Ignore any numerals, extra badges, holiday silhouettes, or icons in those images unless they match the subject below."
    : "Match Guild Enamel house style for silhouette, lattice, material, lighting, and camera angle.";

  const colorClause =
    route.family === "limited"
      ? "Use 2–3 occasion enamel colors; brand axis color rules do not apply."
      : route.family === "streak"
        ? `Silhouette: plain circle with a raised polished ${brand.borderMm}mm metal ring. Enamel fill: solid ${brand.primaryHex} across the full face—no facets, no color-blocking, no lattice.`
        : `Silhouette: ${brand.shape} with a raised polished ${brand.borderMm}mm metal border and a 5-cell lattice (center diamond, top, bottom, left, right). Enamel colors: center diamond = ${brand.primaryHex}, top+bottom cells = ${brand.accentHex1}, left+right cells = ${brand.accentHex2}.`;

  const logoClause = options.attachImages
    ? "Emboss the attached logo as a hallmark on the lower rim, matching the current metal tone, no larger than ~8% of badge width."
    : "Emboss a simple monogram hallmark on the lower rim, matching the current metal tone, no larger than ~8% of badge width.";

  const numeralNote =
    route.center === "numeral"
      ? "\n\nThe specified numeral is the hero of the badge: horizontally centered on the vertical axis, equal side clearance, tall condensed geometric digits. Do not substitute 1K, 10K, or any other reference numeral."
      : "";

  const motifNote =
    route.center === "motif"
      ? "\n\nThe specified motif sits in the center diamond, large enough to read at app-icon size. One simple iconic silhouette—no scene, no extra objects, no text."
      : "\n\nAny supporting motif is a single simple iconic silhouette in the top cell only.";

  const platinumNote =
    route.tier === "platinum"
      ? "\n\nPlatinum must read visibly brighter and cooler than silver."
      : "";

  return `Generate a reference image of one Guild Enamel ${familyName}. ${LOCKED_PHOTO} ${LOCKED_MATERIAL} ${matchClause} ${colorClause} ${logoClause}

Subject: ${route.whatVaries}${numeralNote}${motifNote}${platinumNote}

High resolution, sharp focus, realistic metal specular highlight and enamel gloss. No title text, no captions, no watermark, no other lettering besides an allowed numeral. Magenta background only — the badge must be fully surrounded by #FF00FF with a clean silhouette.`;
};
