import {
  Center,
  createStyles,
  Loader,
  Menu,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import AuthContext from "../context/authProvider";
import { BrandTwitter, Search } from "tabler-icons-react";
import { useNavigate } from "react-router-dom";

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

interface Author {
  bio?: string;
  createdAt?: string;
  id: string;
  isVerified?: boolean;
  location: string | null;
  numberOfFollowers: number;
  numberOfTweets: number;
  type: string;
  username: string;
}

interface Tweet {
  id: string;
  tweetId: string;
  text: string;
  likes: number;
  language?: string;
  retweets: number;
  totalComments: number;
  totalQuotes: number;
  createdAt: string;
  author: Author;
}

export function TweetTable() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useContext(AuthContext);
  const [data, setData] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getTweets() {
      if (!user) {
        throw new Error("User is not logged in");
      }
      const stats = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/tweets/user/4ad99a92-b422-4b27-81e3-820fae2bbfb8`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            ContentType: "application/json",
          },
        }
      );
      const newStats: Tweet[] = await stats.json();
      newStats.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setData(newStats);
      setLoading(false);
    }

    getTweets();
  }, [user]);

  const getLanguageDisplayName = (language: string): string => {
    let languageNames = new Intl.DisplayNames(["en"], { type: "language" });
    try {
      let languageName = languageNames.of(language);
      return languageName && languageName !== "root"
        ? languageName
        : "Unknown language";
    } catch (e) {
      return "Unknown language";
    }
  };

  const getCountryFlag = (language?: string): string => {
    if (!language || language === "und") {
      return "xx";
    }
    if (language === "en") {
      return "gb";
    }
    return language;
  };

  const rows = data.map((row, index) => (
    <tr key={row.id} style={{ cursor: "pointer", textAlign: "center" }}>
      <td>{new Date(row.createdAt).toLocaleString("de-De")}</td>
      <td>
        <Text>{row.author.username} </Text>
      </td>
      <td>
        <Text color={row.author.isVerified ? "blue" : "red"}>
          {row.author.isVerified ? "Yes" : "No"}
        </Text>
      </td>
      <td>
        <Text lineClamp={1}>{row.text}</Text>
      </td>
      <td>
        {row.language && row.language !== "und" ? (
          <Tooltip label={getLanguageDisplayName(row.language)} withArrow>
            <ReactCountryFlag countryCode={getCountryFlag(row.language)} svg />
          </Tooltip>
        ) : (
          "-"
        )}
      </td>
      <td>{row.likes}</td>
      <td>{row.retweets}</td>
      <td>{row.totalComments}</td>
      <td>
        <Menu>
          <Menu.Item
            icon={<BrandTwitter size={14} />}
            onClick={() => {
              window.open(
                `https://twitter.com/${row.author.username}/status/${row.tweetId}`,
                "_blank"
              );
            }}
          >
            View Tweet on Twitter
          </Menu.Item>
          <Menu.Item
            icon={<Search size={14} />}
            onClick={() => {
              navigate(`/tweet/${row.id}`);
            }}
          >
            View Tweet details
          </Menu.Item>
        </Menu>
      </td>
    </tr>
  ));

  return (
    <ScrollArea onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      {loading ? (
        <Center sx={{ height: "100vh" }}>
          <Loader />
        </Center>
      ) : (
        <Table sx={{ minWidth: 700 }} highlightOnHover>
          <thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            <tr>
              <th style={{ width: 200, textAlign: "center" }}>Seen at</th>
              <th style={{ textAlign: "center" }}>Author</th>
              <th style={{ textAlign: "center" }}>Verified</th>
              <th style={{ textAlign: "center" }}>Text</th>
              <th style={{ textAlign: "center" }}>Language</th>
              <th style={{ textAlign: "center" }}>Likes</th>
              <th style={{ textAlign: "center" }}>Retweets</th>
              <th style={{ textAlign: "center" }}>Comments</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </ScrollArea>
  );
}
