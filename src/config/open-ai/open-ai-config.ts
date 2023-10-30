import { OpenAiConfigSchema } from "./open-ai-config-schema.js";

export class OpenAiConfig {
    public apiKey;

    public constructor() {
        const { error, value: envVars } = OpenAiConfigSchema.validate(process.env, {
            allowUnknown: true,
            stripUnknown: true,
        });

        if (error) {
            throw new Error(`OpenAi config validation error: ${error.message}`);
        }

        this.apiKey = envVars.OPENAI_API_KEY;
    }
}

const openAiConfig = new OpenAiConfig();

export default openAiConfig;
