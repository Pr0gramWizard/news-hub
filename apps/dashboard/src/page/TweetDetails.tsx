import {
	Avatar,
	Center,
	createStyles,
	Divider,
	Grid,
	Group,
	Loader,
	Paper,
	ScrollArea,
	SimpleGrid,
	Text,
	TypographyStylesProvider,
} from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';
import { Check, Heart, Messages, Repeat, X } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';

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
}));

export function TweetDetails() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	let { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [tweet, setTweet] = useState<Tweet | null>(null);
	const { classes } = useStyles();
	if (!user) {
		throw new Error('User is not logged in');
	}

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
			const data = await tweetDetails.json();
			console.log(data);
			setTweet(data);
			setLoading(false);
		}

		getTweetDetails();
	}, [user]);

	return (
		<ScrollArea>
			{loading || !tweet ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<div>
					<h1>Tweet Details</h1>
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
										<p>{tweet.text}</p>
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
			)}
		</ScrollArea>
	);
}
