export const getErrorMessage = (error, fallbackMessage = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0] ||
  error?.message ||
  fallbackMessage;
