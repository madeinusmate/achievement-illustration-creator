export type BadgeFamily =
  | "achievement"
  | "distance"
  | "streak"
  | "limited";

export type MetalTier = "bronze" | "silver" | "gold" | "platinum";

export type CenterSubject = "numeral" | "motif";

export type RouteExtracts = {
  multiplier?: string;
  distance?: string;
  category?: string;
  occasion?: string;
  limitedKind?: "existing" | "new";
  motif?: string;
  numeral?: string;
};

export type RouteResult = {
  family: BadgeFamily;
  tier: MetalTier;
  center: CenterSubject;
  /** Human-readable subject for the assembly template */
  whatVaries: string;
  extracts: RouteExtracts;
  request: string;
};

export type RouteOverrides = {
  family?: BadgeFamily;
  motif?: string;
  numeral?: string;
  tier?: MetalTier;
};

const TIERS: MetalTier[] = ["bronze", "silver", "gold", "platinum"];

const DISTANCE_PATTERNS: Array<{ re: RegExp; value: string }> = [
  { re: /\bhalf[\s-]?marathon\b/i, value: "13.1" },
  { re: /\bfull[\s-]?marathon\b|\bmarathon\b/i, value: "26.2" },
  { re: /\b26\.2\b/, value: "26.2" },
  { re: /\b13\.1\b/, value: "13.1" },
  { re: /\b10\s?k\b/i, value: "10K" },
  { re: /\b5\s?k\b/i, value: "5K" },
  { re: /\b1\s?mi\b|\b1\s?mile\b/i, value: "1MI" },
  { re: /\b1\s?k\b/i, value: "1K" },
  { re: /\b50\s?k\b/i, value: "50K" },
  { re: /\b100\s?k\b/i, value: "100K" },
  { re: /\b(\d+(?:\.\d+)?)\s?k\b/i, value: "$1K" },
];

const EXISTING_LIMITED: Array<{ re: RegExp; occasion: string }> = [
  {
    re: /\bmid[\s-]?autumn\b|\bmooncake\b/i,
    occasion: "Mooncake Festival",
  },
  {
    re: /\bsingapore\s+national\s+day\b|\bndp\b/i,
    occasion: "Singapore National Day",
  },
];

const LIMITED_HINT =
  /\b(festival|holiday|edition|commemorat|anniversary|national day|celebration|seasonal)\b/i;

export const parseFamilyOverride = (value: string): BadgeFamily => {
  const key = value.trim().toLowerCase();
  const map: Record<string, BadgeFamily> = {
    achievement: "achievement",
    badge: "achievement",
    distance: "distance",
    milestone: "distance",
    streak: "streak",
    chip: "streak",
    limited: "limited",
    edition: "limited",
  };
  const family = map[key];
  if (!family) {
    throw new Error(
      `--family must be one of achievement|distance|streak|limited (got ${value})`,
    );
  }
  return family;
};

const extractTier = (request: string): { tier: MetalTier; cleaned: string } => {
  let cleaned = request;
  let tier: MetalTier = "gold";
  for (const t of TIERS) {
    const re = new RegExp(`\\b${t}\\b`, "i");
    if (re.test(cleaned)) {
      tier = t;
      cleaned = cleaned.replace(re, " ").replace(/\s+/g, " ").trim();
      break;
    }
  }
  return { tier, cleaned };
};

const extractStreak = (request: string): string | undefined => {
  const match = request.match(/\b(\d+)\s*[xX]\b/);
  if (!match) return undefined;
  return `${match[1]}X`;
};

const extractDistance = (request: string): string | undefined => {
  for (const { re, value } of DISTANCE_PATTERNS) {
    const match = request.match(re);
    if (!match) continue;
    if (value.includes("$1") && match[1]) {
      return `${match[1]}K`.toUpperCase().replace(/KK$/, "K");
    }
    return value;
  }
  return undefined;
};

/** Thresholds that belong in the center diamond: days, counts, money, levels. */
export const extractThresholdNumeral = (request: string): string | undefined => {
  const days = request.match(/\b(\d+)\s*days?\b/i);
  if (days) return days[1];

  const level = request.match(/\blevel\s+(\d+)\b/i);
  if (level) return level[1];

  const money = request.match(
    /\b(?:save|saved|savings)\s+(\d{1,3}(?:,\d{3})*|\d+)\b/i,
  );
  if (money) return money[1].replace(/,/g, "");

  const count = request.match(
    /\b(\d{1,3}(?:,\d{3})*|\d+)\s+(?:puffs?|entries|missions?|milestones?|triggers?|moods?|places?|locations?)\b/i,
  );
  if (count) return count[1].replace(/,/g, "");

  const leading = request.match(/\b(\d{1,4})\b/);
  if (leading && Number(leading[1]) >= 2) return leading[1];

  return undefined;
};

const familyLabel = (family: BadgeFamily): string => {
  switch (family) {
    case "achievement":
      return "achievement badge";
    case "distance":
      return "distance milestone";
    case "streak":
      return "streak chip";
    case "limited":
      return "limited edition";
  }
};

const normalizeOverrides = (
  second?: BadgeFamily | RouteOverrides,
): RouteOverrides => {
  if (!second) return {};
  if (typeof second === "string") return { family: second };
  return second;
};

const describeAchievementSubject = (
  extracts: RouteExtracts,
  tier: MetalTier,
): { center: CenterSubject; whatVaries: string } => {
  const motif =
    extracts.motif ??
    extracts.category ??
    "a simple iconic silhouette of the achievement";
  if (extracts.numeral) {
    return {
      center: "numeral",
      whatVaries: `the center diamond is the primary subject and shows the embossed numeral ${extracts.numeral} (not 1K, not any other number). Optional supporting motif in the top cell only: ${motif}. Metal finish ${tier}. Do not render the achievement title as words.`,
    };
  }
  return {
    center: "motif",
    whatVaries: `the center diamond is the primary subject and shows one embossed motif: ${motif}. Top, bottom, left, and right cells have no extra icons. Metal finish ${tier}. Do not render the achievement title as words.`,
  };
};

export const routeRequest = (
  request: string,
  overrides?: BadgeFamily | RouteOverrides,
): RouteResult => {
  const opts = normalizeOverrides(overrides);
  const trimmed = request.trim();
  if (!trimmed) {
    throw new Error("Request text is required");
  }

  const { tier: statedTier, cleaned } = extractTier(trimmed);
  const multiplier = extractStreak(cleaned);
  const distance = extractDistance(cleaned);
  const threshold = extractThresholdNumeral(cleaned);

  let family: BadgeFamily;
  const extracts: RouteExtracts = {};

  if (opts.family) {
    family = opts.family;
  } else if (multiplier) {
    family = "streak";
  } else if (distance) {
    family = "distance";
  } else {
    const existing = EXISTING_LIMITED.find(({ re }) => re.test(cleaned));
    if (existing) {
      family = "limited";
      extracts.occasion = existing.occasion;
      extracts.limitedKind = "existing";
    } else if (LIMITED_HINT.test(cleaned)) {
      family = "limited";
      extracts.occasion = cleaned;
      extracts.limitedKind = "new";
    } else {
      family = "achievement";
      extracts.category = cleaned;
    }
  }

  const tier: MetalTier =
    opts.tier ?? (family === "limited" ? "gold" : statedTier);

  if (family === "streak") {
    extracts.multiplier = multiplier ?? cleaned.toUpperCase();
  } else if (family === "distance") {
    extracts.distance = distance ?? cleaned.toUpperCase();
  } else if (family === "achievement") {
    extracts.category = extracts.category ?? cleaned;
    if (threshold) extracts.numeral = threshold;
  } else if (family === "limited" && !extracts.occasion) {
    const existing = EXISTING_LIMITED.find(({ re }) => re.test(cleaned));
    if (existing) {
      extracts.occasion = existing.occasion;
      extracts.limitedKind = "existing";
    } else {
      extracts.occasion = cleaned;
      extracts.limitedKind = "new";
    }
  }

  if (opts.motif) extracts.motif = opts.motif;
  if (opts.numeral) extracts.numeral = opts.numeral;

  let center: CenterSubject = "motif";
  let whatVaries: string;
  switch (family) {
    case "streak":
      center = "numeral";
      whatVaries = `a single circular streak chip whose entire face shows embossed multiplier ${extracts.multiplier}, metal finish ${tier}`;
      break;
    case "distance":
      center = "numeral";
      whatVaries = `a single distance milestone whose enlarged center diamond shows embossed numeral ${extracts.distance} and no other number, metal finish ${tier}`;
      break;
    case "limited":
      whatVaries =
        extracts.limitedKind === "existing"
          ? `a single existing limited edition for ${extracts.occasion}, commemorative gold finish only`
          : `a single new limited edition for "${extracts.occasion}": custom silhouette meaningful to the occasion, 2–3 occasion enamel colors (brand color rules do not apply), one or two embossed motifs, commemorative gold finish only`;
      break;
    case "achievement": {
      const subject = describeAchievementSubject(extracts, tier);
      center = subject.center;
      whatVaries = subject.whatVaries;
      break;
    }
  }

  return {
    family,
    tier,
    center,
    whatVaries,
    extracts,
    request: trimmed,
  };
};

export const familyDisplayName = familyLabel;
