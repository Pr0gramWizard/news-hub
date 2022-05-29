import { Center, Container, Grid, Loader, ScrollArea, SimpleGrid } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/authProvider';
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
			{loading || !tweet ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<div>
					<h1>Tweet Details</h1>
					<Container my="md">
						<SimpleGrid cols={2} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
							asjk
							<Grid gutter="md">
								<Grid.Col>Test</Grid.Col>
								<Grid.Col span={6}>Bla1</Grid.Col>
								<Grid.Col span={6}>Bla2</Grid.Col>
							</Grid>
						</SimpleGrid>
					</Container>
				</div>
			)}
		</ScrollArea>
	);
}
