// ===========================================================
// PROMPT GENERATORS — CTSCE-style bundle + Grok/xAI stub
// ===========================================================

const OpenAI = require("openai");
const { collectMotifs } = require("./lexicon");
const { buildGraphicsJob } = require("./graphicsEngine");

// -------------------------
// xAI / Grok client (optional)
// -------------------------
let grokClient = null;
if (process.env.XAI_API_KEY) {
  grokClient = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1"
  });
} else {
  console.warn("XAI_API_KEY missing — Grok-based generation will be skipped.");
}

const GENERATORS = [
  "midjourney",
  "dall_e",
  "stable_diffusion",
  "flux",
  "graphics",
  "grok"
];

function listGenerators() {
  return GENERATORS.slice();
}

function buildBasePrompt({ world, themes = [], styles = [], mode }) {
  const motifs = collectMotifs(themes, styles);
  const body = motifs.join(", ");

  return [
    `World: ${world || "BH"}`,
    mode ? `Mode: ${mode}` : null,
    "",
    body
  ]
    .filter(Boolean)
    .join("\n");
}

// ------------- simple synthetic generators -------------

function generateMidjourney({ world, themes, styles, mode }) {
  return {
    generator: "midjourney",
    world,
    themes,
    styles,
    mode,
    prompt: buildBasePrompt({ world, themes, styles, mode }) +
      "\nStyle: high-contrast surreal-propaganda-noir, 3:4, cinematic, editorial."
  };
}

function generateDalle({ world, themes, styles, mode }) {
  return {
    generator: "dall_e",
    world,
    themes,
    styles,
    mode,
    prompt: buildBasePrompt({ world, themes, styles, mode }) +
      "\nStyle: painterly yet photoreal, soft neon inks, 8K concept art."
  };
}

function generateStableDiffusion({ world, themes, styles, mode }) {
  return {
    generator: "stable_diffusion",
    world,
    themes,
    styles,
    mode,
    prompt: buildBasePrompt({ world, themes, styles, mode }) +
      "\nStyle: gritty film grain, harsh rim light, fogged lenses."
  };
}

function generateFlux({ world, themes, styles, mode }) {
  return {
    generator: "flux",
    world,
    themes,
    styles,
    mode,
    prompt: buildBasePrompt({ world, themes, styles, mode }) +
      "\nStyle: myth-engine motion blur, time-fracture trails, editorial pacing."
  };
}

function generateGraphics({ world, themes, styles, mode }) {
  return {
    generator: "graphics",
    world,
    themes,
    styles,
    mode,
    job: buildGraphicsJob({ world, themes, styles })
  };
}

// ------------- Grok / xAI generator (prompt-only) -------------

async function generateGrok({ world, themes, styles, mode, num = 8 }) {
  const base = buildBasePrompt({ world, themes, styles, mode });

  if (!grokClient) {
    // Fallback: just echo synth prompts without hitting any API.
    return {
      generator: "grok",
      world,
      themes,
      styles,
      mode,
      prompts: Array.from({ length: num }).map((_, i) => {
        return `${base}\n[Fallback Grok seed #${i + 1}] therapy-film style exploration of bureaucracy, guilt, and propaganda.`;
      })
    };
  }

  const systemPrompt = [
    "You are Grok, a vivid image-prompt engine.",
    "Output single-paragraph, dense, cinematic prompts suitable for Midjourney / Flux.",
    "The film is a therapy-movie about society, bureaucracy, and guilt."
  ].join(" ");

  const userPrompt = `${base}\nGenerate ${num} distinct prompts in a JSON array of strings.`;

  const completion = await grokClient.chat.completions.create({
    model: "grok-2-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 800
  });

  const text = completion.choices[0].message.content || "[]";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = [text];
  }

  return {
    generator: "grok",
    world,
    themes,
    styles,
    mode,
    prompts: parsed
  };
}

async function generateRecord(opts) {
  const { generator } = opts;
  switch (generator) {
    case "midjourney":
      return generateMidjourney(opts);
    case "dall_e":
      return generateDalle(opts);
    case "stable_diffusion":
      return generateStableDiffusion(opts);
    case "flux":
      return generateFlux(opts);
    case "graphics":
      return generateGraphics(opts);
    case "grok":
      return generateGrok(opts);
    default:
      throw new Error(`Unknown generator: ${generator}`);
  }
}

module.exports = {
  listGenerators,
  generateRecord
};
