import { createContext, useState } from "react";

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
  const [user, setUser] = useState<User | undefined>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
