import { ActionIcon, Card, Group, Text } from '@mantine/core';
import React, { useEffect } from 'react';
import { Logout, Refresh } from 'tabler-icons-react';
import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

interface DashboardProps {
	mail: string;
	onLogout: () => void;
}

interface UserStatistic {
	label: string;
	value: number | string;
}
export function Dashboard({ mail, onLogout }: DashboardProps) {
	const [stats, setStats] = React.useState<UserStatistic[]>([]);
	const [isEnabled, setIsEnabled] = React.useState(false);

	async function fetchStats() {
		try {
			console.log('Fetching stats');
			const response = await fetch(`${process.env.API_URL}/stats/me`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY)}`,
				},
			});
			const data = await response.json();
			setStats(data);
		} catch (e) {
			if (!(e instanceof Error)) {
				throw e;
			}
		}
	}

	useEffect(() => {
		async function fetchData() {
			await fetchStats();
			setIsEnabled(true);
		}
		fetchData();
	}, []);

	const items = stats.map((s) => (
		<div key={s.label}>
			<Text align="center" size="lg" weight={500}>
				{s.value}
			</Text>
			<Text align="center" size="sm" color="dimmed">
				{s.label}
			</Text>
		</div>
	));

	return (
		<Card withBorder p="xl" radius="md">
			<Text align="center" size="lg" weight={500} mt="sm">
				{mail}
			</Text>
			<Group mt="md" position="center" spacing={30}>
				{items}
			</Group>
			<Group grow spacing={10}>
				<ActionIcon
					variant="default"
					color={isEnabled ? 'primary' : 'dimmed'}
					onClick={() => {
						setIsEnabled(true);
					}}
				>
					{isEnabled ? 'Disable' : 'Enable'}
				</ActionIcon>
				<ActionIcon
					variant="default"
					onClick={async () => {
						await fetchStats();
					}}
				>
					<Refresh />
				</ActionIcon>
				<ActionIcon color={'red'} onClick={onLogout}>
					<Logout />
				</ActionIcon>
			</Group>
		</Card>
	);
}
