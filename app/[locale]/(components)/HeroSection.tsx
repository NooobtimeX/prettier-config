import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { REPOSITORY } from "@/common/constants";

export default function HeroSection() {
	const t = useTranslations("Home.hero");

	return (
		<section className="container mx-auto px-4 py-16 md:py-24">
			<div className="mx-auto max-w-4xl space-y-6 text-center">
				<div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
					<Star className="h-4 w-4" />
					{t("badge")}
				</div>

				<h1 className="text-4xl font-bold tracking-tight md:text-6xl">
					{t("title")}{" "}
					<span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
						.prettierrc
					</span>{" "}
					{t("titleSuffix")}
				</h1>

				<p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
					{t("description")}
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link href="/config">
						<Button size="lg" className="px-8 py-6 text-lg">
							{t("startButton")}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href={REPOSITORY.GITHUB_URL} target="_blank">
						<Button variant="outline" size="lg" className="px-8 py-6 text-lg">
							<Github className="mr-2 h-5 w-5" />
							{t("githubButton")}
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
