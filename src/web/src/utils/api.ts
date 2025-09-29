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

export async function requestAuth<TResp, TBody extends object = never>(
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
	path: string,
	body?: TBody
): Promise<TResp> {
	const API_BASE = (import.meta).env?.VITE_API_URL || "";
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
		body: body ? JSON.stringify(body) : undefined,
	});
	const json = await res.json();
	return json as TResp;
}
