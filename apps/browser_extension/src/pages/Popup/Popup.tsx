import React, { useEffect } from 'react';
import { AuthenticationForm } from './auth/Auth';

const Popup = () => {
	const tokenStorageKey = 'userToken';
	const [state, setState] = React.useState('login');
	const [token, setToken] = React.useState('No token');
	useEffect(() => {
		console.log(token);

		async function getToken() {
			const { token } = await chrome.storage.sync.get(tokenStorageKey);
			if (token) {
				setToken(token);
			}
		}

		getToken();
	});

	const deleteToken = async () => {
		await chrome.storage.sync.remove(tokenStorageKey);
		setToken('No token');
	};

	const getStateComponent = () => {
		switch (state) {
			case 'login':
				return <AuthenticationForm />;
			default:
				return <div>Default State</div>;
		}
	};

	return <>{getStateComponent()}</>;
};

export default Popup;
