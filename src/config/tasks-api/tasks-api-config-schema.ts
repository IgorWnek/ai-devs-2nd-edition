import Joi from 'joi';

export const TasksApiConfigSchema = Joi.object({
  TASKS_API_KEY: Joi.string().required(),
});