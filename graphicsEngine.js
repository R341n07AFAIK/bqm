// Rainbow graphics / hardware-accel friendly job builder (Paper / Tilt / Glide style stub).

function buildGraphicsJob({ world, themes = [], styles = [], seed = "auto" }) {
  return {
    backend: "paper-tilt-glide",
    payload: {
      engine: "rainbow",
      seed,
      world,
      themes,
      styles,
      prompt: [
        "alternate-history transplanetary religious-fascist bureaucracy",
        "propaganda-noir, myth-engine fog vaults, filmic language",
        "editorial layouts, volumetric light, wet asphalt reflections"
      ].join(", ")
    }
  };
}

module.exports = { buildGraphicsJob };
