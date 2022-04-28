import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import jwt_decode from 'jwt-decode';
import React, { useEffect } from 'react';
import { AuthenticationForm } from '../../components/Auth';
import { Dashboard } from '../../components/Dashboard';

export const TOKEN_STORAGE_KEY = 'userToken';

export interface JWTPayload {
	sub: string;
	email: string;
	iat: number;
	exp: number;
}

const Popup = () => {
	const [mail, setMail] = React.useState('');
	const [state, setState] = React.useState('login');
	const [token, setToken] = React.useState('No token');
	const [didStateChange, setDidStateChange] = React.useState(false);
	useEffect(() => {
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		if (token) {
			setToken(token);
			setState('dashboard');
			const payload = jwt_decode<JWTPayload>(token);
			setMail(payload.email);
		} else {
			console.log('No token found');
		}
	}, [didStateChange]);

	const getStateComponent = () => {
		switch (state) {
			case 'login':
				return (
					<AuthenticationForm
						onLogin={() => {
							console.log('Login');
							setDidStateChange(true);
							setState('dashboard');
						}}
					/>
				);
			case 'dashboard':
				return (
					<Dashboard
						mail={mail}
						onLogout={() => {
							console.log('Logging out');
							localStorage.removeItem(TOKEN_STORAGE_KEY);
							setState('login');
						}}
					/>
				);
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
