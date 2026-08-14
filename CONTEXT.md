# Guild Enamel

Local generation of a consistent family of metal-and-enamel achievement badge illustrations from short text requests, using locked construction rules, brand color tokens, and style references.

## Language

**Illustration Skill**:
A folder of locked visual rules, prompt templates, and style references that define one on-brand illustration system.
_Avoid_: prompt pack, ChatGPT project (that is a delivery path, not the skill itself)

**Family**:
One of the four Guild Enamel badge kinds: achievement badge, distance milestone, streak chip, or limited edition.
_Avoid_: type, format, variant (prefer **Family** for the router outcome)

**Brand tokens**:
The configurable enamel colors and construction measures (primary/accent hexes, shape, border) applied when assembling a prompt.
_Avoid_: theme, palette dump, CSS variables

**Router**:
The deterministic mapping from a short request to a **Family**, tier, center subject (**Motif** or numeral), and extracted fields.
_Avoid_: classifier, LLM router (v1 is code-only)

**Hallmark**:
The embossed logo mark on the lower rim of a badge, matching the metal tone and capped at roughly 8% of badge width.
_Avoid_: watermark, stamp, logo overlay

**Tier ladder**:
The ordered metal finishes bronze → silver → gold → platinum used for achievement badges and streak chips. Limited editions skip the ladder and stay commemorative gold.
_Avoid_: rarity, rank, level

**Motif**:
The concrete visual subject of an achievement badge (an icon or numeral in the center diamond), not the English title.
_Avoid_: category facet, title, caption

**Style reference**:
An example image used to anchor silhouette, lattice, material, lighting, and camera angle for generation. Contact sheets are opt-in because they leak unrelated numerals and grids.
_Avoid_: sample, mock, moodboard (unless it is actually that)

**Compare run**:
One request executed against multiple image models so outputs can be judged side by side.
_Avoid_: A/B test (unless you mean product experimentation), batch (a batch may not be the same request)

**Sidecar**:
The JSON artifact written beside a generated image (or alone on dry-run) recording route result, model, prompt, and whether logo/refs were attached.
_Avoid_: metadata file, log, manifest (prefer **Sidecar** for this companion file)

## Example dialogue

> **Dev:** The user typed `10x streak bronze`—what did the **Router** produce?
>
> **Expert:** **Family** streak chip, multiplier `10X`, **Tier ladder** finish bronze—not an achievement badge.
>
> **Dev:** And for `Mooncake Festival` with `--compare` across two models?
>
> **Expert:** Same **Family** (limited edition) and assembled prompt intent; a **Compare run** writes one image plus **Sidecar** per model. Multimodal models get the logo **Hallmark** file and **Style reference** images attached; image-only models get text rules only, which the **Sidecar** records.
