import { useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Page } from './components/Page';
import AuthContext, { Account } from './context/authProvider';
import { Dashboard } from './page/Dashboard';
import { LandingPage } from './page/LandingPage';
import { LoginPage } from './page/Login';
import { NotFound } from './page/NotFound';
import { UserTweetDetailsPage } from './page/UserTweetDetailsPage';
import { TweetTable } from './page/TweetTable';
import { ParseTweet } from './page/ParseTweet';
import { AdminTweetTable } from './page/admin/AdminTweetTable';
import { AdminUserTable } from './page/admin/AdminUserTable';
import { AdminExport } from './page/admin/AdminExport';
import { AccountPage } from './page/AccountPage';

export function AppRoutes() {
	const { user } = useContext(AuthContext);
	return (
		<Routes>
			<Route path="home" element={<LandingPage />} />
			<Route path="login" element={<LoginRoute user={user} />} />
			<Route path="" element={<ProtectedRoute user={user} />}>
				<Route path="" element={<Dashboard />} />
				<Route path="tweets" element={<TweetTable />} />
				<Route path="tweet/:id" element={<UserTweetDetailsPage />} />
				<Route path="parse/tweet" element={<ParseTweet />} />
				<Route path="account" element={<AccountPage />} />
			</Route>
			<Route path="admin" element={<AdminRoute user={user} />}>
				<Route path="users" element={<AdminUserTable />} />
				<Route path="tweets" element={<AdminTweetTable />} />
				<Route path="tweet/:id" element={<UserTweetDetailsPage readonly={true} />} />
				<Route path="export" element={<AdminExport />} />
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

interface ProtectedRouteProps {
	children?: any;
	user: Account | undefined;
}

const LoginRoute = ({ user }: { user: Account | undefined }) => {
	if (user) {
		return <Navigate to="/" replace />;
	}

	return <LoginPage />;
};

const AdminRoute = ({ user, children }: ProtectedRouteProps) => {
	if (!user) {
		return <Navigate to="/" replace />;
	}
	if (!user.isAdmin) {
		return <NotFound />;
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
