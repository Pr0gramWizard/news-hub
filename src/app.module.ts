import { CommonModule } from '@common/common.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetModule } from '@tweet/tweet.module';
import { UserModule } from '@user/user.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './service/auth/auth.module';
import { WebContentModule } from './service/webcontent/webcontent.module';
import { OldTweetModule } from '@tweet/old_tweets/old.tweet.module';
import {StatsModule} from "./service/stats/stats.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: 'mariadb',
				host: configService.get('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PW'),
				database: configService.get('DB_NAME'),
				autoLoadEntities: true,
				cache: true,
				charset: 'utf8mb4',
				namingStrategy: new SnakeNamingStrategy(),
				// synchronize: configService.get('NODE_ENV') !== 'production',
				synchronize: false,
			}),
		}),
		CommonModule,
		TweetModule,
		UserModule,
		AuthModule,
		WebContentModule,
		OldTweetModule,
		StatsModule,
	],
})
export class AppModule {}
