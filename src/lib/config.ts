const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'http://localhost:3001';
  }
  
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:3001';
  }
  
  return '';
};

export const config = {
  apiUrl: getApiUrl(),
};


export const slugs={
  publicApi: "publicApi",
  customersApi: "customersApi",
  superApi: "superApi",
}