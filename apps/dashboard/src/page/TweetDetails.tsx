import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../context/authProvider";

export function TweetDetails() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  if (!user) {
    throw new Error("User is not logged in");
  }

  useEffect(() => {
    async function getTweetDetails() {
      if (!user) {
        throw new Error("User is not logged in");
      }
      const tweetDetails = await fetch(
        `${import.meta.env.VITE_API_URL}/tweet/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            ContentType: "application/json",
          },
        }
      );
      const data = await tweetDetails.json();
      console.log(data);
      setLoading(false);
    }

    getTweetDetails();
  }, [user]);
  return (
    <div>
      <h1>Tweet Details</h1>
    </div>
  );
}
