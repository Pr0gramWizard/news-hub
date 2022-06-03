export default () => ({
	env: process.env.NODE_ENV || 'development',
	port: parseInt(process.env.APP_PORT || '8000', 10),
	version: process.env.APP_VERSION || '1.0.0',
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT || '3306', 10),
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
	},
	twitter: {
		bearerToken: process.env.TWITTER_BEARER_TOKEN,
	},
	python: {
		apiUrl: process.env.PYTHON_API_URL,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
});
