import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

interface AuthProviderProps {
	children: React.ReactNode;
}

export interface User {
	name: string;
	email: string;
	role: string;
	token: string;
}

export interface LoginResponse {
	token: string;
	name: string;
}

interface AuthContextProps {
	user: User | undefined;
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
	const [user, setUser] = useState<User | undefined>(JSON.parse(localStorage.getItem('user') || 'null'));
	const [isLoading, setIsLoading] = useState(true);

	const setUserCallback = (user: LoginResponse | undefined) => {
		if (!user) {
			setUser(undefined);
			localStorage.removeItem('user');
			navigate('/login');
			return;
		}
		const payload = jwtDecode(user.token) as User;
		const userPayload = {
			name: user.name,
			email: payload.email,
			role: payload.role,
			token: user.token,
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
