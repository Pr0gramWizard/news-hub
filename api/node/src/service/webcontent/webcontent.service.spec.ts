import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { ICreateWebContent } from '../../types/dto/webcontent';
import { Tweet } from '../tweet/tweet.entity';
import { NewsHubLogger } from './../../common/logger.service';
import { WebContent } from './webcontent.entity';
import { WebContentService } from './webcontent.service';

describe('WebContentService', () => {
	let service: WebContentService;
	const webContent = new WebContent({
		url: 'https://www.example.com',
		content: 'Hello world',
		tweet: {} as Tweet,
		media: ['image_url'],
	});

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				WebContentService,
				{
					provide: getRepositoryToken(WebContent),
					useValue: {
						save: jest.fn().mockResolvedValue(webContent),
					},
				},
				{
					provide: NewsHubLogger,
					useValue: {
						setContext: jest.fn(),
					},
				},
			],
		}).compile();

		service = moduleRef.get(WebContentService);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create new web content entity', async () => {
			const param: ICreateWebContent = webContent;
			const result = await service.create(param);
			expect(result).toEqual(webContent);
		});
	});

	describe('createMany', () => {
		it('should create multiple new web content entities', async () => {
			const tweet = {} as Tweet;
			const listOfTwitterApiURLs: TweetEntityUrlV2[] = [
				{
					start: 1,
					end: 2,
					url: 'https://twitter.com/example/status/1',
					expanded_url: 'https://twitter.com/example/status/1',
					display_url: 'https://twitter.com/example/status/1',
					unwound_url: 'https://twitter.com/example/status/1',
					images: [
						{
							url: 'https://www.example.com/image.jpg',
							height: 50,
							width: 50,
						},
					],
				},
				{
					start: 2,
					end: 4,
					url: 'https://twitter.com/example/status/2',
					expanded_url: 'https://twitter.com/example/status/2',
					display_url: 'https://twitter.com/example/status/2',
				} as TweetEntityUrlV2,
			];
			const result = await service.createMany(listOfTwitterApiURLs, tweet);
			expect(result).toEqual([webContent, webContent]);
		});
	});
});
