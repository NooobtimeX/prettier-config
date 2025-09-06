"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
	const t = useTranslations("Footer");
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 mt-auto w-full border-t backdrop-blur">
			<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{/* Brand Section */}
					<div className="space-y-4 md:col-span-2 lg:col-span-1">
						<div className="flex items-center space-x-2">
							<Image
								src="/favicon.ico"
								alt={t("brand.alt")}
								width={32}
								height={32}
								className="rounded-md"
							/>
							<span className="text-lg font-bold">{t("brand.name")}</span>
						</div>
						<p className="text-muted-foreground max-w-sm text-sm">
							{t("brand.description")}
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t("quickLinks.title")}</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="#generator"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t("quickLinks.generator")}
								</Link>
							</li>
							<li>
								<Link
									href="/docs"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t("quickLinks.docs")}
								</Link>
							</li>
							<li>
								<Link
									href="#faq"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t("quickLinks.faq")}
								</Link>
							</li>
							<li>
								<Link
									href="#why-prettier"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{t("quickLinks.whyPrettier")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t("resources.title")}</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="https://prettier.io/docs/en/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
								>
									{t("resources.docs")}
									<ExternalLink className="h-3 w-3" />
								</Link>
							</li>
							<li>
								<Link
									href="https://prettier.io/docs/en/configuration.html"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
								>
									{t("resources.configurationGuide")}
									<ExternalLink className="h-3 w-3" />
								</Link>
							</li>
							<li>
								<Link
									href="https://prettier.io/playground/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
								>
									{t("resources.playground")}
									<ExternalLink className="h-3 w-3" />
								</Link>
							</li>
						</ul>
					</div>

					{/* Developer */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t("developer.title")}</h3>
						<div className="space-y-3">
							<div className="text-sm">
								<p className="text-muted-foreground">
									{t("developer.createdBy")}
								</p>
								<Link
									href="https://nooobtimex.me"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
								>
									Wongsaphat Puangsorn
									<ExternalLink className="h-3 w-3" />
								</Link>
							</div>
							<Link
								href="https://github.com/nooobtimex/prettier-config.dev"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
							>
								<Github className="h-4 w-4" />
								{t("developer.viewOnGitHub")}
							</Link>
						</div>
					</div>
				</div>

				{/* Separator */}
				<div className="my-8 border-t" />

				{/* Bottom Section */}
				<div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8">
					<div className="text-muted-foreground flex flex-col space-y-2 text-sm sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
						<p>
							© {currentYear} {t("bottom.copyright")}
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
