import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import jwt_decode from 'jwt-decode';
import React, { useEffect } from 'react';
import { AuthenticationForm } from '../../components/Auth';
import { Dashboard } from '../../components/Dashboard';
import { StateContextProvider, useStateContext } from '../../context/StateContext';

export const TOKEN_STORAGE_KEY = 'userToken';

export interface JWTPayload {
	sub: string;
	email: string;
	iat: number;
	exp: number;
}

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

function Component() {
	const { state, setState } = useStateContext();
	const [mail, setMail] = React.useState('');
	const [token, setToken] = React.useState('');

	useEffect(() => {
		if (state === 'dashboard') return;

		async function fetchToken() {
			chrome.storage.local.get([TOKEN_STORAGE_KEY]).then((result) => {
				console.log(result);
				if (result[TOKEN_STORAGE_KEY]) {
					// setToken(result[TOKEN_STORAGE_KEY]);
				}
			});
			if (token && token.length > 0) {
				const payload = jwt_decode<JWTPayload>(token);
				setMail(payload.email);
				setToken(token);
				setState('dashboard');
				return;
			}
			console.log('No token found');
		}

		fetchToken();
	}, [state, setState]);

	switch (state) {
		case 'login':
			return <AuthenticationForm />;
		case 'dashboard':
			return <Dashboard mail={mail} />;
		default:
			return <div>Default State</div>;
	}
}
