import AuthContext from '../context/authProvider';
import { useContext } from 'react';
import { Button, Container, Group, Paper, Select, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { handleFetchErrorResponse } from '../util/handleError';
import { showNotification } from '@mantine/notifications';

export function BasicInformation() {
	const { user } = useContext(AuthContext);
	const form = useForm({
		initialValues: {
			username: user?.name,
			email: user?.email,
			role: user?.role.toLowerCase(),
		},
		validate: {
			email: (value: string | undefined) => value && (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
		},
	});
	if (!user) {
		throw new Error('User is not logged in');
	}

	const handleSubmit = async (values: typeof form.values) => {
		const { username, email } = values;
		const userData = {
			name: username,
			email,
		};
		const response = await fetch(`${import.meta.env.VITE_API_URL}/user/update/basic-info`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${user.token}`,
			},
			body: JSON.stringify(userData),
		});
		await handleFetchErrorResponse(response);
		if (response.ok) {
			showNotification({
				message: 'Successfully updated basic information',
				color: 'green',
			});
		}
	};

	return (
		<Container size="lg" px={0}>
			<Title order={2}>Basic Information</Title>
			<Paper withBorder shadow="md" p={30} radius="md" mt="xl">
				<form
					onSubmit={form.onSubmit(async (values) => {
						await handleSubmit(values);
					})}
				>
					<TextInput required label="Username" {...form.getInputProps('username')} />
					<TextInput
						mt="md"
						required
						label="Email"
						autoComplete="username"
						{...form.getInputProps('email')}
					/>
					<Select
						mt="md"
						disabled
						label="Role"
						data={[
							{ value: 'user', label: 'USER' },
							{ value: 'admin', label: 'ADMIN' },
						]}
						{...form.getInputProps('role')}
					/>
					<Group position="center" mt="md">
						<Button type="submit">Save</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
