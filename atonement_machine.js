#!/usr/bin/env node
/**
 * Atonement Machine — German–Soviet guilt-therapy propaganda engine.
 * Usage:
 *   node atonement_machine.js 20
 */

const templates = [
  "young bureaucrat haunted by inherited archives, kneeling in front of propaganda poster of themselves, in a hyper-clean confession booth with CRT screens, lit by harsh Constructivist spotlight and floating dust, low-angle shot exaggerating ideological burden, bleached photomontage with Soviet overlays",
  "state archivist with red-and-gold glasses, pressing 'atonement' button beside archive machine, in a clinical dome filled with typewriters and fog, rotating propaganda projector with subliminal flicker, static symmetrical frame with imposed guilt objects, VHS-style grain over pastel trauma motifs",
  "middle-aged therapist holding outdated history book, rehearsing guilt ritual under spotlights, in a virtual tribunal lobby filled with flickering neon indictments, slow zoom-in like a 1970s European art film, desaturated with pockets of brutalist red"
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function main() {
  const count = parseInt(process.argv[2] || "10", 10);
  for (let i = 0; i < count; i++) {
    console.log(`${i + 1}. ${rand(templates)}`);
  }
}

if (require.main === module) {
  main();
}
