import { Text, Timeline } from '@mantine/core';
import { BrandTwitter } from 'tabler-icons-react';
import { Tweet } from '../types/tweet';
import { formatDistance } from 'date-fns/fp';
import { Link } from 'react-router-dom';

interface TweetHistoryProps {
	tweets: Tweet[];
}

export function TweetHistory({ tweets }: TweetHistoryProps) {
	return (
		<Timeline bulletSize={24} lineWidth={2}>
			{tweets.map((tweet) => (
				<Timeline.Item
					key={tweet.id}
					bullet={<BrandTwitter size={12} />}
					title={
						<Text<typeof Link> component={Link} variant="link" to={`/tweet/${tweet.id}`}>
							{tweet.author.username}
						</Text>
					}
					active={true}
				>
					<Text color="dimmed" size="sm">
						{tweet.text}
					</Text>
					<Text size="xs" mt={4}>
						{formatDistance(new Date(tweet.seenAt), new Date())}
					</Text>
				</Timeline.Item>
			))}
		</Timeline>
	);
}
