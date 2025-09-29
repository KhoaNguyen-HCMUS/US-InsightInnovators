export async function request<TBody extends object, TResp>(
	method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE",
	path: string,
	body?: TBody
): Promise<TResp> {
	const API_BASE = (import.meta as any).env?.VITE_API_URL || "";
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
	const json = await res.json();
	return json as TResp;
}


