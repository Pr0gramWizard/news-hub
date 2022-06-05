import { Center, Container, Loader } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';
import { X } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import { TweetDetails } from '../components/TweetDetails';

export function UserTweetDetailsPage({ readonly = false }: { readonly?: boolean }) {
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	let { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [tweet, setTweet] = useState<Tweet | undefined>(undefined);
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
				<TweetDetails tweet={tweet} readonly={readonly} />
			)}
		</Container>
	);
}
