import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (id: string) => {
		setMobileMenuOpen(false);
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
		}
	};

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
				<div className="flex items-center gap-8">
					<Link to="/" className="group flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 font-bold font-mono text-white text-xs tracking-tighter shadow-sm transition-colors group-hover:bg-blue-600">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								role="img"
								aria-label="IvO Telemetry Logo"
								xmlns="http://www.w3.org/2000/svg"
								className="text-white"
							>
								<title>IvO Telemetry Logo</title>
								<circle
									cx="12"
									cy="12"
									r="9"
									stroke="currentColor"
									strokeWidth="2"
									strokeDasharray="3 3"
								/>
								<circle cx="12" cy="12" r="3" fill="currentColor" />
								<path
									d="M4 12H9"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<path
									d="M15 12H20"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</div>
						<div className="flex flex-col">
							<span className="flex items-center gap-1.5 font-semibold text-base text-neutral-950 tracking-tight">
								IvO
								<span className="rounded-full border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 font-medium font-mono text-[10px] text-blue-700 tracking-normal">
									Finance+
								</span>
							</span>
							<span className="-mt-0.5 font-medium text-[10px] text-neutral-700 tracking-tight">
								Intent V. Outcome
							</span>
						</div>
					</Link>

					{/* Desktop Navigation Links */}
					<nav className="hidden items-center gap-6 font-medium text-[13.5px] text-neutral-600 md:flex">
						<a
							href="#directory"
							className="flex items-center gap-1 transition-colors hover:text-neutral-950"
						>
							Directory
							<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
						</a>
						<a
							href="#observability"
							className="transition-colors hover:text-neutral-950"
						>
							Observability
						</a>
						<a
							href="#evals"
							className="transition-colors hover:text-neutral-950"
						>
							UX Evals
						</a>
						<a
							href="#studio"
							className="flex items-center gap-1 transition-colors hover:text-neutral-950"
						>
							Studio Audits
						</a>
						<a
							href="#benchmarks"
							className="transition-colors hover:text-neutral-950"
						>
							Benchmarks
						</a>
						<a
							href="#pricing"
							className="transition-colors hover:text-neutral-950"
						>
							Pricing
						</a>
					</nav>
				</div>

				{/* Right CTAs */}
				<div className="hidden items-center gap-3 sm:flex">
					<Link
						to="/login"
						className="rounded-md px-3 py-1.5 font-medium text-[13.5px] text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-950"
					>
						Sign in
					</Link>
					<a
						href="#studio"
						className="inline-flex items-center gap-1.5 rounded-full bg-[#0052ff] px-4 py-2 font-medium text-[13.5px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:bg-[#0047e0] hover:shadow-[0_4px_12px_rgba(0,82,255,0.25)] active:scale-[0.98]"
					>
						<span>Request Audit</span>
						<ArrowRight className="h-3.5 w-3.5" />
					</a>
				</div>

				{/* Mobile Hamburger Button */}
				<div className="flex items-center gap-2 md:hidden">
					<a
						href="#studio"
						className="rounded-full bg-[#0052ff] px-3 py-1.5 font-medium text-white text-xs"
					>
						Request Audit
					</a>
					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="rounded-md p-2 text-neutral-600 hover:text-neutral-900"
						aria-label="Toggle Navigation Menu"
					>
						{mobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Dropdown Menu */}
			{mobileMenuOpen && (
				<div className="space-y-3 border-neutral-200 border-b bg-white/95 px-4 pt-3 pb-6 backdrop-blur-xl md:hidden">
					<button
						type="button"
						onClick={() => scrollToSection("directory")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						Directory (Finance+)
					</button>
					<button
						type="button"
						onClick={() => scrollToSection("observability")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						Observability &amp; Telemetry
					</button>
					<button
						type="button"
						onClick={() => scrollToSection("evals")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						UX Evals
					</button>
					<button
						type="button"
						onClick={() => scrollToSection("studio")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						Studio Audits
					</button>
					<button
						type="button"
						onClick={() => scrollToSection("benchmarks")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						Benchmarks
					</button>
					<button
						type="button"
						onClick={() => scrollToSection("pricing")}
						className="block w-full py-1 text-left font-medium text-neutral-800 text-sm hover:text-neutral-950"
					>
						Pricing
					</button>
					<div className="flex flex-col gap-2 border-neutral-100 border-t pt-3">
						<Link
							to="/login"
							className="rounded-lg border border-neutral-200 py-2 text-center font-medium text-neutral-700 text-sm"
						>
							Sign in
						</Link>
						<button
							type="button"
							onClick={() => scrollToSection("studio")}
							className="rounded-lg bg-[#0052ff] py-2 text-center font-medium text-sm text-white"
						>
							Book a Studio Usability Audit
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
