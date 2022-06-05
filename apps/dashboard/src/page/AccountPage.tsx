import { Container, createStyles, Title } from '@mantine/core';
import React, { useContext } from 'react';
import AuthContext from '../context/authProvider';
import { BasicInformation } from '../components/BasicInformation';
import { ChangePassword } from '../components/ChangePassword';

const useStyles = createStyles((theme) => ({
	title: {
		marginBottom: '2%',
	},
}));

export function AccountPage() {
	const { user } = useContext(AuthContext);
	const { classes } = useStyles();
	if (!user) {
		throw new Error('User is not logged in');
	}

	return (
		<Container size="lg">
			<div className={classes.title}>
				<Title>Account</Title>
			</div>

			<BasicInformation />
			<ChangePassword />
		</Container>
	);
}
