import * as Joi from 'joi';

export const validationSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
	APP_PORT: Joi.string().default('8000'),
	VERSION: Joi.string().default('1.0.0'),
	DATABASE_HOST: Joi.string().default('localhost'),
	DATABASE_PORT: Joi.string().default('3306'),
	DATABASE_USERNAME: Joi.string().required(),
	DATABASE_PASSWORD: Joi.string().required(),
	DATABASE_NAME: Joi.string().required(),
	TWITTER_BEARER_TOKEN: Joi.string().required(),
	JWT_SECRET: Joi.string().required(),
	JWT_EXPIRES_IN: Joi.string().default('1h'),
	PYTHON_API_URL: Joi.string().required(),
});
