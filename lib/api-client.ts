import { useAppAuth } from '@/contexts/auth-context';

// Your API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.thriptify.com';

/**
 * Hook for making authenticated API calls
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { apiGet, apiPost } = useApiClient();
 *
 *   const fetchProducts = async () => {
 *     const products = await apiGet('/products');
 *     console.log(products);
 *   };
 *
 *   const createOrder = async (orderData) => {
 *     const order = await apiPost('/orders', orderData);
 *     console.log(order);
 *   };
 * }
 * ```
 */
export function useApiClient() {
  const { getToken, isAuthenticated } = useAppAuth();

  /**
   * Make an authenticated API request
   * Automatically gets a fresh JWT token before each request
   */
  const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    // Get fresh Firebase ID token
    const token = await getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`[API] ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[API] Error ${response.status}:`, error);
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`[API] Response:`, data);
    return data;
  };

  const apiGet = <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  };

  const apiPost = <T = any>(endpoint: string, body: any) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  const apiPut = <T = any>(endpoint: string, body: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  };

  const apiPatch = <T = any>(endpoint: string, body: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  };

  const apiDelete = <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  };

  return {
    apiRequest,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    isAuthenticated,
    getToken,
  };
}

/**
 * Standalone function to get token (for use outside React components)
 *
 * Note: This requires passing getToken from useAppAuth()
 *
 * Usage:
 * ```typescript
 * const { getToken } = useAppAuth();
 * const data = await fetchWithAuth('/products', getToken);
 * ```
 */
export async function fetchWithAuth<T = any>(
  endpoint: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
