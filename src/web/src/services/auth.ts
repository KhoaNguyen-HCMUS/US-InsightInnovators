export interface RegisterRequest {
	full_name: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	data?: {
		access_token: string;
		expires_in: number;
		email: string;
		full_name: string;
	};
}

export const register = async (payload: RegisterRequest) : Promise<AuthResponse> => {
	return {
		success: true,
		message: "Register successful",
		data: {
			access_token: "dummy_access_token",
			expires_in: 3600,
			email: payload.email,
			full_name: payload.full_name,
		},
	};
};

export const login = async (payload: LoginRequest) : Promise<AuthResponse> => {
	if(payload.email === "admin@example.com" && payload.password === "admin") {
		return {
			success: true,
			message: "Login successful",
			data: {
				access_token: "dummy_access_token",
				expires_in: 3600,
				email: payload.email,
				full_name: "Admin User",
			},
		};
	}
	return {
		success: false,
		message: "Login failed",
	};
};