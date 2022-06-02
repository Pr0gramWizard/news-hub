import { createStyles, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import React, { useContext, useEffect } from 'react';
import { BrandTwitter, Clock, Timeline, UserPlus } from 'tabler-icons-react';
import AuthContext from '../context/authProvider';

const useStyles = createStyles((theme) => ({
	root: {
		padding: theme.spacing.xl * 1.5,
	},

	value: {
		fontSize: 24,
		fontWeight: 700,
		lineHeight: 1,
	},

	diff: {
		lineHeight: 1,
		display: 'flex',
		alignItems: 'center',
	},

	icon: {
		color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
	},

	title: {
		fontWeight: 700,
		textTransform: 'uppercase',
	},
}));

const icons = {
	tweets: BrandTwitter,
	last24h: Clock,
	users: UserPlus,
	default: Timeline,
};

interface StatCardProps {
	title: string;
	icon: keyof typeof icons;
	value: string;
}

interface StatsRepoonse {
	label: string;
	value: string | number;
}

function getIconByLabel(label: string): keyof typeof icons {
	switch (label) {
		case 'Collected tweets':
			return 'tweets';
		case 'Collected tweets in the last 24 hours':
			return 'last24h';
		case 'Unique Authors':
			return 'users';
		default:
			return 'default';
	}
}

export function Dashboard() {
	const { user, setUser } = useContext(AuthContext);
	const { classes } = useStyles();
	const [stats, setStats] = React.useState<StatCardProps[]>([]);

	useEffect(() => {
		async function fetchStats() {
			if (!user) {
				throw new Error('User is not logged in');
			}
			const stats = await fetch(`${import.meta.env.VITE_API_URL}/stats/me`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${user.token}`,
					ContentType: 'application/json',
				},
			});
			if (stats.status === 403) {
				setUser(undefined);
				return;
			}
			const json = (await stats.json()) as StatsRepoonse[];
			const newStats = [];
			for (const stat of json) {
				newStats.push({
					title: stat.label,
					icon: getIconByLabel(stat.label),
					value: stat.value.toString(),
				});
			}
			setStats(newStats);
		}

		fetchStats();
	}, [user]);

	const statsComponent = stats.map((stat) => {
		const Icon = icons[stat.icon];

		return (
			<Paper withBorder p="md" radius="md" key={stat.title}>
				<Group position="center">
					<Text size="xs" color="dimmed" className={classes.title}>
						{stat.title}
					</Text>
					<Icon className={classes.icon} size={22} />
				</Group>

				<Group position="center" spacing="xs" mt={25}>
					<Text className={classes.value}>{stat.value}</Text>
				</Group>
			</Paper>
		);
	});
	return (
		<div className={classes.root}>
			<SimpleGrid
				cols={4}
				breakpoints={[
					{ maxWidth: 'md', cols: 2 },
					{ maxWidth: 'xs', cols: 1 },
				]}
			>
				{statsComponent}
			</SimpleGrid>
		</div>
	);
}
