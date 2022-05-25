import { Badge, Center, createStyles, Loader, Menu, ScrollArea, Table, Text, Tooltip } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate } from 'react-router-dom';
import { BrandTwitter, Search } from 'tabler-icons-react';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';

const useStyles = createStyles((theme) => ({
	header: {
		position: 'sticky',
		top: 0,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
		transition: 'box-shadow 150ms ease',
		'&::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]}`,
		},
	},
	scrolled: {
		boxShadow: theme.shadows.sm,
	},
}));

export function TweetTable() {
	const { classes, cx } = useStyles();
	const [scrolled, setScrolled] = useState(false);
	const { user } = useContext(AuthContext);
	const [data, setData] = useState<Tweet[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		async function getTweets() {
			if (!user) {
				throw new Error('User is not logged in');
			}
			const stats = await fetch(
				`${import.meta.env.VITE_API_URL}/tweet/user/4ad99a92-b422-4b27-81e3-820fae2bbfb8`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${user.token}`,
						ContentType: 'application/json',
					},
				},
			);
			const newStats: Tweet[] = await stats.json();
			console.log(newStats);
			newStats.sort((a, b) => {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});
			setData(newStats);
			setLoading(false);
		}

		getTweets();
	}, [user]);

	const getLanguageDisplayName = (language: string): string => {
		let languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
		try {
			let languageName = languageNames.of(language);
			return languageName && languageName !== 'root' ? languageName : 'Unknown language';
		} catch (e) {
			return 'Unknown language';
		}
	};

	const getCountryFlag = (language?: string): string => {
		if (!language || language === 'und') {
			return 'xx';
		}
		if (language === 'en') {
			return 'gb';
		}
		return language;
	};

	return (
		<ScrollArea onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
			{loading ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<Table sx={{ minWidth: 700 }} highlightOnHover>
					<thead>
						<tr>
							<th style={{ width: 200, textAlign: 'center' }}>Seen at</th>
							<th>Author</th>
							<th>Verified</th>
							<th>Text</th>
							<th>Language</th>
							<th>Likes</th>
							<th>Retweets</th>
							<th>Comments</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{data.map((row) => (
							<tr key={row.id} style={{ cursor: 'pointer', textAlign: 'center' }}>
								<td>{new Date(row.createdAt).toLocaleString('de-De')}</td>
								<td>
									<Text>{row.author.username} </Text>
								</td>
								<td>
									<Badge color={row.author.isVerified ? 'blue' : 'red'} variant="filled">
										{row.author.isVerified ? 'Yes' : 'No'}
									</Badge>
								</td>
								<td>
									<Text lineClamp={1}>{row.text}</Text>
								</td>
								<td>
									{row.language && row.language !== 'und' ? (
										<Tooltip label={getLanguageDisplayName(row.language)} withArrow>
											<ReactCountryFlag countryCode={getCountryFlag(row.language)} svg />
										</Tooltip>
									) : (
										'-'
									)}
								</td>
								<td>{row.likes}</td>
								<td>{row.retweets}</td>
								<td>{row.totalComments}</td>
								<td>
									<Menu>
										<Menu.Item
											icon={<BrandTwitter size={14} />}
											onClick={() => {
												window.open(
													`https://twitter.com/${row.author.username}/status/${row.tweetId}`,
													'_blank',
												);
											}}
										>
											View Tweet on Twitter
										</Menu.Item>
										<Menu.Item
											icon={<Search size={14} />}
											onClick={() => {
												navigate(`/tweet/${row.id}`);
											}}
										>
											View Tweet details
										</Menu.Item>
									</Menu>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
		</ScrollArea>
	);
}
