import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';
import { ArrowLeft, Check, Heart, Messages, Repeat } from 'tabler-icons-react';
import {
	Avatar,
	Button,
	Center,
	Container,
	createStyles,
	Divider,
	Grid,
	Group,
	Paper,
	SimpleGrid,
	Text,
	TypographyStylesProvider,
} from '@mantine/core';
import { TweetDetailCard } from './TweetDetailCard';
import { TweetAuthorDetailCard } from './TweetAuthorDetailCard';

interface TweetDetailsProps {
	tweet: Tweet;
	readonly: boolean;
}

const useStyles = createStyles((theme) => ({
	comment: {
		padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
	},

	body: {
		paddingLeft: 54,
		paddingTop: theme.spacing.sm,
		fontSize: theme.fontSizes.sm,
	},

	content: {
		paddingTop: theme.spacing.lg,
		'& > p:last-child': {
			marginBottom: 0,
		},
	},
	icon: {
		marginRight: 5,
		color: 'black',
	},
	grid: {
		marginTop: '5%',
	},
	divider: {
		marginTop: '2%',
		marginBottom: '2%',
	},
	table: {
		textAlign: 'center',
	},
	backArrow: {
		textAlign: 'end',
	},
}));

export function TweetDetails({ tweet, readonly }: TweetDetailsProps) {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const [tweetHTML, setTweetHTML] = useState<string | undefined>();
	const { classes } = useStyles();
	if (!user) {
		throw new Error('User is not logged in');
	}

	const highlightLinkInText = (tweet: Tweet) => {
		if (!tweet.entities) {
			return;
		}
		const urls = tweet.entities.urls;
		if (!urls) {
			return;
		}
		const text = tweet.text;
		const tweetHTML = urls.reduce((acc, url) => {
			const start = text.indexOf(url.url);
			const end = start + url.url.length;
			const before = text.substring(0, start);
			const after = text.substring(end);
			return `${acc}${before}<a href='${url.url}' target='_blank'>${url.url}</a>${after}`;
		}, '');
		setTweetHTML(tweetHTML);
	};

	useEffect(() => {
		highlightLinkInText(tweet);
	}, [tweet]);

	return (
		<Container size="lg">
			<>
				<div>
					<Group position="center" grow>
						<h1>Tweet Details</h1>
						<div className={classes.backArrow}>
							<Button
								leftIcon={<ArrowLeft />}
								onClick={() => {
									navigate(-1);
								}}
							>
								Back
							</Button>
						</div>
					</Group>
					<Paper withBorder radius="md" className={classes.comment}>
						<Grid>
							<Grid.Col span={1}>
								<Center style={{ height: '100%' }}>
									<Avatar src={tweet.author.avatar} alt={tweet.author.username} radius="xl" />
								</Center>
							</Grid.Col>
							<Grid.Col span={11}>
								<div>
									<Group spacing="xs">
										<Text size="md" weight={700}>
											{tweet.author.username}
										</Text>
										{tweet.author.isVerified && (
											<Check color={'#1DA1F2'} className={classes.icon} size={18} />
										)}
									</Group>

									<Text size="xs" color="dimmed">
										{new Date(tweet.createdAt).toLocaleString('de-DE')}
									</Text>
								</div>
								<TypographyStylesProvider>
									<div className={classes.content}>
										{tweetHTML ? (
											<div dangerouslySetInnerHTML={{ __html: tweetHTML }} />
										) : (
											<p>{tweet.text}</p>
										)}
									</div>
								</TypographyStylesProvider>
								<Divider my="sm" />
								<SimpleGrid cols={3}>
									<Center>
										<Heart size={20} className={classes.icon} />
										<Text size="sm">{tweet.likes}</Text>
									</Center>
									<Center>
										<Messages size={20} className={classes.icon} />
										<Text size="sm">{tweet.totalComments}</Text>
									</Center>
									<Center>
										<Repeat size={20} className={classes.icon} />
										<Text size="sm">{tweet.retweets}</Text>
									</Center>
								</SimpleGrid>
							</Grid.Col>
						</Grid>
					</Paper>
				</div>
				<SimpleGrid cols={2} className={classes.grid}>
					<TweetDetailCard tweet={tweet} readonly={readonly} />
					<TweetAuthorDetailCard author={tweet.author} />
				</SimpleGrid>
			</>
		</Container>
	);
}
