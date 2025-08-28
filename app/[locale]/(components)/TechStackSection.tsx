import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function TechStackSection() {
	const t = useTranslations("Home.techStack");

	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="mb-12 space-y-4 text-center">
					<h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
					<p className="text-muted-foreground text-lg">{t("subtitle")}</p>
				</div>

				<div className="flex flex-wrap justify-center gap-4">
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						Next.js 15
					</Badge>
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						TypeScript
					</Badge>
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						Tailwind CSS
					</Badge>
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						shadcn/ui
					</Badge>
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						React 19
					</Badge>
					<Badge variant="secondary" className="px-4 py-2 text-sm">
						Prettier
					</Badge>
				</div>
			</div>
		</section>
	);
}
