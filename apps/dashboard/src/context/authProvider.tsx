import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthProviderProps {
	children: React.ReactNode;
}

export interface User {
	token: string;
	name: string;
}

interface AuthContextProps {
	user: User | undefined;
	setUser: (user: User | undefined) => void;
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

	const setUserCallback = (user: User | undefined) => {
		setUser(user);
		if (!user) {
			localStorage.removeItem('user');
			navigate('/login');
			return;
		}
		localStorage.setItem('user', JSON.stringify(user));
		navigate('/');
	};

	return (
		<AuthContext.Provider value={{ user, setUser: setUserCallback, isLoading, setIsLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
