import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

interface AuthProviderProps {
	children: React.ReactNode;
}

export interface Account {
	name: string;
	email: string;
	role: string;
	token: string;
	isAdmin: boolean;
}

export interface LoginResponse {
	token: string;
	name: string;
}

interface AuthContextProps {
	user: Account | undefined;
	setUser: (user?: LoginResponse) => void;
	isLoading: boolean | undefined;
	setIsLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
	user: undefined,
	setUser: () => {},
	isLoading: undefined,
	setIsLoading: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<Account | undefined>(JSON.parse(localStorage.getItem('user') || 'null'));
	const [isLoading, setIsLoading] = useState(true);

	const setUserCallback = (user: LoginResponse | undefined) => {
		if (!user) {
			setUser(undefined);
			localStorage.removeItem('user');
			navigate('/login');
			return;
		}
		const payload = jwtDecode(user.token) as Account;
		const role = payload.role.toLowerCase();
		const userPayload = {
			name: user.name,
			email: payload.email,
			role,
			token: user.token,
			isAdmin: role === 'admin' || role === 'super_admin',
		};
		setUser(userPayload);
		localStorage.setItem('user', JSON.stringify(userPayload));
		navigate('/');
	};

	return (
		<AuthContext.Provider value={{ user, setUser: setUserCallback, isLoading, setIsLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
