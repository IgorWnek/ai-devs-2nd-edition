import { AiDevsConfigSchema } from "./ai-devs-config-schema.js";

export class AiDevsConfig {
    public apiKey: string;

    public constructor() {
        const { error, value: envVars } = AiDevsConfigSchema.validate(process.env, {
            allowUnknown: true,
            stripUnknown: true,
        })

        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }

        this.apiKey = envVars.TASKS_API_KEY;
    }
}

const aiDevsConfig = new AiDevsConfig();

export default aiDevsConfig;
