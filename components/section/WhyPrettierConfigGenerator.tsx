import { Card, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming shadcn/ui Card component path
// Import your desired React icons here, for example:
// import { FiSettings, FiCheckCircle, FiClock, FiMinimize } from "react-icons/fi"; // Example import from 'react-icons/fi'

interface Feature {
	title: string;
	// icon: React.ReactNode; // Uncomment and use this if you want to pass icon components directly in the features array
}

const features: Feature[] = [
	{
		title: "Simplified Configuration ⚙️", // Placeholder for icon. Replace emoji with actual React icon component.
	},
	{
		title: "Enhanced Consistency ✅", // Placeholder for icon. Replace emoji with actual React icon component.
	},
	{
		title: "Time-Saving Automation ⏱️", // Placeholder for icon. Replace emoji with actual React icon component.
	},
	{
		title: "Reduced Errors 🐛", // Placeholder for icon. Replace emoji with actual React icon component.
	},
];

export default function WhyPrettierConfigGenerator() {
	return (
		<section id="why-prettier" className="mx-auto py-8">
			<div className="mb-4 text-center">
				<h2 className="mb-4 text-4xl font-bold">
					Why Prettier Config Generator?
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{features.map((feature, index) => (
					<Card key={index} className="flex h-full flex-col justify-between">
						<CardHeader className="flex flex-col items-center text-center">
							<CardTitle className="text-xl">{feature.title}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>
		</section>
	);
}
