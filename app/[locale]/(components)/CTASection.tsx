import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CTASection() {
	const t = useTranslations("Home.cta");

	return (
		<section className="bg-primary/5 py-16">
			<div className="container mx-auto px-4 text-center">
				<div className="mx-auto max-w-2xl space-y-6">
					<h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
					<p className="text-muted-foreground text-lg">{t("description")}</p>
					<Link href="/config">
						<Button size="lg" className="px-8 py-6 text-lg">
							{t("button")}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
