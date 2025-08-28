"use client";

import Header from "./(components)/Header";
import Footer from "./(components)/Footer";
import HeroSection from "./(components)/HeroSection";
import FeaturesSection from "./(components)/FeaturesSection";
import TechStackSection from "./(components)/TechStackSection";
import CTASection from "./(components)/CTASection";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<div className="bg-background border-border/40 sticky top-0 z-40 rounded-b-3xl border-b px-2 py-2">
				<Header />
			</div>

			{/* Main Content */}
			<main className="flex-1">
				{/* Hero Section */}
				<HeroSection />

				{/* Features Section */}
				<FeaturesSection />

				{/* Tech Stack Section */}
				<TechStackSection />

				{/* CTA Section */}
				<CTASection />
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}
