import { Code, createStyles, Group, Navbar } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBigUpLines, BrandTwitter, LayoutDashboard, Logout, Settings } from 'tabler-icons-react';
import AuthContext from '../context/authProvider';
import { NewsHubLogo } from './NewsHubLogo';

const useStyles = createStyles((theme, _params, getRef) => {
	const icon = getRef('icon');
	return {
		header: {
			paddingBottom: theme.spacing.md,
			marginBottom: theme.spacing.md * 1.5,
			borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
		},

		footer: {
			paddingTop: theme.spacing.md,
			marginTop: theme.spacing.md,
			borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
		},

		link: {
			...theme.fn.focusStyles(),
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			fontSize: theme.fontSizes.sm,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
			padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
			borderRadius: theme.radius.sm,
			fontWeight: 500,

			'&:hover': {
				backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
				color: theme.colorScheme === 'dark' ? theme.white : theme.black,

				[`& .${icon}`]: {
					color: theme.colorScheme === 'dark' ? theme.white : theme.black,
				},
			},
		},

		linkIcon: {
			ref: icon,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
			marginRight: theme.spacing.sm,
		},

		linkActive: {
			'&, &:hover': {
				backgroundColor:
					theme.colorScheme === 'dark'
						? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
						: theme.colors[theme.primaryColor][0],
				color: theme.colorScheme === 'dark' ? theme.white : theme.colors[theme.primaryColor][7],
				[`& .${icon}`]: {
					color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 7],
				},
			},
		},
	};
});

export const navbarLinks = [
	{ link: '/', label: 'Dashboard', icon: LayoutDashboard },
	{ link: '/tweets', label: 'Tweets', icon: BrandTwitter },
	{ link: '/parse/tweet', label: 'Parse Tweet', icon: ArrowBigUpLines },
	{ link: '/account', label: 'Settings', icon: Settings },
];

export function NavBar() {
	const { classes, cx } = useStyles();
	const [active, setActive] = useState('Dashboard');
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	if (!user) {
		throw new Error('User is not logged in');
	}

	const { pathname } = useLocation();

	useEffect(() => {
		navbarLinks.find((link) => {
			if (link.link === pathname) {
				setActive(link.label);
			}
		});
	});

	const links = navbarLinks.map((item) => (
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
		<Navbar width={{ sm: 250 }} p="md">
			<Navbar.Section grow>
				<Group className={classes.header} position="center">
					<NewsHubLogo variant="black" width={150} />
					<Code sx={{ fontWeight: 700 }}>{import.meta.env.VITE_APP_VERSION || 'v0.0.0'}</Code>
				</Group>
				{links}
			</Navbar.Section>

			<Navbar.Section className={classes.footer}>
				<a
					href="#"
					className={classes.link}
					onClick={(event) => {
						event.preventDefault();
						localStorage.removeItem('user');
						setUser(undefined);
						navigate('/home');
					}}
				>
					<Logout className={classes.linkIcon} />
					<span>Logout</span>
				</a>
			</Navbar.Section>
		</Navbar>
	);
}
