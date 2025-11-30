const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'http://localhost:8888';
  }

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:8888';
  }

  return '';
};

export const config = {
  apiUrl: getApiUrl(),
};

export const slugs = {
  customersApi: "customersApi",
  superApi: "superApi",
}