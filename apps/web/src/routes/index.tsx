import { createFileRoute } from "@tanstack/react-router";
import AgentStreamMatrix from "@/components/landing/agent-stream-matrix";
import FAQSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
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
				<AgentStreamMatrix />
				<StickyShowcase />
				<FAQSection />
			</main>
			<Footer />
		</div>
	);
}
