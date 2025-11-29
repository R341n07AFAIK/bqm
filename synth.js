#!/usr/bin/env node
// =====================================================
// UNIVERSAL SYNTHESIS ENGINE — OIP FANTASY DUET & PSIONIC GENERATOR
// Tiefling • Deep Dragonborn • Gem Dragonborn • Psionic Crystals
// Zero-gravity • Spores • Prismatic caustics • Romance • Cinematic
// =====================================================

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const tieflingArchetypes = [
  "smoke-eyed tiefling warlock in cracked velvet",
  "battle-tired tiefling paladin with scorched halo",
  "tattooed tiefling street-prophet in threadbare coat",
  "masked tiefling assassin with ember-lit horns",
  "tiefling bard in moth-eaten cabaret tuxedo",
  "tiefling witch-knight with brass rosary chains"
];

const dragonbornArchetypes = [
  "deep-violet psionic dragonborn with faintly glowing scales",
  "amethyst gem dragonborn oracle with prismatic frills",
  "obsidian dragonborn knight, psionic runes smouldering",
  "silver-veined crystal dragonborn archivist",
  "emerald psionic dragonborn biomech pilot",
  "prism-scaled dragonborn seer in patched envoy cloak"
];

const duetDynamics = [
  "standing back-to-back mid-spell, sharing the same sigil halo",
  "locked in quiet argument, fingers almost touching",
  "leaning shoulder to shoulder, both aiming psionic focus out of frame",
  "one tying the other's armor straps in exhausted silence",
  "sharing a cigarette under a flickering ward-lamp",
  "embracing like doomed lovers before a final stand",
  "checking each other's wounds in a ruined stairwell",
  "reading from the same forbidden grimoire, heads almost touching"
];

const environments = [
  "rain-slick alleyway beneath a leaning cathedral",
  "collapsing archive full of floating manuscripts",
  "rusted sky-dock with half-functional spell-engines",
  "fungal-overgrown ruin glowing with bioluminescent spores",
  "zero-gravity cargo chapel full of drifting icons",
  "war-torn city square lit only by burning banners",
  "underground psionic ward lined with humming crystal pylons",
  "abandoned subway shrine tagged with occult graffiti"
];

const moods = [
  "tragic but tender",
  "intimate and battle-worn",
  "paranoid yet quietly romantic",
  "defiant and exhausted",
  "melancholic, black-comedy tone",
  "resigned but still protective",
  "cynical but secretly hopeful",
  "slow-burn enemies-to-lovers tension"
];

const lighting = [
  "sodium-orange streetlights cutting through cold blue rain",
  "prismatic godrays refracting through hovering crystals",
  "harsh interrogation spotlight with deep noir shadows",
  "neon magenta ward-glyphs reflecting off wet stone",
  "bioluminescent fungal glow and drifting dust motes",
  "single swinging overhead lamp, violent chiaroscuro",
  "backlit by psionic shockwave frozen in time",
  "film-noir window blinds shadows striping their faces"
];

const camera = [
  "cinematic 35mm frame, shallow depth of field",
  "intimate waist-up portrait, lens breathing",
  "wide establishing shot with them as small silhouettes",
  "tight over-the-shoulder shot, focus on trembling hands",
  "low-angle heroic frame, debris falling in slow motion",
  "soft handheld feel, slight motion blur",
  "ultra-wide lens exaggerating perspective",
  "medium close-up, eyes catching all the light"
];

const qualityTags = [
  "hyper-detailed, painterly, no kitsch",
  "grainy 35mm film, subtle scratches",
  "rich chiaroscuro, painterly shadows",
  "soft chromatic aberration, analog imperfections",
  "magazine editorial composition",
  "propaganda-noir layout sensibility",
  "muted color palette with violent accent highlights",
  "high-end concept art quality"
];

function buildDuetPrompt() {
  const t = pick(tieflingArchetypes);
  const d = pick(dragonbornArchetypes);
  const dyn = pick(duetDynamics);
  const env = pick(environments);
  const mood = pick(moods);
  const light = pick(lighting);
  const cam = pick(camera);
  const quality = pick(qualityTags);

  return [
    `${t} and ${d}, ${dyn},`,
    `in a ${env},`,
    `${mood} mood, ${light},`,
    `${cam}, ${quality}.`
  ].join(" ");
}

function buildSoloPrompt() {
  const who = pick([...tieflingArchetypes, ...dragonbornArchetypes]);
  const env = pick(environments);
  const mood = pick(moods);
  const light = pick(lighting);
  const cam = pick(camera);
  const quality = pick(qualityTags);

  return [
    `${who}, alone in a ${env},`,
    `${mood} energy,`,
    `${light}, ${cam},`,
    `${quality}.`
  ].join(" ");
}

function main() {
  const args = process.argv.slice(2);
  const mode = (args[0] || "duet").toLowerCase();
  const count = Math.max(1, parseInt(args[1] || "10", 10) || 10);

  const isDuet = mode === "duet";

  for (let i = 1; i <= count; i++) {
    const prompt = isDuet ? buildDuetPrompt() : buildSoloPrompt();
    console.log(`${i}. ${prompt}`);
  }
}

if (require.main === module) {
  main();
}
