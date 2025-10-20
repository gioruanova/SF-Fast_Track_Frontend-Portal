// Función helper para obtener la configuración de manera segura
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // En el servidor, usar valores por defecto seguros
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'http://localhost:3001';
  }
  
  // En el cliente, usar los valores del entorno
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:3001';
  }
  
  // En producción, usar rutas relativas (Vercel maneja los rewrites)
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