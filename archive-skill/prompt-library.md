# Prompt library

Tested, working templates for each Guild Enamel family. All parameters (`SHAPE`, `PRIMARY_HEX`, `ACCENT_HEX_1`, `ACCENT_HEX_2`, `LOGO`) come from the "Brand tokens" section of `SKILL.md`—substitute before generating. All four share the studio photography and material rules from `SKILL.md`; only the family-specific construction is repeated below.

---

## 1. Achievement badge—category facet

```
Generate a set of 8 reference images of a collectible enamel pin badge.
Studio product photography: dead-on and centered, soft diffuse studio
lighting from the upper left, subtle drop shadow, plain light-gray
seamless background. No hands, no packaging, no text anywhere.

BADGE CONSTRUCTION—identical across all 8 images:
- Silhouette: SHAPE, with a raised polished BORDER_MM metal border
  dividing the face into recessed, glossy, cloisonné-style enamel
  cells.
- Lattice (fixed): one center diamond cell, four triangular cells—
  top, bottom, left, right.
- Enamel colors, assigned by symmetry axis:
  - Center diamond: PRIMARY_HEX
  - Top cell AND bottom cell (must match each other exactly):
    ACCENT_HEX_1
  - Left cell AND right cell (must also match each other exactly):
    ACCENT_HEX_2
- Logo: LOGO, embossed, matching the current image's metal tone,
  lower rim, never larger than ~8% of badge width.

IMAGES 1-4—tier ladder: bronze / silver / gold / platinum, in that
order. Identical geometry, lighting, camera angle, and enamel colors.
Platinum must read visibly brighter and cooler than silver—check
this explicitly before finalizing.

IMAGES 5-8—category facets, hold finish at gold:
  5. lightning-bolt facet (top cell)—streak / speed
  6. shield facet (top cell)—milestone / protection
  7. compass-star facet (top cell)—exploration
  8. laurel-branch facet (top cell)—mastery / completion
Identical silhouette, lattice, lighting, and both accent colors—
only the top-cell facet motif changes.

Render at high resolution, sharp focus, realistic metal specular
highlight and enamel gloss. No watermark.
```

---

## 2. Achievement badge—distance milestone (numeral variant)

```
Generate reference images of the Guild Enamel octagon badge, keeping
the established lattice, logo, and axis-assigned enamel colors, with
one structural change: the center diamond cell is enlarged to ~70% of
the badge's total face width (up from ~45%) to become the primary
numeral display. The surrounding cells shrink proportionally but keep
their assigned axis colors—no facet motif in this variant.

NUMERAL_STYLE = tall, heavily condensed, bold geometric sans-serif
                digits (Bebas Neue or equivalent)—high x-height,
                thick even stroke weight, minimal counter space.

- Numeral: embossed directly onto the diamond's enamel fill in
  NUMERAL_STYLE, raised metal matching the current image's tier—
  never flat-printed, never colored.
- Alignment: horizontally centered on the badge's vertical axis, with
  equal clearance to both sides regardless of digit count. Vertically
  centered on the diamond's horizontal midline (its widest point), not
  its overall bounding box. This is the most commonly failed check for
  this variant—verify per image, especially when comparing short
  strings ("1K") against long ones ("10K", "13.1").

Generate one tier ladder (bronze / silver / gold / platinum) per
distance value: 1K, 1MI, 5K, 10K, 13.1, 26.2. Identical silhouette,
diamond size, and numeral size/position within each set of 4—only
the metal tier changes.

Render at high resolution, sharp focus, realistic metal specular
highlight and enamel gloss. No other text anywhere. No watermark.
```

---

## 3. Streak chip

```
Generate reference images of the Guild Enamel streak chip: a small
circular metal-and-enamel chip, single cell, no internal lattice.
Match the lighting rig, camera framing, and background of the octagon
badges exactly.

- Silhouette: a plain circle with a raised polished BORDER_MM metal
  ring.
- Enamel fill: solid PRIMARY_HEX across the full face—no facets, no
  color-blocking.
- Numeral: embossed in NUMERAL_STYLE (see distance-milestone template)
  onto the enamel fill, raised metal matching the current tier, never
  flat or colored. Centered on both axes, ~55% of the chip's diameter,
  equal clearance on all sides.
- Logo: LOGO, embossed, lower rim.
- No numerals or text beyond the streak value itself—repeat counts
  ("144 times") are rendered by the app UI, never baked into the
  asset.

Generate one tier ladder (bronze / silver / gold / platinum) per
streak value: 3X, 5X, and any duration-band values you add (e.g.
weekly/monthly/quarterly/annual). Tier represents streak-length band,
not overall rank. Platinum must read distinctly brighter and cooler
than silver.

Render at high resolution, sharp focus, realistic metal specular
highlight and enamel gloss.
```

---

## 4. Limited edition

```
Generate a reference image matching the core Guild Enamel material
system: polished raised metal border, recessed glossy cloisonné-style
enamel cells, studio product photography. Figurative details are
embossed raised metal linework on the enamel field—sculpted, never
flat-printed or silhouette-filled. Single commemorative gold finish,
no tier ladder.

Existing designs:

MOONCAKE FESTIVAL
- Silhouette: scalloped round medallion, ~12-lobe mold-pressed edge.
- Enamel field: deep maroon-red, #5C1A12.
- Embossed detail: a rabbit beneath a crescent moon with two cloud
  wisps, raised gold linework on the maroon field.
- Logo: LOGO, small, gold, bottom rim.

SINGAPORE NATIONAL DAY
- Silhouette: plain circle, streak-chip proportions.
- Face split by a metal seam into two enamel bands: upper ~55% red
  (#ED2939), lower ~45% white (#FFFFFF).
- Within the upper red band only: a crescent-moon cell and five star
  cells, each cut into its own facet by thin metal border lines,
  filled with pale cream enamel (#F2EFE8), in the canonical Singapore
  flag layout.
- Logo: LOGO, small, gold, bottom rim.

For any new occasion, design fresh using the checklist in
`SKILL.md` → "New limited editions" before writing the prompt.

Render at high resolution, sharp focus, realistic metal specular
highlight and enamel gloss. No text anywhere. No watermark.
```
