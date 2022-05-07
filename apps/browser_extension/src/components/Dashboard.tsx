import { ActionIcon, Card, Group, Switch, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useCallback, useEffect } from 'react';
import { Logout, Refresh, X } from 'tabler-icons-react';
import { useStateContext } from '../context/StateContext';
import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

interface DashboardProps {
	mail: string;
}

interface UserStatistic {
	label: string;
	value: number | string;
}

export function Dashboard({ mail }: DashboardProps) {
	const SCRIPT_ENABLED_KEY = 'collection_script_enabled';
	const { setState } = useStateContext();
	const [stats, setStats] = React.useState<UserStatistic[]>([]);
	const [isEnabled, setIsEnabled] = React.useState(false);

	const memoizedCallback = useCallback(async () => {
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
			if (response.status === 403) {
				localStorage.removeItem(TOKEN_STORAGE_KEY);
				showNotification({
					autoClose: 5000,
					title: 'Authentication error',
					message: 'Your session has expired. Please log in again.',
					color: 'red',
					icon: <X />,
				});
				setState('login');
				return;
			}
			setStats(data);
		} catch (e) {
			if (!(e instanceof Error)) {
				throw e;
			}
			console.log(e);
		}
	}, [setState]);

	useEffect(() => {
		async function fetchData() {
			await memoizedCallback();
			const isEnabled = localStorage.getItem(SCRIPT_ENABLED_KEY);
			if (isEnabled && isEnabled === 'true') {
				toggleExtension(true);
			}
		}

		fetchData();
	}, [setStats, memoizedCallback]);

	const toggleExtension = (isEnabled: boolean) => {
		setIsEnabled(isEnabled);
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const activeTab = tabs[0];
			if (activeTab && activeTab.id) {
				chrome.tabs.sendMessage(activeTab.id, { type: 'toggle_extension', enabled: isEnabled });
			}
		});
		localStorage.setItem(SCRIPT_ENABLED_KEY, isEnabled ? 'true' : 'false');
	};

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
			<Group grow spacing={5}>
				<Switch
					checked={isEnabled}
					onChange={(event) => {
						const { checked } = event.target;
						toggleExtension(checked);
					}}
					onLabel="ON"
					offLabel="OFF"
				/>
				<ActionIcon
					variant="default"
					onClick={async () => {
						await memoizedCallback();
					}}
				>
					<Refresh />
				</ActionIcon>
				<ActionIcon
					color={'red'}
					onClick={() => {
						localStorage.removeItem(TOKEN_STORAGE_KEY);
						setState('login');
					}}
				>
					<Logout />
				</ActionIcon>
			</Group>
		</Card>
	);
}
