import { TasksApiConfig } from "./tasks-api-config.js";
import { TasksApiConfigSchema } from "./tasks-api-config-schema.js";

export class AiDevsTasksApiConfig implements TasksApiConfig {
    public apiKey: string;

    public constructor() {
        const { error, value: envVars } = TasksApiConfigSchema.validate(process.env, {
            allowUnknown: true,
            stripUnknown: true,
        })

        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }

        this.apiKey = envVars.TASKS_API_KEY;
    }
}

const aiDevsTasksApiConfig = new AiDevsTasksApiConfig();

export default aiDevsTasksApiConfig;
