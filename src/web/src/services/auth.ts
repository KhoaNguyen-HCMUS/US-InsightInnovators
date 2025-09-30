export interface RegisterRequest {
	email: string;
	password: string;
	confirmPassword: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthUser {
	id: string;
	email: string;
	created_at: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	data?: { user: AuthUser, token: string };
}

import { request } from '../utils/api';
import { saveAuthData } from '../utils/authStorage';

export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
	return await request<RegisterRequest, AuthResponse>("POST", "/api/auth/register", payload);
};

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
	const resp = await request<LoginRequest, AuthResponse>("POST", "/api/auth/login", payload);
	if (resp.success) {
		saveAuthData({
			access_token: resp.data?.token as string,
			email: resp.data?.user.email as string,
		});
	}
	return resp;
};