import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`sticky top-0 z-50 w-full transition-all duration-200 ${
				scrolled
					? "border-neutral-200/80 border-b bg-white/85 shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md"
					: "border-transparent border-b bg-white/60 backdrop-blur-sm"
			}`}
		>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo / Brand */}
				<div className="flex items-center">
					<Link to="/" aria-label="Home" className="group flex items-center">
						<LogoMark className="h-5 w-auto text-neutral-950 transition-opacity group-hover:opacity-80" />
					</Link>
				</div>

				{/* Right CTAs */}
				<div className="flex items-center gap-2 sm:gap-3">
					<Link
						to="/login"
						className="rounded-full px-2.5 py-1.5 font-medium text-[13px] text-neutral-600 transition-all hover:text-neutral-950 sm:px-3 sm:text-[13.5px]"
					>
						Sign in
					</Link>
					<a
						href="/login"
						className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 font-medium text-[13px] text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[13.5px]"
					>
						<span>Get started</span>
						<ArrowRight className="h-3.5 w-3.5" />
					</a>
				</div>
			</div>
		</header>
	);
}
