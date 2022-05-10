import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { upperFirst, useForm, useToggle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import React from "react";
import { handleFetchErrorResponse } from "../util/handleError";

async function login(email: string, password: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  await handleFetchErrorResponse(response);
  return response.json();
}

async function register(email: string, password: string, name: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  await handleFetchErrorResponse(response);
  return response.json();
}

export function LoginPage() {
  const [type, toggle] = useToggle("login", ["login", "register"]);
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      terms: true,
    },
    validationRules: {
      email: (val) => /^\S+@\S+$/.test(val),
      password: (val) => val.length >= 4,
      terms: (val) => val,
      confirmPassword: (val, values) =>
        type === "register" ? val === values!.password : true,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (type === "login") {
        await login(values.email, values.password);
      } else if (type === "register") {
        await register(values.email, values.password, values.name);
      }
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
            {type === "register" && (
              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) =>
                  form.setFieldValue("name", event.currentTarget.value)
                }
              />
            )}

            <TextInput
              required
              label="Email"
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={
                form.errors.password &&
                "Password should include at least 4 characters"
              }
            />

            {type === "register" && (
              <PasswordInput
                required
                label="Confirm password"
                placeholder="Confirm password"
                value={form.values.confirmPassword}
                onChange={(event) =>
                  form.setFieldValue(
                    "confirmPassword",
                    event.currentTarget.value
                  )
                }
                error={form.errors.confirmPassword && "Passwords did not match"}
              />
            )}

            {type === "register" && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue("terms", event.currentTarget.checked)
                }
              />
            )}
          </Group>

          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              color="gray"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "register"
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit">{upperFirst(type)}</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
