// Simple buzzword / motif collector used by generators.

const INTEGRATED_EXAMPLES = [
  "alternate-history Vatican corridors",
  "surveillance shrines and Schismware terminals",
  "rain-slick bureaucratic plazas under neon catechisms",
  "myth-engine cathedral scaffolding in toxic fog",
  "propaganda-noir fashion editorial framing",
  "35mm film language with volumetric godrays",
  "neurophage relics hidden in archive stacks"
];

function collectMotifs(themes = [], styles = []) {
  const base = [...INTEGRATED_EXAMPLES];

  if (themes && themes.length) {
    base.push(
      ...themes.map(
        (t) => `${t.replace(/_/g, " ")} rendered as an exhausted editorial set-piece`
      )
    );
  }

  if (styles && styles.length) {
    base.push(
      ...styles.map(
        (s) => `${s.replace(/_/g, " ")} color language layered over rain-slick asphalt`
      )
    );
  }

  return base;
}

module.exports = {
  INTEGRATED_EXAMPLES,
  collectMotifs
};
