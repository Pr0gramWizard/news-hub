import { createStyles, ScrollArea, Table } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/authProvider";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface Tweet {
  id: string;
  text: string;
  likes: string;
  createdAt: string;
}

export function TweetTable() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useContext(AuthContext);
  const [data, setData] = useState<Tweet[]>([]);

  useEffect(() => {
    async function getTweets() {
      if (!user) {
        throw new Error("User is not logged in");
      }
      const stats = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/tweet/4ad99a92-b422-4b27-81e3-820fae2bbfb8`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            ContentType: "application/json",
          },
        }
      );
      const json = await stats.json();
      console.log(json);
      const newStats: Tweet[] = [];
      for (const stat of json) {
        newStats.push({
          id: stat.id,
          text: stat.text,
          likes: stat.likes,
          createdAt: stat.createdAt,
        });
      }
      newStats.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setData(newStats);
    }
    getTweets();
  }, [user]);

  const rows = data.map((row, index) => (
    <tr key={row.id}>
      <td>{index + 1}</td>
      <td>{row.id}</td>
      <td>{row.text}</td>
      <td>{row.likes}</td>
      <td>{new Date(row.createdAt).toLocaleString()}</td>
    </tr>
  ));

  return (
    <ScrollArea onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table sx={{ minWidth: 700 }}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>#</th>
            <th>Id</th>
            <th>Text</th>
            <th>Likes</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
