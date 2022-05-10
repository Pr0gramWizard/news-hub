import { createContext, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface User {
  token: string;
  name: string;
}

const AuthContext = createContext<User | undefined>({
  token: "",
  name: "",
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export default AuthContext;
