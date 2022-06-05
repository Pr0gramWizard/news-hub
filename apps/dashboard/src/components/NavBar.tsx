import { Box, Code, createStyles, Group, Navbar, ThemeIcon } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	ArrowBigUpLines,
	BrandTwitter,
	Icon as TablerIcon,
	LayoutDashboard,
	Lock,
	Logout,
	Settings,
} from 'tabler-icons-react';
import AuthContext from '../context/authProvider';
import { NewsHubLogo } from './NewsHubLogo';
import { LinksGroup } from './LinksGroup';

interface NavBarItem {
	icon: TablerIcon;
	link?: string;
	label: string;
	links?: NestedNavBarItem[];
	isAdminItem?: boolean;
	prefix?: string;
}

interface NestedNavBarItem {
	link: string;
	label: string;
}

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

export const navbarLinks: NavBarItem[] = [
	{ link: '/', label: 'Dashboard', icon: LayoutDashboard },
	{ link: '/tweets', label: 'Tweets', icon: BrandTwitter },
	{ link: '/parse/tweet', label: 'Parse Tweet', icon: ArrowBigUpLines },
	{ link: '/account', label: 'Settings', icon: Settings },
	{
		label: 'Admin',
		isAdminItem: true,
		icon: Lock,
		prefix: 'admin',
		links: [
			{ link: '/admin/users', label: 'All Users' },
			{ link: '/admin/tweets', label: 'All Tweets' },
			{ link: '/admin/export', label: 'Export' },
		],
	},
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
		if (pathname.includes('admin')) {
			const adminLinks = navbarLinks.find((link) => link.label === 'Admin');
			if (!adminLinks || !adminLinks.links) {
				return;
			}
			adminLinks.links.forEach((link) => {
				if (link.link === pathname) {
					setActive(link.label);
				}
			});
			return;
		}
		navbarLinks.find((link) => {
			if (link.link === pathname) {
				setActive(link.label);
			}
		});
	});

	const links = navbarLinks.map((item) => {
		if (item.isAdminItem && !user.isAdmin) {
			return;
		}
		if (item.link) {
			return (
				<a
					className={cx(classes.link, {
						[classes.linkActive]: item.label === active,
					})}
					href={item.link}
					key={item.label}
					onClick={(event) => {
						event.preventDefault();
						setActive(item.label);
						if (item.link) {
							navigate(item.link);
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<ThemeIcon variant="light" size={30}>
							<item.icon size={18} />
						</ThemeIcon>
						<Box ml="md" key={`box-${item.label}`}>
							{item.label}
						</Box>
					</Box>
				</a>
			);
		}
		return <LinksGroup key={`link-group-${item.label}`} {...item} activeItem={active} />;
	});

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
