import {
  Button,
  ButtonVariant,
  DefaultMantineColor,
  MantineSize,
} from "@mantine/core";
import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  classes?: string;
  color?: DefaultMantineColor;
  size?: MantineSize;
  variant?: ButtonVariant;
}

export function ButtonLink(props: ButtonLinkProps) {
  return (
    <Button<typeof Link>
      className={props.classes}
      size={props.size}
      variant={props.variant}
      color={props.color}
      component={Link}
      to={props.to}
    >
      {props.children}
    </Button>
  );
}
