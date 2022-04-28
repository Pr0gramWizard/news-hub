import { Button, Group, Paper, PasswordInput, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { X } from 'tabler-icons-react';
import { TOKEN_STORAGE_KEY } from '../pages/Popup/Popup';

interface AuthenticationFormProps {
	onLogin: () => void;
}

export function AuthenticationForm(props: AuthenticationFormProps) {
	const { onLogin } = props;
	const form = useForm({
		initialValues: {
			email: '',
			password: '',
		},

		validationRules: {
			email: (val: string) => /^\S+@\S+$/.test(val),
		},
	});

	const login = async (values: typeof form.values) => {
		const { email, password } = values;
		try {
			const response = await fetch(`${process.env.API_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});
			const data = await response.json();
			if (response.status === 400) {
				showNotification({
					autoClose: 5000,
					title: 'Something went wrong',
					message: 'Wrong login credentials',
					color: 'red',
					icon: <X />,
				});
			}
			if (response.status === 201 && data.token) {
				localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
				onLogin();
			}
		} catch (e) {
			if (!(e instanceof Error)) {
				throw e;
			}
			showNotification({
				autoClose: 5000,
				title: 'Something went wrong',
				message: e.message || 'Unknown error',
				color: 'red',
				icon: <X />,
			});
		}
	};

	return (
		<Paper radius="md" p="xl" withBorder>
			<Text size="lg" weight={700}>
				Welcome to NewsHub
			</Text>

			<form onSubmit={form.onSubmit(login)}>
				<Group direction="column" grow>
					<TextInput
						required
						label="Email"
						placeholder="user@example.com"
						value={form.values.email}
						onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
						error={form.errors.email && 'Invalid email'}
					/>

					<PasswordInput
						required
						label="Password"
						placeholder="Your password"
						value={form.values.password}
						onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
					/>
				</Group>

				<Group position="center" mt="xl">
					<Button type="submit">{'Login'}</Button>
				</Group>
			</form>
		</Paper>
	);
}
