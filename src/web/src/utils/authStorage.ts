export interface AuthData {
  access_token: string;
  email: string;
}

export const saveAuthData = (authData: AuthData) => {
  try {
    localStorage.setItem('token', authData.access_token);
    localStorage.setItem('authToken', authData.access_token); // Keep both for compatibility
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('authData', JSON.stringify(authData));
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export const getAuthData = (): AuthData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const getTokenFromCookie = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    return authTokenCookie ? authTokenCookie.split('=')[1] ?? null : null;
  }
  return null;
};

export const getToken = (): string | null => {
  const authData = getAuthData();
  return authData?.access_token || null;
};

export const getUserEmail = (): string | null => {
  const authData = getAuthData();
  return authData?.email || null;
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authData');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};


