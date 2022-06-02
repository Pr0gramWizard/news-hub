import { Button, Center, Container, Divider, LoadingOverlay, Stack, Text, TextInput, Title } from '@mantine/core';
import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/authProvider';
import { BrandTwitter, Check, X } from 'tabler-icons-react';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { TweetHistory } from '../components/TweetHistory';
import { Tweet } from '../types/tweet';
import { useNavigate } from 'react-router-dom';

function isValidHttpUrl(inputUrl: string) {
	let url;

	try {
		url = new URL(inputUrl);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}

export function ParseTweet() {
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	const [isParsing, setIsParsing] = React.useState(false);
	const [latestTweets, setLatestTweets] = React.useState<Tweet[]>([]);
	if (!user) {
		throw new Error('User is not logged in');
	}

	useEffect(() => {
		async function fetchLatestTweets() {
			if (!user) {
				throw new Error('User is not logged in');
			}
			const response = await fetch(`${import.meta.env.VITE_API_URL}/tweet/user?limit=5&sort=seenAt`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${user.token}`,
					ContentType: 'application/json',
				},
			});
			if (response.status === 403) {
				setUser(undefined);
				return;
			}
			const data = await response.json();
			setLatestTweets(data.tweets);
		}

		fetchLatestTweets();
	}, [isParsing]);

	const form = useForm({
		initialValues: {
			url: '',
		},

		validate: {
			url: (value: string) => (isValidHttpUrl(value) ? undefined : 'Invalid URL'),
		},
	});

	async function handleSubmit(values: typeof form.values) {
		if (!user) {
			throw new Error('User is not logged in');
		}
		setIsParsing(true);
		const { url } = values;

		const response = await fetch(`${import.meta.env.VITE_API_URL}/tweet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${user.token}`,
			},
			body: JSON.stringify({
				url,
			}),
		});
		if (response.status !== 201) {
			const responseBody = await response.json();
			showNotification({
				title: 'Error',
				message: responseBody.message || 'An error occurred',
				color: 'red',
				icon: <X />,
			});
			return;
		}
		showNotification({
			title: 'Success',
			message: 'Tweet parsed successfully',
			color: 'green',
			icon: <Check />,
		});
		setIsParsing(false);
	}

	return (
		<Container size="lg">
			<div>
				<LoadingOverlay visible={isParsing} />
				<Title>Parse a new tweet</Title>
				<Text>Enter a link to a status tweet and we try to parse it</Text>
				<Divider />
				<form
					style={{ marginTop: '5%' }}
					onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
				>
					<div>
						<TextInput
							placeholder="https://twitter.com/Jack/status/20"
							label="Tweet URL"
							size="lg"
							required
							{...form.getInputProps('url')}
						/>
						<Center style={{ paddingTop: 10 }}>
							<Button leftIcon={<BrandTwitter />} size="md" type="submit">
								Parse
							</Button>
						</Center>
					</div>
				</form>
			</div>
			<Stack style={{ marginTop: '5%' }}>
				<Title style={{ marginBottom: 20 }} order={2}>
					Recently parsed tweets
				</Title>
				{latestTweets ? <TweetHistory tweets={latestTweets} /> : <Text>No tweets parsed yet</Text>}
			</Stack>
		</Container>
	);
}
