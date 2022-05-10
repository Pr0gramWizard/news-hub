import { X } from "tabler-icons-react";

interface ServerErrorResponse {
  message: string;
  status: number;
}

interface ErrorObject {
  message: string;
  autoClose?: number | boolean;
  icon?: React.ReactNode;
  title: string;
  color: string;
}

class TriggerNotificationError extends Error {
  message: string;
  autoClose?: number | boolean;
  icon?: React.ReactNode;
  title: string;
  color: string;
  constructor(public error: ErrorObject) {
    super(error.message);
    this.message = error.message;
    this.autoClose = error.autoClose;
    this.icon = error.icon;
    this.title = error.title;
    this.color = error.color;
  }
}

export async function handleFetchErrorResponse(
  errorResponse: Response
): Promise<void> {
  const statusCodeAsString = errorResponse.status.toString();

  // Skip if no error was returned by the server
  if (
    !(statusCodeAsString.startsWith("4") || statusCodeAsString.startsWith("5"))
  ) {
    return;
  }
  const errorMessage = (await errorResponse.json()) as ServerErrorResponse;

  const errorObject: ErrorObject = {
    message: errorMessage.message,
    autoClose: 5000,
    icon: <X size={24} />,
    color: "red",
    title: "Something went wrong",
  };
  // Handle client errors
  if (statusCodeAsString.startsWith("4")) {
    errorObject.title = "Client error";
  }

  // Handle server errors
  if (statusCodeAsString.startsWith("5")) {
    let message = `${errorMessage.message}`;
    if (import.meta.env.MODE === "production") {
      message = "An error occurred on the server";
    }
    errorObject.message = message;
    errorObject.title = "Server error";
  }
  // Throw error to stop the execution of the function
  throw new TriggerNotificationError(errorObject);
}
