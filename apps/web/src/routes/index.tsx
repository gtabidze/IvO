import { createFileRoute } from "@tanstack/react-router";
import AuditTeardown from "@/components/landing/audit-teardown";
import BenchmarksSection from "@/components/landing/benchmarks-section";
import DarkVaultSection from "@/components/landing/dark-vault-section";
import FAQSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import LogoTicker from "@/components/landing/logo-ticker";
import Navbar from "@/components/landing/navbar";
import PricingSection from "@/components/landing/pricing-section";
import StickyShowcase from "@/components/landing/sticky-showcase";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="w-full flex-1">
				<Hero />
				<LogoTicker />
				<StickyShowcase />
				<BenchmarksSection />
				<DarkVaultSection />
				<AuditTeardown />
				<PricingSection />
				<FAQSection />
			</main>
			<Footer />
		</div>
	);
}
