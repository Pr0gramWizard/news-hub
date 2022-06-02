import { Anchor, Button, Checkbox, Container, Group, Paper, PasswordInput, Text, TextInput } from '@mantine/core';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import React, { useContext } from 'react';
import AuthContext, { LoginResponse } from '../context/authProvider';
import { handleFetchErrorResponse } from '../util/handleError';

async function login(email: string, password: string): Promise<LoginResponse> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email,
			password,
		}),
	});

	await handleFetchErrorResponse(response);
	return response.json();
}

async function register(email: string, password: string, name: string): Promise<LoginResponse> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name,
			email,
			password,
		}),
	});

	await handleFetchErrorResponse(response);
	return response.json();
}

export function LoginPage() {
	const [type, toggle] = useToggle('login', ['login', 'register']);
	const { setUser } = useContext(AuthContext);
	const form = useForm({
		initialValues: {
			email: '',
			name: '',
			password: '',
			confirmPassword: '',
			terms: true,
		},
		validate: {
			email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
			password: (val) => (val.length >= 4 ? null : 'Password must be at least 4 characters'),
			terms: (val) => (val === true ? null : 'You must accept the terms and conditions'),
			confirmPassword: (val, values) =>
				(type === 'register' ? val === values!.password : true) ? null : 'Passwords do not match',
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			const response =
				type === 'login'
					? await login(values.email, values.password)
					: await register(values.email, values.password, values.name);
			setUser(response);
		} catch (e) {
			if (!(e instanceof Error)) {
				throw e;
			}
			showNotification(e);
		}
	};

	return (
		<Container size="xs" px="xs" style={{ marginTop: 100 }}>
			<Paper radius="md" p="xl" withBorder>
				<Text size="lg" weight={500}>
					Welcome to NewsHub, {type} with
				</Text>

				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Group direction="column" grow>
						{type === 'register' && (
							<TextInput label="Name" placeholder="Your name" {...form.getInputProps('name')} />
						)}

						<TextInput
							required
							label="Email"
							placeholder="hello@mantine.dev"
							autoComplete="username"
							{...form.getInputProps('email')}
						/>

						<PasswordInput
							required
							label="Password"
							placeholder="Your password"
							autoComplete={type === 'register' ? 'new-password' : 'current-password'}
							{...form.getInputProps('password')}
						/>

						{type === 'register' && (
							<PasswordInput
								required
								label="Confirm password"
								placeholder="Confirm password"
								autoComplete="new-password"
								{...form.getInputProps('confirmPassword')}
							/>
						)}

						{type === 'register' && (
							<Checkbox label="I accept terms and conditions" {...form.getInputProps('terms')} />
						)}
					</Group>

					<Group position="apart" mt="xl">
						<Anchor component="button" type="button" color="gray" onClick={() => toggle()} size="xs">
							{type === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
						</Anchor>
						<Button type="submit">{upperFirst(type)}</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
