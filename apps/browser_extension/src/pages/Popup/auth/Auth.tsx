import { Button, Group, Paper, PaperProps, PasswordInput, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import React from 'react';

export function AuthenticationForm(props: PaperProps<'div'>) {
	const form = useForm({
		initialValues: {
			email: '',
			name: '',
			password: '',
		},

		validationRules: {
			email: (val: string) => /^\S+@\S+$/.test(val),
			password: (val: string) => val.length >= 6,
		},
	});

	const login = async (values: typeof form.values) => {
		const { email, name, password } = values;
		const response = await fetch(`${process.env.API_URL}auth/login`, {
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
		console.log(data);
	};

	return (
		<Paper radius="md" p="xl" withBorder {...props}>
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
						error={form.errors.password && 'Password should include at least 6 characters'}
					/>
				</Group>

				<Group position="center" mt="xl">
					<Button type="submit">{'Login'}</Button>
				</Group>
			</form>
		</Paper>
	);
}
