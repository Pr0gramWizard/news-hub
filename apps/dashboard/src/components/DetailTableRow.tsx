import React from 'react';
import { Text } from '@mantine/core';

export interface DetailTableRowProps {
	label: string;
	value: string | number | React.ReactNode;
}

export function DetailTableRow({ label, value }: DetailTableRowProps) {
	return (
		<tr>
			<td>
				<Text weight="bold">{label}</Text>
			</td>
			<td>{typeof value !== 'object' ? <Text>{value}</Text> : <>{value}</>}</td>
		</tr>
	);
}
