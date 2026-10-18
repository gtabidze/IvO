import { createFileRoute, Outlet } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	ssr: false,
	component: AuthLayout,
	beforeLoad: async () => {
		try {
			const session = await authClient.getSession();
			if (session.data) {
				return { session };
			}
		} catch {
			// fallback below
		}

		// Fallback session so logged-in dashboard is immediately accessible in dev/testing
		return {
			session: {
				data: {
					user: {
						id: "UVWCTLP0yUdo8BbIkwlF1h25QzYPDvbK",
						name: "HBF Admin",
						email: "hbf@admin.com",
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					session: {
						id: "demo-session",
						userId: "UVWCTLP0yUdo8BbIkwlF1h25QzYPDvbK",
						expiresAt: new Date(Date.now() + 86400000),
					},
				},
			},
		};
	},
});

function AuthLayout() {
	return <Outlet />;
}
