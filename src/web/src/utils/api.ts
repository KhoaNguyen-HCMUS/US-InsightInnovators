import { getToken } from "./authStorage";

export async function request<TBody extends object, TResp>(
	method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE",
	path: string,
	body?: TBody
): Promise<TResp> {
	const API_BASE = (import.meta).env?.VITE_API_URL || "";
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
	const json = await res.json();
	return json as TResp;
}

export const requestAuth = async <TResponse, TRequest = any>(
  method: string,
  endpoint: string,
  data?: TRequest
): Promise<TResponse> => {
  const API_BASE = (import.meta).env?.VITE_API_URL || "";
  
  // Get token from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  console.log('🔐 API Request - Token:', token ? 'Present' : 'Missing');
  console.log('🔐 API Request - Endpoint:', `${API_BASE}${endpoint}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 API Request - Auth header set');
  } else {
    console.warn('⚠️ No authentication token found in localStorage');
  }

  const config: RequestInit = {
    method: method.toUpperCase(),
    headers,
  };

  if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authData');
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📡 API Response data:', result);
    return result;
  } catch (error) {
    console.error(`❌ API request failed (${method} ${endpoint}):`, error);
    throw error;
  }
};
