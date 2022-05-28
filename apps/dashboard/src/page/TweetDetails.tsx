import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/authProvider';
import { Avatar, Card, Center, Grid, Loader, ScrollArea } from '@mantine/core';
import { Tweet } from '../types/tweet';

export function TweetDetails() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	let { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [tweet, setTweet] = useState<Tweet | null>(null);
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
			const data = await tweetDetails.json();
			console.log(data);
			setTweet(data);
			setLoading(false);
		}

		getTweetDetails();
	}, [user]);

	return (
		<ScrollArea>
			{loading ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<div>
					<h1>Tweet Details</h1>
					<p>{id}</p>
					<Card withBorder radius="md" p="md">
						<Card.Section>
							<Grid>
								<Grid.Col span={1}>
									<Avatar size="md" src={tweet?.author.avatar} />
								</Grid.Col>
								<Grid.Col span={10}>2</Grid.Col>
								<Grid.Col span={1}>3</Grid.Col>
							</Grid>
						</Card.Section>
					</Card>
				</div>
			)}
		</ScrollArea>
	);
}
