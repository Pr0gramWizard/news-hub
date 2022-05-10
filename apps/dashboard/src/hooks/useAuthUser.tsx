import { useEffect, useState } from "react";

export interface User {
  token: string;
  name: string;
}

export function useAuthUser(): {
  user: User | undefined;
  loading: boolean;
} {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      let authUser = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`);
      let user = await authUser.json();
      setUser(user);
    }
    getUser();
  });

  return { user, loading };
}
