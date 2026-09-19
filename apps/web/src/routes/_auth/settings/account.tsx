import { Button } from "@IvO/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Input } from "@IvO/ui/components/input";
import { Label } from "@IvO/ui/components/label";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Code2,
	CreditCard,
	ShieldAlert,
	SlidersHorizontal,
	User,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { ProfileMetadataModal } from "@/components/dashboard/profile-metadata-modal";
import { RequestContentModal } from "@/components/dashboard/request-content-modal";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/settings/account")({
	component: AccountSettingsPage,
});

type SettingsTab = "account" | "preferences" | "billing" | "team" | "mcp";

function AccountSettingsPage() {
	const navigate = useNavigate();
	const { session } = Route.useRouteContext();

	const [activeTab, setActiveTab] = useState<SettingsTab>("account");

	// Header modal states
	const [pricingOpen, setPricingOpen] = useState(false);
	const [requestContentOpen, setRequestContentOpen] = useState(false);
	const [profileMetadataOpen, setProfileMetadataOpen] = useState(false);

	// User state
	const [name, setName] = useState(session.data?.user.name || "Gua");
	const [email, setEmail] = useState(
		session.data?.user.email || "giotabidze@tbcbank.com.ge",
	);
	const [hasPassword, setHasPassword] = useState(false);

	// Edit modals
	const [editNameOpen, setEditNameOpen] = useState(false);
	const [tempName, setTempName] = useState(name);

	const [editEmailOpen, setEditEmailOpen] = useState(false);
	const [tempEmail, setTempEmail] = useState(email);

	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const handleSaveName = (e: React.FormEvent) => {
		e.preventDefault();
		if (!tempName.trim()) return;
		setName(tempName.trim());
		setEditNameOpen(false);
		toast.success("Name updated successfully");
	};

	const handleSaveEmail = (e: React.FormEvent) => {
		e.preventDefault();
		if (!tempEmail.trim()) return;
		setEmail(tempEmail.trim());
		setEditEmailOpen(false);
		toast.success("Email address updated successfully");
	};

	const handleSavePassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setHasPassword(true);
		setPasswordModalOpen(false);
		setNewPassword("");
		setConfirmPassword("");
		toast.success("Password created successfully");
	};

	const handleLogoutEverywhere = () => {
		toast.success("Logged out on all devices", {
			description: "Active sessions have been revoked.",
		});
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate({ to: "/" }),
			},
		});
	};

	const handleDeleteAccount = () => {
		setDeleteModalOpen(false);
		toast.error("Account scheduled for deletion", {
			description:
				"Your IvO account and data will be permanently purged in 14 days.",
		});
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate({ to: "/" }),
			},
		});
	};

	return (
		<div className="flex min-h-screen w-full flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
			{/* Persistent Header */}
			<DashboardHeader
				activeTab="apps"
				onTabChange={(_tab) => {
					navigate({ to: "/dashboard" });
				}}
				searchQuery=""
				onSearchChange={() => {}}
				onOpenPricing={() => setPricingOpen(true)}
				onOpenRequestContent={() => setRequestContentOpen(true)}
				onOpenProfileMetadata={() => setProfileMetadataOpen(true)}
			/>

			{/* Main Settings Body */}
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr] md:gap-16">
					{/* Left Sidebar Navigation */}
					<nav className="flex flex-row gap-1 overflow-x-auto pb-4 md:flex-col md:pb-0">
						<button
							type="button"
							onClick={() => setActiveTab("account")}
							className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
								activeTab === "account"
									? "bg-neutral-100/70 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white"
							}`}
						>
							<User className="h-4 w-4" />
							<span>Account</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("preferences")}
							className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
								activeTab === "preferences"
									? "bg-neutral-100/70 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white"
							}`}
						>
							<SlidersHorizontal className="h-4 w-4" />
							<span>Preferences</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("billing")}
							className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
								activeTab === "billing"
									? "bg-neutral-100/70 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white"
							}`}
						>
							<CreditCard className="h-4 w-4" />
							<span>Plan &amp; Billing</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("team")}
							className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
								activeTab === "team"
									? "bg-neutral-100/70 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white"
							}`}
						>
							<Users className="h-4 w-4" />
							<span>Team</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab("mcp")}
							className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
								activeTab === "mcp"
									? "bg-neutral-100/70 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white"
									: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-white"
							}`}
						>
							<div className="flex items-center gap-2.5">
								<Code2 className="h-4 w-4" />
								<span>MCP</span>
							</div>
							<span className="rounded-full bg-neutral-950 px-1.5 py-0.2 font-bold text-[9px] text-white dark:bg-white dark:text-neutral-950">
								PRO
							</span>
						</button>
					</nav>

					{/* Right Content Area */}
					<main className="max-w-2xl">
						{activeTab === "account" && (
							<div>
								{/* Large Avatar Placeholder */}
								<div className="flex items-center gap-4">
									<div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 font-medium text-3xl text-neutral-600 sm:h-24 sm:w-24 dark:bg-neutral-800 dark:text-neutral-300">
										{name.charAt(0).toUpperCase()}
									</div>
								</div>

								{/* Name & Email Headline */}
								<div className="mt-5">
									<h1 className="font-bold text-2xl text-neutral-950 tracking-tight dark:text-white">
										{name}
									</h1>
									<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
										{email}
									</p>
								</div>

								{/* Section 1: Personal Details */}
								<div className="mt-10">
									<h2 className="font-bold text-neutral-950 text-sm tracking-tight dark:text-white">
										Personal details
									</h2>

									<div className="mt-4 divide-y divide-neutral-100 border-neutral-100 border-t dark:divide-neutral-800 dark:border-neutral-800">
										{/* Row 1: Name */}
										<div className="flex items-center justify-between py-4">
											<div>
												<div className="font-medium text-neutral-900 text-xs dark:text-white">
													Name
												</div>
												<div className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
													{name}
												</div>
											</div>
											<button
												type="button"
												onClick={() => {
													setTempName(name);
													setEditNameOpen(true);
												}}
												className="cursor-pointer font-medium text-neutral-700 text-xs hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
											>
												Edit
											</button>
										</div>

										{/* Row 2: Email */}
										<div className="flex items-center justify-between py-4">
											<div>
												<div className="font-medium text-neutral-900 text-xs dark:text-white">
													Email address
												</div>
												<div className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
													{email}
												</div>
											</div>
											<button
												type="button"
												onClick={() => {
													setTempEmail(email);
													setEditEmailOpen(true);
												}}
												className="cursor-pointer font-medium text-neutral-700 text-xs hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
											>
												Edit
											</button>
										</div>

										{/* Row 3: Password */}
										<div className="flex items-center justify-between py-4">
											<div>
												<div className="font-medium text-neutral-900 text-xs dark:text-white">
													Password
												</div>
												<div className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
													{hasPassword ? "••••••••••••" : "No password yet"}
												</div>
											</div>
											<button
												type="button"
												onClick={() => setPasswordModalOpen(true)}
												className="cursor-pointer font-medium text-neutral-700 text-xs hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
											>
												{hasPassword ? "Change" : "Create new"}
											</button>
										</div>
									</div>
								</div>

								{/* Section 2: Manage Account */}
								<div className="mt-12">
									<h2 className="font-bold text-neutral-950 text-sm tracking-tight dark:text-white">
										Manage account
									</h2>

									<div className="mt-4 divide-y divide-neutral-100 border-neutral-100 border-t dark:divide-neutral-800 dark:border-neutral-800">
										{/* Row 1: Log out everywhere */}
										<div className="flex items-center justify-between py-4">
											<div>
												<div className="font-medium text-neutral-900 text-xs dark:text-white">
													Log out everywhere
												</div>
												<div className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
													You will be logged out on all devices.
												</div>
											</div>
											<button
												type="button"
												onClick={handleLogoutEverywhere}
												className="cursor-pointer font-medium text-neutral-700 text-xs hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
											>
												Log out
											</button>
										</div>

										{/* Row 2: Delete account */}
										<div className="flex items-center justify-between py-4">
											<div>
												<div className="font-medium text-neutral-900 text-xs dark:text-white">
													Delete account
												</div>
												<div className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
													Permanently delete your IvO account.
												</div>
											</div>
											<button
												type="button"
												onClick={() => setDeleteModalOpen(true)}
												className="cursor-pointer font-semibold text-red-600 text-xs hover:text-red-700"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "preferences" && (
							<div className="space-y-6">
								<div>
									<h2 className="font-bold text-base text-neutral-950 dark:text-white">
										Preferences
									</h2>
									<p className="mt-1 text-neutral-500 text-xs">
										Control display theme, accessibility options, and
										notification frequency.
									</p>
								</div>

								<div className="space-y-4 pt-4">
									<div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
										<h3 className="font-medium text-neutral-900 text-xs dark:text-white">
											Interface Theme
										</h3>
										<div className="mt-3 flex gap-2">
											{["System", "Light", "Dark"].map((mode) => (
												<button
													key={mode}
													type="button"
													onClick={() => toast.success(`Theme set to ${mode}`)}
													className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 font-medium text-xs hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
												>
													{mode}
												</button>
											))}
										</div>
									</div>

									<div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
										<h3 className="font-medium text-neutral-900 text-xs dark:text-white">
											Weekly UX Benchmark Digest
										</h3>
										<p className="mt-1 text-neutral-500 text-xs">
											Receive newly teardown flows and friction analyses every
											Monday.
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === "billing" && (
							<div className="space-y-6">
								<div>
									<h2 className="font-bold text-base text-neutral-950 dark:text-white">
										Plan &amp; Billing
									</h2>
									<p className="mt-1 text-neutral-500 text-xs">
										Manage your subscription, invoices, and billing details.
									</p>
								</div>

								<div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 dark:border-neutral-800 dark:bg-neutral-900/40">
									<div className="flex items-center justify-between">
										<div>
											<span className="rounded-full bg-neutral-200 px-2 py-0.5 font-bold text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
												Current Plan
											</span>
											<h3 className="mt-2 font-bold text-lg text-neutral-950 dark:text-white">
												Free Starter
											</h3>
											<p className="mt-1 text-neutral-500 text-xs">
												Access to 4 latest flows and standard teardown screens.
											</p>
										</div>

										<Button
											type="button"
											onClick={() => setPricingOpen(true)}
											className="rounded-full bg-neutral-950 px-5 py-2 font-semibold text-white text-xs shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
										>
											Upgrade to Pro
										</Button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "team" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="font-bold text-base text-neutral-950 dark:text-white">
											Team Members
										</h2>
										<p className="mt-1 text-neutral-500 text-xs">
											Collaborate with designers and engineers on teardowns.
										</p>
									</div>
									<Button
										type="button"
										onClick={() =>
											toast.info("Team feature requires Pro or Team Plan")
										}
										className="rounded-full bg-neutral-950 text-white text-xs"
									>
										Invite member
									</Button>
								</div>

								<div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
									<div className="flex items-center justify-between p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 font-bold text-white text-xs">
												{name.charAt(0)}
											</div>
											<div>
												<div className="font-semibold text-xs">
													{name} (You)
												</div>
												<div className="text-[11px] text-neutral-500">
													{email}
												</div>
											</div>
										</div>
										<span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
											Owner
										</span>
									</div>
								</div>
							</div>
						)}

						{activeTab === "mcp" && (
							<div className="space-y-6">
								<div>
									<div className="flex items-center gap-2">
										<h2 className="font-bold text-base text-neutral-950 dark:text-white">
											Model Context Protocol (MCP)
										</h2>
										<span className="rounded-full bg-neutral-950 px-2 py-0.5 font-bold text-[10px] text-white dark:bg-white dark:text-neutral-950">
											PRO
										</span>
									</div>
									<p className="mt-1 text-neutral-500 text-xs">
										Connect IvO's 663,962 screens directly into Claude Desktop,
										Cursor, and Antigravity IDE.
									</p>
								</div>

								<div className="rounded-2xl border border-neutral-200 bg-neutral-950 p-5 font-mono text-neutral-200 text-xs dark:border-neutral-800">
									<div className="text-neutral-400">
										{/* Claude Desktop Config (claude_desktop_config.json) */}
									</div>
									<pre className="mt-3 overflow-x-auto text-[11px] text-emerald-400 leading-relaxed">
										{`{
  "mcpServers": {
    "ivo": {
      "command": "npx",
      "args": ["-y", "@ivo/mcp-server@latest"],
      "env": {
        "IVO_API_KEY": "ivo_live_9a8f7c6e5d4b3a2"
      }
    }
  }
}`}
									</pre>
								</div>
							</div>
						)}
					</main>
				</div>
			</div>

			{/* Edit Name Modal */}
			<Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
				<DialogPopup className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle>Edit Name</DialogTitle>
						<DialogDescription>
							Enter your full name as it will appear in comments and shared
							flows.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSaveName} className="mt-4 space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="name-input">Full Name</Label>
							<Input
								id="name-input"
								value={tempName}
								onChange={(e) => setTempName(e.target.value)}
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditNameOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</DialogPopup>
			</Dialog>

			{/* Edit Email Modal */}
			<Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
				<DialogPopup className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle>Edit Email Address</DialogTitle>
						<DialogDescription>
							Enter the new email address for your IvO account.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSaveEmail} className="mt-4 space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email-input">Email</Label>
							<Input
								id="email-input"
								type="email"
								value={tempEmail}
								onChange={(e) => setTempEmail(e.target.value)}
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditEmailOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</DialogPopup>
			</Dialog>

			{/* Create Password Modal */}
			<Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
				<DialogPopup className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<DialogTitle>Create Password</DialogTitle>
						<DialogDescription>
							Set a password with at least 8 characters to secure your account.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSavePassword} className="mt-4 space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="pwd-input">New Password</Label>
							<Input
								id="pwd-input"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Minimum 8 characters"
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="pwd-confirm">Confirm Password</Label>
							<Input
								id="pwd-confirm"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Repeat new password"
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setPasswordModalOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Set Password</Button>
						</DialogFooter>
					</form>
				</DialogPopup>
			</Dialog>

			{/* Delete Account Confirmation Modal */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogPopup className="max-w-md rounded-3xl p-6">
					<DialogHeader>
						<div className="flex items-center gap-2 text-red-600">
							<ShieldAlert className="h-5 w-5" />
							<DialogTitle className="text-red-600">Delete Account</DialogTitle>
						</div>
						<DialogDescription>
							Are you sure you want to permanently delete your IvO account? This
							action cannot be undone and will delete all your saved flows,
							collections, and comments.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteAccount}
						>
							Delete Account
						</Button>
					</DialogFooter>
				</DialogPopup>
			</Dialog>

			{/* Shared Modals */}
			<PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
			<RequestContentModal
				open={requestContentOpen}
				onOpenChange={setRequestContentOpen}
			/>
			<ProfileMetadataModal
				open={profileMetadataOpen}
				onOpenChange={setProfileMetadataOpen}
			/>
		</div>
	);
}
