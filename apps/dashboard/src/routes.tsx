import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./page/Login";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}
