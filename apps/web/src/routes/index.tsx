import { createFileRoute } from "@tanstack/react-router";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import HeroDemo from "@/components/landing/hero-demo";
import LandingShowcase from "@/components/landing/landing-showcase";
import Navbar from "@/components/landing/navbar";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Navbar />
			<main className="w-full flex-1">
				<Hero />
				<HeroDemo />
				<LandingShowcase />
			</main>
			<Footer />
		</div>
	);
}
