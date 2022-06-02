import AuthContext from '../context/authProvider';
import { useContext } from 'react';
import { Button, Container, Group, Paper, PasswordInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { handleFetchErrorResponse } from '../util/handleError';
import { showNotification } from '@mantine/notifications';

export function ChangePassword() {
	const { user } = useContext(AuthContext);
	const form = useForm({
		initialValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate: {
			oldPassword: (val) => (val.length >= 4 ? null : 'Old password must be at least 4 characters'),
			newPassword: (val) => (val.length >= 4 ? null : 'Password must be at least 4 characters'),
			confirmPassword: (val, values) => (val === values!.newPassword ? null : 'Passwords do not match'),
		},
	});

	if (!user) {
		throw new Error('User is not logged in');
	}

	const handleSubmit = async (values: typeof form.values) => {
		const { oldPassword, newPassword } = values;
		const passwordData = {
			oldPassword,
			newPassword,
		};
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/user/update/password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`,
				},
				body: JSON.stringify(passwordData),
			});
			await handleFetchErrorResponse(response);
			if (response.ok) {
				showNotification({
					message: 'Successfully updated password',
					color: 'green',
				});
			}
		} catch (e) {
			if (!(e instanceof Error)) {
				throw e;
			}
			showNotification(e);
		}
	};

	return (
		<Container size="lg" px={0} mt="md">
			<Title order={2}>Password Settings</Title>
			<Paper withBorder shadow="md" p={30} radius="md" mt="xl">
				<form
					onSubmit={form.onSubmit(async (values) => {
						console.log(values);
						await handleSubmit(values);
					})}
				>
					<PasswordInput
						mt="md"
						required
						label="Old Password"
						autoComplete="current-password"
						{...form.getInputProps('oldPassword')}
					/>
					<PasswordInput
						mt="md"
						required
						label="New Password"
						autoComplete="new-password"
						{...form.getInputProps('newPassword')}
					/>
					<PasswordInput
						mt="md"
						required
						label="Confirm Password"
						autoComplete="new-password"
						{...form.getInputProps('confirmPassword')}
					/>

					<Group position="center" mt="md">
						<Button type="submit">Save</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
