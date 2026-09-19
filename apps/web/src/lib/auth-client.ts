import { createAuthClient } from "better-auth/react";

import { ENV } from "../env";

const getAuthBaseUrl = () => {
	const raw = ENV.VITE_SERVER_URL || "";
	if (typeof window !== "undefined") {
		if (raw.startsWith("http://") || raw.startsWith("https://")) {
			return raw;
		}
		return `${window.location.origin}${raw ? (raw.startsWith("/") ? raw : `/${raw}`) : ""}`;
	}
	if (raw.startsWith("http://") || raw.startsWith("https://")) {
		return raw;
	}
	return `http://localhost:3000${raw ? (raw.startsWith("/") ? raw : `/${raw}`) : ""}`;
};

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
});
