---
name: guild-enamel
description: Generates a consistent family of metal-and-enamel achievement badge illustrations—achievement badges, distance milestones, streak chips, and limited editions—from short text requests, using locked construction rules, brand color tokens, and reference images. Use when you need consistent, on-brand collectible-badge-style illustrations generated with ChatGPT.
---

# Guild Enamel—Illustration Skill

Generates a consistent family of metal-and-enamel achievement badges from short requests, anchored by locked construction rules and the three attached reference images. If output drifts from house style, re-attach the reference images directly to the message.

## Families

| Family | Shape | Varies |
|---|---|---|
| Achievement badge | Octagon, 5-cell lattice | Category facet (top cell) |
| Distance milestone | Octagon, 5-cell lattice | Embossed numeral (enlarged center) |
| Streak chip | Circle, single cell | Embossed numeral, tier = duration band |
| Limited edition | Custom per occasion | Silhouette + motif, always gold, no tier ladder |

## Locked rules—every image

- Studio product photography: dead-on, centered, soft diffuse lighting from upper left, subtle drop shadow, plain light-gray background. No hands, no packaging.
- Material: raised polished metal border/ring, glossy recessed enamel cells. Figurative elements (icons, numerals, motifs) are embossed raised metal on the enamel, sculpted like a die-stamped coin—never flat-printed, never colored graphics.
- Logo: embossed hallmark, matching current metal tone, lower rim, no larger than ~8% of badge width. Use the arrow monogram shown in the reference images.
- Tier ladder (bronze/silver/gold/platinum) applies to badges and streak chips. Platinum must read visibly brighter and cooler than silver—check this every time, not just once. Limited editions skip the ladder: single gold finish, no ranking.
- Color: center diamond = PRIMARY_HEX. Top+bottom cells (vertical axis, must match each other exactly) = ACCENT_HEX_1. Left+right cells (horizontal axis, must match each other exactly) = ACCENT_HEX_2.

## Brand tokens

```
SHAPE = octagon (badges/milestones only—streak chips are always circle)
BORDER_MM = 4mm
PRIMARY_HEX = #FA4D1F
ACCENT_HEX_1 = #CC4200
ACCENT_HEX_2 = #FFFFFF
```

If your brand has only one accent color, drop ACCENT_HEX_2 and use cream #F2EFE8 for the left/right cells instead.

## Router

| Request... | Family | Extract |
|---|---|---|
| number + "x" ("5X", "7x streak") | Streak chip | multiplier |
| distance ("10K", "half marathon") | Distance milestone | normalize: 1K/1MI/5K/10K/13.1/26.2 |
| Mid-Autumn/mooncake, Singapore National Day | Limited edition, existing |—|
| other occasion, place, or theme | Limited edition, new—see below |—|
| anything else—activity, skill, achievement type | Achievement badge | new category facet |
| tier stated | applies to family above | tier |
| tier unstated | applies to family above | default gold |

## Assembling the prompt

```
Generate a reference image of the Guild Enamel [FAMILY], matching the
attached reference image(s) exactly for silhouette, lattice, material,
lighting, and camera angle. Use these enamel colors exactly, even where
they differ from the attached reference image(s): center diamond =
PRIMARY_HEX, top+bottom cells = ACCENT_HEX_1, left+right cells =
ACCENT_HEX_2. The only other change from the reference is: [WHAT VARIES].

[If a numeral: horizontally center on the badge's vertical axis, with
equal clearance to both sides regardless of digit count.]

[If a new motif: one simple iconic silhouette, embossed raised metal,
same weight as the existing category icons—no detail that wouldn't
survive shrinking to a 32px app icon.]

High resolution, sharp focus, realistic metal specular highlight and
enamel gloss. No other text anywhere. No watermark.
```

## New limited editions

1. Pick a silhouette that means something for the occasion—not a generic circle or octagon.
2. Use 2–3 flat enamel colors unambiguously "of" the occasion—brand color rules don't apply here.
3. Add one or two embossed motifs that reference the occasion without needing text.
4. Keep material and photography locked—that's what keeps it recognizably in-family.

## Check before finalizing

- Silver and platinum collapsing into the same tone.
- Numerals off-center within a triangular cell—anchor to the cell's central axis, not a bounding-box center.
- Cell pairs that should match exactly (top+bottom, left+right) rendering as slightly different colors.
- New motifs too detailed to read at small size.
