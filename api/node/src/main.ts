import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NewsHubLogger } from '@common/logger.service';

async function bootstrap() {
	const logger = new NewsHubLogger();
	const app = await NestFactory.create(AppModule, {
		logger,
	});
	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);
	app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));
	app.enableCors();

	const config = app.get(ConfigService);
	const port = config.get('port');
	const environment = config.get('env');
	const version = config.get('version');

	const swaggerConfig = new DocumentBuilder()
		.setTitle('NewsHub API')
		.setDescription('This is the auto-generated documentation for the NewsHub API')
		.setVersion(version)
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('docs', app, document, {
		customSiteTitle: 'NewsHub API',
		swaggerOptions: { tagsSorter: 'alpha', operationsSorter: 'alpha' },
	});

	await app.listen(port);

	logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
	logger.log(`Environment: ${environment}`);
}

bootstrap();
