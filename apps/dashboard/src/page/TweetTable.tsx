import {
	Badge,
	Box,
	Center,
	Grid,
	Loader,
	Menu,
	Pagination,
	Space,
	Table,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import React, { useContext, useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate } from 'react-router-dom';
import { BrandTwitter, Search, X } from 'tabler-icons-react';
import CenteredTableHeader from '../components/CenteredTableHeader';
import AuthContext from '../context/authProvider';
import { Tweet } from '../types/tweet';

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

export function TweetTable() {
	const { user, setUser } = useContext(AuthContext);
	const [data, setData] = useState<Tweet[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebouncedValue(search, 750);
	const [totalNumberOfTweets, setTotalNumberOfTweets] = useState(0);
	const [maxPages, setMaxPages] = useState(0);
	const [activePage, setPage] = useState(1);

	const fetchTweets = async () => {
		if (!user) {
			throw new Error('User is not logged in');
		}
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/tweet/user?searchTerm=${debouncedSearch}&limit=15&page=${activePage}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${user.token}`,
					ContentType: 'application/json',
				},
			},
		);
		if (response.status === 403) {
			localStorage.removeItem('user');
			setUser(undefined);
			navigate('/home');
			return;
		}
		const data = await response.json();
		const newStats: Tweet[] = data.tweets;
		setData(newStats);
		setTotalNumberOfTweets(data.total);
		setMaxPages(Math.ceil(data.total / 15));
		setLoading(false);
	};

	useEffect(() => {
		if (debouncedSearch.includes('#')) {
			showNotification({
				title: 'Invalid search query',
				message: 'Search queries cannot contain #',
				color: 'red',
				icon: <X />,
			});
			return;
		}
		fetchTweets();
	}, [user, debouncedSearch, activePage]);

	const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
	};

	return (
		<Box>
			{loading ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<>
					<TextInput
						placeholder="Either search by text or by keyword like 'author:username'"
						mb="md"
						icon={<Search size={14} />}
						value={search}
						onChange={handleSearchChange}
					/>
					{data.length === 0 ? (
						<Center>
							<Text>No tweets found</Text>
						</Center>
					) : (
						<>
							<Table highlightOnHover>
								<thead>
									<tr>
										<CenteredTableHeader>Seen at</CenteredTableHeader>
										<CenteredTableHeader>Author</CenteredTableHeader>
										<CenteredTableHeader>Verified</CenteredTableHeader>
										<CenteredTableHeader>Text</CenteredTableHeader>
										<CenteredTableHeader>Language</CenteredTableHeader>
										<CenteredTableHeader>Likes</CenteredTableHeader>
										<CenteredTableHeader>Retweets</CenteredTableHeader>
										<CenteredTableHeader>Comments</CenteredTableHeader>
										<CenteredTableHeader>Actions</CenteredTableHeader>
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
														<ReactCountryFlag
															countryCode={getCountryFlag(row.language)}
															svg
														/>
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
							<Space h="xl" />
							<Grid style={{ marginLeft: 10, overflowX: 'hidden' }}>
								<Grid.Col span={6}>
									Showing {(activePage - 1) * 15 + 1} to{' '}
									{Math.min(activePage * 15, totalNumberOfTweets)} from {totalNumberOfTweets} Tweets
								</Grid.Col>

								<Grid.Col span={3} offset={3}>
									<Grid justify="flex-end">
										<Pagination page={activePage} onChange={setPage} total={maxPages} />
									</Grid>
								</Grid.Col>
							</Grid>
						</>
					)}
				</>
			)}
		</Box>
	);
}
