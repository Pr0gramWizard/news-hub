import { Button, Center, Container, createStyles, Group, Paper, Select, Title } from '@mantine/core';
import React, { useContext } from 'react';
import AuthContext from '../../context/authProvider';
import { showNotification } from '@mantine/notifications';

const useStyles = createStyles((theme) => ({
	title: {
		marginBottom: '2%',
	},
	paper: {
		padding: theme.spacing.lg,
		margin: theme.spacing.lg,
		height: 100,
		alignItems: 'center',
		verticalAlign: 'middle',
	},
}));

export function AdminExport() {
	const { user, setUser } = useContext(AuthContext);
	if (!user) {
		throw new Error('User is not logged in');
	}
	const { classes } = useStyles();
	const [selectedExportType, setSelectedExportType] = React.useState('');
	const selectData = [
		{
			value: 'json',
			label: 'JSON',
		},
		{
			value: 'csv',
			label: 'CSV',
		},
	];
	return (
		<Container size="lg">
			<div className={classes.title}>
				<Title>Export</Title>
			</div>

			<Paper className={classes.paper}>
				<Center>
					<Group align="center">
						<Select
							placeholder="Select Export Type"
							data={selectData}
							onChange={(value) => {
								setSelectedExportType(value || '');
							}}
						/>
						<Button
							size="sm"
							disabled={!selectedExportType}
							onClick={async () => {
								const response = await fetch(
									`${import.meta.env.VITE_API_URL}/tweet/export/${selectedExportType}`,
									{
										method: 'GET',
										headers: {
											'Content-Type': 'application/json',
											Authorization: `Bearer ${user.token}`,
										},
									},
								);
								if (response.status === 403) {
									setUser(undefined);
									return;
								}
								const data = await response.blob();
								const url = window.URL.createObjectURL(data);
								const link = document.createElement('a');
								link.href = url;
								link.setAttribute('download', `tweets.${selectedExportType}`);
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
								showNotification({
									message: 'Export Successful',
									color: 'green',
								});
							}}
						>
							Export
						</Button>
					</Group>
				</Center>
			</Paper>
		</Container>
	);
}
