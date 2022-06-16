import { Button, Card, Center, Divider, Group, Loader, Stack, Switch, Text } from '@mantine/core';
import React, { useEffect } from 'react';
import { useStateContext } from '../context/StateContext';
import { TOKEN_STORAGE_KEY, User } from '../pages/Popup/Popup';
import jwt_decode from 'jwt-decode';

export interface JWTPayload {
	sub: string;
	email: string;
	name: string;
}

export function Dashboard() {
	const SCRIPT_ENABLED_KEY = 'collection_script_enabled';
	const { setState } = useStateContext();
	const [isEnabled, setIsEnabled] = React.useState(false);
	const [user, setUser] = React.useState<User | undefined>(undefined);
	const appVersion = process.env.VERSION;

	useEffect(() => {
		chrome.storage.local.get([TOKEN_STORAGE_KEY, SCRIPT_ENABLED_KEY], (result) => {
			const data = result[TOKEN_STORAGE_KEY];
			const payload = jwt_decode<JWTPayload>(data.token);
			setUser({
				email: payload.email,
				name: data.name,
			});
			setIsEnabled(result[SCRIPT_ENABLED_KEY] === true);
		});
	}, [setIsEnabled, setUser]);

	const toggleExtension = async (isEnabled: boolean) => {
		setIsEnabled(isEnabled);
		await chrome.storage.local.set({ [SCRIPT_ENABLED_KEY]: isEnabled });
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const currentTab = tabs[0];
			if (!currentTab || !currentTab.id) return;
			chrome.tabs.sendMessage(currentTab.id, { isEnabled });
		});
	};

	return (
		<>
			{!user ? (
				<Center style={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<Card withBorder p="xl" radius="md">
					<Text align="center" size="lg" weight={500} mt="sm">
						Welcome <span style={{ color: 'cornflowerblue' }}>{user.name}</span>
					</Text>
					<Text align="center" size="sm" mt="ms" weight={900}>
						Version: <span style={{ color: 'dimgrey' }}>{appVersion}</span>
					</Text>
					<Divider mb="md" />
					<Stack>
						<Group>
							<Switch
								label="Extension status"
								checked={isEnabled}
								size="lg"
								onChange={async (event) => {
									const { checked } = event.target;
									await toggleExtension(checked);
								}}
								onLabel="ON"
								offLabel="OFF"
							/>
						</Group>

						<Button
							size="sm"
							color={'red'}
							onClick={() => {
								chrome.storage.local.remove([TOKEN_STORAGE_KEY, SCRIPT_ENABLED_KEY], () => {
									chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
										const currentTab = tabs[0];
										if (!currentTab || !currentTab.id) return;
										chrome.tabs.sendMessage(currentTab.id, { isEnabled: false });
									});
									setState('login');
								});
							}}
						>
							Logout{' '}
						</Button>
					</Stack>
				</Card>
			)}
		</>
	);
}
