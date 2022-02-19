import {LogLevel, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function getLogLevels(): LogLevel[] {
	console.log(process.env.NODE_ENV)
	const env = process.env.NODE_ENV || 'development';
	switch (env) {
		case 'development':
			return ['log', 'error', 'warn', 'debug', 'verbose'];
		case 'production':
			return ['error'];
		case 'test':
			return ['error'];
		default:
			return ['debug', 'error'];
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: getLogLevels(),
	});
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));
	app.enableCors();

	const swaggerConfig = new DocumentBuilder()
		.setTitle('NewsHub API')
		.setDescription('This is the auto-generated documentation for the NewsHub API')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api/docs', app, document, {
		customSiteTitle: 'NewsHub API',
		swaggerOptions: { tagsSorter: 'alpha', operationsSorter: 'alpha' },
	});

	await app.listen(3000);
}

bootstrap();
