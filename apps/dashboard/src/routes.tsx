import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./page/Dashbboard";
import { LoginPage } from "./page/Login";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
