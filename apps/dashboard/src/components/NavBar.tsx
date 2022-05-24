import { Code, createStyles, Group, Navbar } from "@mantine/core";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrandTwitter,
  LayoutDashboard,
  Logout,
  Settings,
} from "tabler-icons-react";
import { NewsHubLogo } from "./NewsHubLogo";
import AuthContext from "../context/authProvider";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    navbar: {
      backgroundColor: theme.colors.violet[8],
    },

    version: {
      backgroundColor: theme.colors.violet[8],
      color: theme.white,
      fontWeight: 700,
    },

    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${theme.colors.violet[8]}`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${theme.colors.violet[8]}`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color: theme.white,
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor: theme.colors[theme.primaryColor][5],
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.white,
      opacity: 0.75,
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.colors[theme.primaryColor][7],
        [`& .${icon}`]: {
          opacity: 0.9,
        },
      },
    },
  };
});

const data = [
  { link: "/", label: "Dashboard", icon: LayoutDashboard },
  { link: "/tweets", label: "Tweets", icon: BrandTwitter },
  { link: "/user/settings", label: "Settings", icon: Settings },
];

export function NavBar() {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  if (!user) {
    throw new Error("User is not logged in");
  }

  const links = data.map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        navigate(item.link);
      }}
    >
      <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <Navbar width={{ sm: 200 }} p="md" className={classes.navbar}>
      <Navbar.Section grow>
        <Group className={classes.header} position="center">
          <NewsHubLogo variant="white" width={75} />
          <Code className={classes.version}>
            v{import.meta.env.VITE_APP_VERSION || "0.0.0"}
          </Code>
        </Group>
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            localStorage.removeItem("user");
            setUser(undefined);
            navigate("/home");
          }}
        >
          <Logout className={classes.linkIcon} />
          <span>Logout</span>
        </a>
      </Navbar.Section>
    </Navbar>
  );
}
