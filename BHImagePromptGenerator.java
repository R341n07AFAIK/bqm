/**
 * BHImagePromptGenerator
 *
 * Simple Java-side seed for BH surreal-propaganda-noir prompts.
 */
public class BHImagePromptGenerator {

    private static final String IMAGE_SEED_PROMPT =
        "A rain-slick bureaucratic shrine drenched in neon, " +
        "chrome-ink operatives drifting through myth-engine fog, " +
        "35mm propaganda-noir cinematography, exhausted editorial framing.";

    public static String getSeedPrompt() {
        return IMAGE_SEED_PROMPT;
    }

    public static void main(String[] args) {
        System.out.println(IMAGE_SEED_PROMPT);
    }
}
