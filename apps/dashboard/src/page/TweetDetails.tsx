import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/authProvider";

export function TweetDetails() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  if (!user) {
    throw new Error("User is not logged in");
  }
  return (
    <div>
      <h1>Tweet Details</h1>
    </div>
  );
}
