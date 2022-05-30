import { Tweet } from '../types/tweet';
import { DetailTableRow, DetailTableRowProps } from './DetailTableRow';
import { Anchor, Badge, createStyles, Divider, Paper, Table, Text, Tooltip } from '@mantine/core';
import React from 'react';
import { useClipboard } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';

interface TweetDetailCardProps {
	tweet: Tweet;
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
	hover: {
		'&:hover': {
			cursor: 'pointer',
		},
	},
}));

export function TweetDetailCard({ tweet }: TweetDetailCardProps) {
	const clipboard = useClipboard({ timeout: 500 });
	const { classes } = useStyles();
	const tweetDetails: DetailTableRowProps[] = [
		{ label: 'ID', value: tweet.id },
		{ label: 'Tweet ID', value: tweet.tweetId },
		{ label: 'Likes', value: tweet.likes.toLocaleString('de-DE') },
		{ label: 'Retweets', value: tweet.retweets.toLocaleString('de-DE') },
		{ label: 'Comments', value: tweet.totalComments.toLocaleString('de-DE') },
		{
			label: 'Url',
			value: (
				<Tooltip
					label={tweet.url}
					onClick={() => {
						clipboard.copy(tweet.url);
						showNotification({
							message: 'URL copied to clipboard',
							color: 'green',
						});
					}}
				>
					<Text variant="link" className={classes.hover}>
						Hover to see / Click to copy
					</Text>
				</Tooltip>
			),
		},
		{
			label: 'See tweet',
			value: (
				<Anchor href={tweet.url} target="_blank" rel="noopener noreferrer" className={classes.hover}>
					Go to twitter
				</Anchor>
			),
		},
		{ label: 'Language', value: tweet.language },
		{
			label: 'Type',
			value:
				tweet.type.length > 0 ? (
					<div>
						{tweet.type.map((type) => (
							<Badge key={`${tweet.id}-${type}`} className={classes.icon}>
								{type}
							</Badge>
						))}
					</div>
				) : (
					''
				),
		},
		{
			label: 'Hashtags',
			value:
				tweet.hashtags.length > 0 ? (
					<div>
						{tweet.hashtags.map((hashtag) => (
							<Badge>{hashtag.name}</Badge>
						))}
					</div>
				) : (
					<span>No hashtags</span>
				),
		},
		{ label: 'Created at', value: new Date(tweet.createdAt).toLocaleString('de-DE') },
		{ label: 'Seen at', value: new Date(tweet.seenAt).toLocaleString('de-DE') },
	];
	return (
		<Paper withBorder radius="md" className={classes.comment}>
			<Text align="center" weight="bold" size="lg">
				Tweet Details
			</Text>
			<Divider className={classes.divider} />
			<Table className={classes.table}>
				<tbody>
					{tweetDetails.map(({ label, value }) => {
						return <DetailTableRow label={label} value={value} />;
					})}
				</tbody>
			</Table>
		</Paper>
	);
}
