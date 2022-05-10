import { Button } from "@mantine/core";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/authProvider";

export function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  if (!user) {
    throw new Error("User is not logged in");
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Hallo {user.name}</h2>
      <h3>Your token is {user.token}</h3>
      <Button
        onClick={() => {
          localStorage.removeItem("user");
          setUser(undefined);
          navigate("/");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
