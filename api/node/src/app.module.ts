import { CommonModule } from '@common/common.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OldTweetModule } from '@tweet/old_tweets/old.tweet.module';
import { TweetModule } from '@tweet/tweet.module';
import { UserModule } from '@user/user.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { RequestLoggerMiddleware } from './middleware/request.logger';
import { ArticleModule } from './service/article/article.module';
import { AuthModule } from './service/auth/auth.module';
import { NewsSourceModule } from './service/news-source/news.source.module';
import { StatsModule } from './service/stats/stats.module';
import { WebContentModule } from './service/webcontent/webcontent.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
			load: [configuration],
			validationSchema,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: 'mariadb',
				host: configService.get('database.host'),
				port: configService.get<number>('database.port'),
				username: configService.get('database.username'),
				password: configService.get('database.password'),
				database: configService.get('database.database'),
				autoLoadEntities: true,
				cache: true,
				charset: 'utf8mb4',
				namingStrategy: new SnakeNamingStrategy(),
				synchronize: configService.get('env') !== 'production',
			}),
		}),
		CommonModule,
		TweetModule,
		UserModule,
		AuthModule,
		WebContentModule,
		OldTweetModule,
		StatsModule,
		NewsSourceModule,
		ArticleModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestLoggerMiddleware).forRoutes('*');
	}
}
