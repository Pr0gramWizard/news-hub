import { Author } from '../types/tweet';
import { DetailTableRow, DetailTableRowProps } from './DetailTableRow';
import { Badge, createStyles, Divider, Paper, Table, Text } from '@mantine/core';
import { CircleCheck, CircleX } from 'tabler-icons-react';

interface TweetAuthorDetailCardProps {
	author: Author;
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
}));

export function TweetAuthorDetailCard({ author }: TweetAuthorDetailCardProps) {
	const { classes } = useStyles();
	const tweetAuthorDetails: DetailTableRowProps[] = [
		{ label: 'ID', value: author.id },
		{ label: 'Username', value: author.username },
		{
			label: 'Verified',
			value: author.isVerified ? <CircleCheck color={'#1DA1F2'} /> : <CircleX color={'#E50914'} />,
		},
		{
			label: 'Type',
			value: (
				<div>
					<Badge className={classes.icon}>{author.type}</Badge>
				</div>
			),
		},
		{ label: 'Bio', value: author.bio },
		{ label: 'Location', value: author.location },
		{ label: 'Followers', value: author.numberOfFollowers.toLocaleString('de-DE') },
		{ label: 'Tweets', value: author.numberOfTweets.toLocaleString('de-DE') },
		{ label: 'Created at', value: new Date(author.createdAt).toLocaleString('de-DE') },
		{ label: 'Last updated at', value: new Date(author.updatedAt).toLocaleString('de-DE') },
	];
	return (
		<Paper withBorder radius="md" className={classes.comment}>
			<Text align="center" weight="bold" size="lg">
				Author Details
			</Text>
			<Divider className={classes.divider} />
			<Table className={classes.table}>
				<tbody>
					{tweetAuthorDetails.map(({ label, value }, index) => {
						return <DetailTableRow key={`dtr-a-${index}`} label={label} value={value} />;
					})}
				</tbody>
			</Table>
		</Paper>
	);
}
