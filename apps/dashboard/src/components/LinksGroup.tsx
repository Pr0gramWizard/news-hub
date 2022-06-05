import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Icon as TablerIcon } from 'tabler-icons-react';
import { Box, Collapse, createStyles, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';

interface LinksGroupProps {
	icon: TablerIcon;
	label: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
	activeItem: string;
	prefix?: string;
}

const useStyles = createStyles((theme) => ({
	control: {
		fontWeight: 500,
		display: 'block',
		width: '100%',
		padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
		fontSize: theme.fontSizes.sm,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
			color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	},

	link: {
		fontWeight: 500,
		display: 'block',
		textDecoration: 'none',
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
		paddingLeft: 31,
		marginLeft: 30,
		fontSize: theme.fontSizes.sm,
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
		borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
			color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	},

	chevron: {
		transition: 'transform 200ms ease',
	},

	linkActive: {
		'&, &:hover': {
			backgroundColor:
				theme.colorScheme === 'dark'
					? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
					: theme.colors[theme.primaryColor][0],
			color: theme.colorScheme === 'dark' ? theme.white : theme.colors[theme.primaryColor][7],
		},
	},
}));

export function LinksGroup({ icon: Icon, label, links, activeItem, prefix }: LinksGroupProps) {
	const navigate = useNavigate();
	const { classes, theme, cx } = useStyles();
	const hasLinks = Array.isArray(links);
	const [opened, setOpened] = useState(false);
	const ChevronIcon = theme.dir === 'ltr' ? ChevronRight : ChevronLeft;
	const { pathname } = useLocation();
	const items = (hasLinks ? links : []).map((link) => (
		<Text<'a'>
			component="a"
			className={cx(classes.link, {
				[classes.linkActive]: prefix && pathname.includes(prefix) && link.label === activeItem,
			})}
			href={link.link}
			key={`${label}-${link.label}`}
			onClick={(event) => {
				event.preventDefault();
				navigate(link.link);
			}}
		>
			{link.label}
		</Text>
	));

	useEffect(() => {
		if (prefix && pathname.includes(prefix)) {
			links?.forEach((link) => {
				if (link.label === activeItem) {
					setOpened(true);
				}
			});
		}
	}, [activeItem, label]);

	return (
		<>
			<UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
				<Group position="apart" spacing={0}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<ThemeIcon variant="light" size={30}>
							<Icon size={18} />
						</ThemeIcon>
						<Box ml="md">{label}</Box>
					</Box>
					{hasLinks && (
						<ChevronIcon
							className={classes.chevron}
							size={14}
							style={{
								transform: opened ? `rotate(${theme.dir === 'rtl' ? -90 : 90}deg)` : 'none',
							}}
						/>
					)}
				</Group>
			</UnstyledButton>
			{hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
		</>
	);
}
