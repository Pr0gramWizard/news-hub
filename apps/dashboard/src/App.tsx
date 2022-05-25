import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/authProvider';
import { AppRoutes } from './routes';

function App() {
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);
	return (
		<ErrorBoundary>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ loader: 'bars' }}>
					<ModalsProvider>
						<NotificationsProvider position={'top-center'}>
							<BrowserRouter>
								<AuthProvider>
									<AppRoutes />
								</AuthProvider>
							</BrowserRouter>
						</NotificationsProvider>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</ErrorBoundary>
	);
}

export default App;
