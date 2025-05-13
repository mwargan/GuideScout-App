import { ZodError } from "zod";
import { AxiosError } from "axios";

export const handleError = (error: unknown): Record<string, unknown> => {
  if (error instanceof ZodError) {
    // Show the fields with errors
    return error.flatten().fieldErrors;
  }

  if (error instanceof AxiosError) {
    // Show the fields with errors
    return error.response?.data?.errors;
  }

  return {
    message: "Unknown error",
    error,
  };
};
