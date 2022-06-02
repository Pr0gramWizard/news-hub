import {
	Avatar,
	Button,
	Center,
	Container,
	createStyles,
	Divider,
	Grid,
	Group,
	Loader,
	Paper,
	SimpleGrid,
	Text,
	TypographyStylesProvider,
} from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';
import { ArrowLeft, Check, Heart, Messages, Repeat, X } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import { TweetDetailCard } from '../components/TweetDetailCard';
import { TweetAuthorDetailCard } from '../components/TweetAuthorDetailCard';

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

export function TweetDetails() {
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	let { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [tweetHTML, setTweetHTML] = useState<string | undefined>(undefined);
	const [tweet, setTweet] = useState<Tweet | undefined>(undefined);
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
		async function getTweetDetails() {
			if (!user) {
				throw new Error('User is not logged in');
			}
			const tweetDetails = await fetch(`${import.meta.env.VITE_API_URL}/tweet/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${user.token}`,
					ContentType: 'application/json',
				},
			});
			if (tweetDetails.status === 403) {
				setUser(undefined);
				return;
			}
			if (tweetDetails.status !== 200) {
				const response = await tweetDetails.json();
				showNotification({
					title: 'Error',
					message: response.message || 'Something went wrong',
					color: 'red',
					icon: <X />,
					onClick: () => {
						navigate('/tweets');
					},
				});
				return;
			}
			const data: Tweet = await tweetDetails.json();

			highlightLinkInText(data);
			setTweet(data);
			setLoading(false);
		}

		getTweetDetails();
	}, [user]);

	return (
		<Container size="lg">
			{loading || !tweet ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
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
						<TweetDetailCard tweet={tweet} />
						<TweetAuthorDetailCard author={tweet.author} />
					</SimpleGrid>
				</>
			)}
		</Container>
	);
}
