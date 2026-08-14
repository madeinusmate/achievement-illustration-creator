import { readFile } from "node:fs/promises";
import {
  experimental_generateImage as generateImage,
  generateText,
} from "ai";
import { gateway } from "@ai-sdk/gateway";

export type GenerateResult = {
  image: Uint8Array;
  mediaType: string;
  imagesAttached: {
    logo: boolean;
    refs: boolean;
  };
  mode: "multimodal" | "image-only";
};

/** Gemini-style multimodal LLMs: logo/refs as image parts; images returned in result.files */
export const usesMultimodalGenerateText = (model: string): boolean => {
  const id = model.toLowerCase();
  return id.includes("gemini") && id.includes("image");
};

const mediaTypeFromPath = (filePath: string): string => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/png";
};

const loadImagePart = async (filePath: string) => {
  const data = await readFile(filePath);
  return {
    type: "image" as const,
    image: data,
    mediaType: mediaTypeFromPath(filePath),
  };
};

export const generateBadgeImage = async (options: {
  model: string;
  prompt: string;
  logoPath: string;
  referencePaths: string[];
}): Promise<GenerateResult> => {
  const { model, prompt, logoPath, referencePaths } = options;

  if (usesMultimodalGenerateText(model)) {
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image"; image: Buffer; mediaType: string }
    > = [{ type: "text", text: prompt }];

    content.push(await loadImagePart(logoPath));
    for (const ref of referencePaths) {
      content.push(await loadImagePart(ref));
    }

    const result = await generateText({
      model,
      messages: [{ role: "user", content }],
    });

    const imageFiles = result.files.filter((f) =>
      f.mediaType?.startsWith("image/"),
    );
    if (imageFiles.length === 0) {
      throw new Error(
        `Model ${model} returned no image files. Try another model or --dry-run to inspect the prompt.`,
      );
    }

    const first = imageFiles[0]!;
    return {
      image: first.uint8Array,
      mediaType: first.mediaType ?? "image/png",
      imagesAttached: { logo: true, refs: referencePaths.length > 0 },
      mode: "multimodal",
    };
  }

  // Text-only / dedicated image models via Gateway image API
  const { image } = await generateImage({
    model: gateway.imageModel(model),
    prompt,
  });

  return {
    image: image.uint8Array,
    mediaType: image.mediaType ?? "image/png",
    imagesAttached: { logo: false, refs: false },
    mode: "image-only",
  };
};

export const assertGatewayAuth = () => {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      "AI_GATEWAY_API_KEY is not set. Copy .env.example to .env and add your Vercel AI Gateway key.",
    );
  }
};
