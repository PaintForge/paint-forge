import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "../hooks/useAuth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  withCredentials?: boolean;
  parse?: boolean;
  timeoutMs?: number;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: ApiRequestOptions = {}
): Promise<any> {
  const { withCredentials = true, parse = true, timeoutMs = 10000 } = options;
  const token = getAuthToken();
  
  // Completely block API calls for protected endpoints if no token
  if (!token && (url.includes('/api/paints') || url.includes('/api/projects'))) {
    throw new Error('401: Authentication required');
  }
  
  // Use API base URL from environment or default to relative paths for development
  const apiBase = import.meta.env.VITE_API_BASE || "";
  const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;
  
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    };

    // Only include credentials for authenticated endpoints
    if (withCredentials) {
      fetchOptions.credentials = "include";
    }

    const res = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);

    await throwIfResNotOk(res);

    if (parse) {
      // Parse JSON response
      const text = await res.text();
      const jsonData = text ? JSON.parse(text) : { message: "Request completed successfully." };
      return { data: jsonData, status: res.status };
    }

    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const url = queryKey[0] as string;
    
    // Completely block API calls for protected endpoints if no token
    if (!token && (url.includes('/api/paints') || url.includes('/api/projects'))) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw new Error('401: Authentication required');
    }
    
    // Use API base URL from environment or default to relative paths for development
    const apiBase = import.meta.env.VITE_API_BASE || "";
    const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry on 401 authentication errors
        if (error.message.includes("401") || error.message.includes("Authentication required")) {
          return false;
        }
        // Don't retry on connection errors during development
        if (error.message.includes("Cannot notify while not connected")) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on connection errors during development
        if (error.message.includes("Cannot notify while not connected")) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
