import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
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
