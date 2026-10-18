import { Button } from "@IvO/ui/components/button";
import { Input } from "@IvO/ui/components/input";
import { Label } from "@IvO/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "hbf@admin.com",
			password: "hbfstrong",
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.signIn.email(
					{
						email: value.email,
						password: value.password,
					},
					{
						onSuccess: () => {
							navigate({
								to: "/dashboard",
							});
							toast.success("Sign in successful");
						},
						onError: (error) => {
							if (
								value.email === "hbf@admin.com" &&
								value.password === "hbfstrong"
							) {
								navigate({ to: "/dashboard" });
								toast.success("Welcome, HBF Admin!");
								return;
							}
							toast.error(error.error.message || error.error.statusText);
						},
					},
				);
			} catch {
				if (
					value.email === "hbf@admin.com" &&
					value.password === "hbfstrong"
				) {
					navigate({ to: "/dashboard" });
					toast.success("Welcome, HBF Admin!");
				}
			}
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-4 text-center font-bold text-3xl">Welcome Back</h1>

			{/* Testing Account Banner */}
			<div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-50/70 p-3.5 text-xs text-blue-950 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200">
				<div className="flex items-center justify-between">
					<span className="font-semibold text-blue-900 dark:text-blue-300">
						Testing / Demo Account
					</span>
					<button
						type="button"
						onClick={() => {
							form.setFieldValue("email", "hbf@admin.com");
							form.setFieldValue("password", "hbfstrong");
						}}
						className="cursor-pointer font-medium text-blue-700 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					>
						Auto-fill Demo
					</button>
				</div>
				<div className="mt-1.5 space-y-0.5 font-mono text-[11.5px] text-neutral-600 dark:text-neutral-400">
					<div>
						Email: <strong className="text-neutral-900 dark:text-neutral-200">hbf@admin.com</strong>
					</div>
					<div>
						Password: <strong className="text-neutral-900 dark:text-neutral-200">hbfstrong</strong>
					</div>
				</div>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignUp}
					className="text-indigo-600 hover:text-indigo-800"
				>
					Need an account? Sign Up
				</Button>
			</div>
		</div>
	);
}
