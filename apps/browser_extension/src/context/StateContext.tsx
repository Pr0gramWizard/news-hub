import React from 'react';

interface StateContextProps {
	state: string;
	setState: (state: string) => void;
}

const StateContext = React.createContext<StateContextProps>({
	state: 'login',
	setState: () => {},
});

export function useStateContext() {
	return React.useContext(StateContext);
}

export function StateContextProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = React.useState('login');
	return <StateContext.Provider value={{ state, setState }}>{children}</StateContext.Provider>;
}
