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
					<Conponent />
				</StateContextProvider>
			</NotificationsProvider>
		</MantineProvider>
	);
};

export default Popup;

function Conponent() {
	const { state, setState } = useStateContext();
	const [mail, setMail] = React.useState('');
	const [token, setToken] = React.useState('No token');

	useEffect(() => {
		if (state === 'dashboard') return;
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		if (token) {
			setToken(token);
			setState('dashboard');
			const payload = jwt_decode<JWTPayload>(token);
			setMail(payload.email);
		} else {
			console.log('No token found');
		}
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
