import { Tweet, TweetType } from '../types/tweet';
import { useState } from 'react';
import { MultiSelect } from '@mantine/core';

interface TweetTypeMultiSelectProps {
	tweet: Tweet;
	onChange: (changes: string[]) => void;
	readonly: boolean;
}

const tweetTypeData = [
	{ label: 'Normal', value: 'NORMAL' },
	{ label: 'Contains news article', value: 'CONTAINS_NEWS_ARTICLE' },
	{ label: 'Author is news outlet', value: 'AUTHOR_IS_NEWS_OUTLET' },
];

export function TweetTypeMultiSelect({ tweet, onChange, readonly }: TweetTypeMultiSelectProps) {
	const [tweetType] = useState<TweetType[]>(tweet.userClassification || []);

	return (
		<MultiSelect
			disabled={readonly}
			data={tweetTypeData}
			limit={5}
			searchable
			defaultValue={tweetType}
			placeholder="Select tweet type"
			onChange={onChange}
		/>
	);
}
