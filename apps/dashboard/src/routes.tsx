import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthContext, { User } from "./context/authProvider";
import { Dashboard } from "./page/Dashbboard";
import { LandingPage } from "./page/LandingPage";
import { LoginPage } from "./page/Login";
import { NotFound } from "./page/NotFound";

export function AppRoutes() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginRoute user={user} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

interface ProtectedRouteProps {
  children: any;
  user: User | undefined;
}

const LoginRoute = ({ user }: { user: User | undefined }) => {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
};

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
