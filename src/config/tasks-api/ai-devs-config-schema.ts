import Joi from 'joi';

export const AiDevsConfigSchema = Joi.object({
  TASKS_API_KEY: Joi.string().required(),
});