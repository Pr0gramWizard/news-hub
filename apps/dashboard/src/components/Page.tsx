import { AppShell } from "@mantine/core";
import { NavBar } from "./NavBar";

interface PageProps {
  children: React.ReactNode;
}

export function Page(pageProps: PageProps) {
  return (
    <AppShell
      fixed
      padding="md"
      navbar={<NavBar />}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {pageProps.children}
    </AppShell>
  );
}
