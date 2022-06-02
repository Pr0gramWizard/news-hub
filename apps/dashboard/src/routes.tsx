import { useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Page } from './components/Page';
import AuthContext, { User } from './context/authProvider';
import { Dashboard } from './page/Dashboard';
import { LandingPage } from './page/LandingPage';
import { LoginPage } from './page/Login';
import { NotFound } from './page/NotFound';
import { TweetDetails } from './page/TweetDetails';
import { TweetTable } from './page/TweetTable';
import { Account } from './page/Account';
import { ParseTweet } from './page/ParseTweet';

export function AppRoutes() {
	const { user } = useContext(AuthContext);
	return (
		<Routes>
			<Route path="home" element={<LandingPage />} />
			<Route path="login" element={<LoginRoute user={user} />} />
			<Route path="" element={<ProtectedRoute user={user} />}>
				<Route path="" element={<Dashboard />} />
				<Route path="tweets" element={<TweetTable />} />
				<Route path="tweet/:id" element={<TweetDetails />} />
				<Route path="parse/tweet" element={<ParseTweet />} />
				<Route path="account" element={<Account />} />
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

interface ProtectedRouteProps {
	children?: any;
	user: User | undefined;
}

const LoginRoute = ({ user }: { user: User | undefined }) => {
	if (user) {
		return <Navigate to="/" replace />;
	}

	return <LoginPage />;
};

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (children) {
		return children;
	}

	return (
		<Page>
			<Outlet />
		</Page>
	);
};
