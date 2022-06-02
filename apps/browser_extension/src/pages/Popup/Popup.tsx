import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import React, { useEffect } from 'react';
import { AuthenticationForm } from '../../components/Auth';
import { Dashboard } from '../../components/Dashboard';
import { StateContextProvider, useStateContext } from '../../context/StateContext';

export const TOKEN_STORAGE_KEY = 'userToken';

const Popup = () => {
	return (
		<MantineProvider>
			<NotificationsProvider position="top-right">
				<StateContextProvider>
					<Component />
				</StateContextProvider>
			</NotificationsProvider>
		</MantineProvider>
	);
};

export default Popup;

export interface User {
	email: string;
	name: string;
}

function Component() {
	const { state, setState } = useStateContext();

	useEffect(() => {
		if (state === 'dashboard') return;

		chrome.storage.local.get(TOKEN_STORAGE_KEY, (result) => {
			const data = result[TOKEN_STORAGE_KEY];
			console.log(data);
			if (data && data.token) {
				setState('dashboard');
			}
		});
	}, [state, setState]);

	switch (state) {
		case 'login':
			return <AuthenticationForm />;
		case 'dashboard':
			return <Dashboard />;
		default:
			return <div>Default State</div>;
	}
}
