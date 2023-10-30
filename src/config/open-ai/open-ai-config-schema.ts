import Joi from "joi";

export const OpenAiConfigSchema = Joi.object({
    OPENAI_API_KEY: Joi.string().required(),
});
