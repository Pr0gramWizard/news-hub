import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import React, { useEffect } from 'react';
import { AuthenticationForm } from './auth/Auth';

export const TOKEN_STORAGE_KEY = 'userToken';

const Popup = () => {
	const [state, setState] = React.useState('login');
	const [token, setToken] = React.useState('No token');
	useEffect(() => {
		async function getToken() {
			const { token } = await chrome.storage.sync.get(TOKEN_STORAGE_KEY);
			if (token) {
				setToken(token);
				setState('dashboard');
			}
		}
		getToken();
	});

	const getStateComponent = () => {
		switch (state) {
			case 'login':
				return <AuthenticationForm />;
			case 'dashboard':
				return <div>Dashboard</div>;
			default:
				return <div>Default State</div>;
		}
	};

	return (
		<MantineProvider>
			<NotificationsProvider position="top-right">{getStateComponent()}</NotificationsProvider>
		</MantineProvider>
	);
};

export default Popup;
