import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Zap, Settings, Search, Copy, FileText, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FeaturesSection() {
	const t = useTranslations("Home.features");

	const features = [
		{
			icon: Zap,
			title: "realtime.title",
			description: "realtime.description",
			iconClass: "rounded-lg",
		},
		{
			icon: Settings,
			title: "interactive.title",
			description: "interactive.description",
			iconClass: "",
		},
		{
			icon: Search,
			title: "search.title",
			description: "search.description",
			iconClass: "rounded-lg",
		},
		{
			icon: Copy,
			title: "copy.title",
			description: "copy.description",
			iconClass: "rounded-lg",
		},
		{
			icon: FileText,
			title: "validation.title",
			description: "validation.description",
			iconClass: "rounded-lg",
		},
		{
			icon: Palette,
			title: "design.title",
			description: "design.description",
			iconClass: "rounded-lg",
		},
	];

	return (
		<section className="bg-muted/30 py-16">
			<div className="container mx-auto px-4">
				<div className="mb-12 space-y-4 text-center">
					<h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
						{t("subtitle")}
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<Card
								className="border-border transition-shadow hover:shadow-lg"
								key={feature.title}
							>
								<CardHeader>
									<div
										className={`bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center ${feature.iconClass}`}
									>
										<Icon className="text-primary h-6 w-6" />
									</div>
									<CardTitle>{t(feature.title)}</CardTitle>
									<CardDescription>{t(feature.description)}</CardDescription>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
