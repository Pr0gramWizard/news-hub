import { Container, createStyles } from '@mantine/core';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authProvider';

const useStyles = createStyles((theme) => ({
	comment: {
		padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
	},

	body: {
		paddingLeft: 54,
		paddingTop: theme.spacing.sm,
		fontSize: theme.fontSizes.sm,
	},

	content: {
		paddingTop: theme.spacing.lg,
		'& > p:last-child': {
			marginBottom: 0,
		},
	},
	icon: {
		marginRight: 5,
		color: 'black',
	},
	grid: {
		marginTop: '5%',
	},
	divider: {
		marginTop: '2%',
		marginBottom: '2%',
	},
	table: {
		textAlign: 'center',
	},
	backArrow: {
		textAlign: 'end',
	},
}));

export function UserSettings() {
	const navigate = useNavigate();
	const { user, setUser } = useContext(AuthContext);
	const { classes } = useStyles();
	if (!user) {
		throw new Error('User is not logged in');
	}

	return <Container size="lg"></Container>;
}
