# BH Myth Engine — Generator Bundle Export

This archive is a compact export of the **generation-related code** from your BH / CTSCE stack.

Contained here:

- `generate.js` — main CLI entry for JSON prompt generation.
- `promptGenerators.js` — Midjourney / DALL·E / SD / Flux / Graphics / Grok generator wiring.
- `graphicsEngine.js` — rainbow graphics job builder (Paper / Tilt / Glide style stub).
- `lexicon.js` — minimal motif / buzzword collector used by generators.
- `config/worlds/BH/bh_project_surreal_noir.js` — BH world seed definition.
- `bin/generatePrompt.js` — higher-level CLI for OIP / BH style prompts.
- `scripts/ctsce_all.sh` — all-in-one runner.
- `scripts/ctsce_export_full.sh` — export-and-pack script.
- `scripts/synth_to_batch.js` — helper for turning synth output into batch jobs.
- `atonement_machine.js` — the German‑Soviet guilt‑therapy propaganda generator.
- `BHImagePromptGenerator.java` — Java-side seed generator.
- `print_gpt_inclusion.py` — tiny helper to assert GPT integration readiness.

You can `npm install` and then run:

```bash
node generate.js --list-generators
node generate.js --generator=grok --world=BH --themes=bh_bureaucratic_shrine --styles=surreal-propaganda-noir --num=8 --mode=therapy-film
node bin/generatePrompt.js --world OIP --style propaganda-noir --seed auto --cinema 35mm --flux myth-engine
```

Grok/xAI support is **optional** and only activates when `XAI_API_KEY` is set in the environment.
