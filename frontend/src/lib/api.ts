export const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for sending/receiving HTTP-only cookies
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    return null; // Return null if response is not JSON
  }
}
