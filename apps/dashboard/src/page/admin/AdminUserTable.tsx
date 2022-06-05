import { Badge, Box, Center, Loader, MantineColor, Menu, ScrollArea, Table, Text } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/authProvider';
import CenteredTableHeader from '../../components/CenteredTableHeader';
import { Trash } from 'tabler-icons-react';
import { useModals } from '@mantine/modals';
import { handleFetchErrorResponse } from '../../util/handleError';
import { showNotification } from '@mantine/notifications';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt: Date;
	updatedAt: Date;
	numberOfCollectedTweets: number;
}

export function AdminUserTable() {
	const { user, setUser } = useContext(AuthContext);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const modals = useModals();

	const getRoleBadgeColor = (role: string): MantineColor => {
		switch (role) {
			case 'admin':
				return 'grape';
			case 'user':
				return 'primary';
			case 'super_admin':
				return 'red';
			default:
				return 'grey';
		}
	};

	const fetchUsers = async () => {
		if (!user) {
			throw new Error('User is not logged in');
		}
		const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${user.token}`,
				ContentType: 'application/json',
			},
		});
		if (response.status === 403) {
			setUser(undefined);
			return;
		}
		const data = await response.json();
		setUsers(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<Box>
			{loading ? (
				<Center sx={{ height: '100vh' }}>
					<Loader />
				</Center>
			) : (
				<ScrollArea>
					<Table highlightOnHover>
						<thead>
							<tr>
								<CenteredTableHeader>ID</CenteredTableHeader>
								<CenteredTableHeader>Name</CenteredTableHeader>
								<CenteredTableHeader>Email</CenteredTableHeader>
								<CenteredTableHeader>Role</CenteredTableHeader>
								<CenteredTableHeader>Number of Collected Tweets</CenteredTableHeader>
								<CenteredTableHeader>Created At</CenteredTableHeader>
								<CenteredTableHeader>Updated At</CenteredTableHeader>
								<CenteredTableHeader>Actions</CenteredTableHeader>
							</tr>
						</thead>
						<tbody>
							{users.map((row) => (
								<tr key={row.id} style={{ cursor: 'pointer', textAlign: 'center' }}>
									<td>{row.id}</td>
									<td>{row.name}</td>
									<td>{row.email}</td>
									<td>
										<Badge color={getRoleBadgeColor(row.role.toLowerCase())} variant="filled">
											{row.role}
										</Badge>
									</td>
									<td>{row.numberOfCollectedTweets.toLocaleString('de-DE')}</td>
									<td>{new Date(row.createdAt).toLocaleString('de-DE')}</td>
									<td>{new Date(row.updatedAt).toLocaleString('de-DE')}</td>
									<td>
										<Menu>
											<Menu.Item
												icon={<Trash size={14} />}
												onClick={() => {
													modals.openConfirmModal({
														title: `Delete account ${row.id}`,
														centered: true,
														children: (
															<Text size="sm">
																Are you sure you want to delete {row.name}'s profile.
																This action cannot be undone.
															</Text>
														),
														labels: {
															confirm: 'Delete account',
															cancel: 'Cancel',
														},
														confirmProps: { color: 'red' },
														onConfirm: async () => {
															try {
																const response = await fetch(
																	`${import.meta.env.VITE_API_URL}/user/${row.id}`,
																	{
																		method: 'DELETE',
																		headers: {
																			Authorization: `Bearer ${user!.token}`,
																			ContentType: 'application/json',
																		},
																	},
																);
																await handleFetchErrorResponse(response);
																showNotification({
																	message: 'Account deleted',
																	color: 'green',
																});
																setUsers(users.filter((user) => user.id !== row.id));
															} catch (e) {
																if (!(e instanceof Error)) {
																	throw e;
																}
																showNotification(e);
															}
														},
													});
												}}
												color="red"
											>
												Delete
											</Menu.Item>
										</Menu>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</ScrollArea>
			)}
		</Box>
	);
}
