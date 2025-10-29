"use client";

import { useState } from "react";
import { Github, Search, X } from "lucide-react";
import ThemeChanger from "@/components/ButtonThemeChanger";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { REPOSITORY } from "@/common/constants";

interface HeaderProps {
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
}

export default function Header({
	searchQuery = "",
	onSearchChange,
}: HeaderProps) {
	const [internalSearchQuery, setInternalSearchQuery] = useState("");

	// Use external search query if provided, otherwise use internal
	const currentSearchQuery = onSearchChange ? searchQuery : internalSearchQuery;
	const setCurrentSearchQuery =
		onSearchChange ? onSearchChange : setInternalSearchQuery;
	return (
		<header>
			<div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
				{/* Logo and Title */}
				<Link href="/" className="flex items-center space-x-3">
					<Image
						src="/favicon.ico"
						alt="Prettier Config Logo"
						width={32}
						height={32}
						className="h-8 w-8 rounded-md"
					/>
					<h1 className="text-xl font-semibold tracking-tight">
						Prettier Config
					</h1>
				</Link>

				{/* Right-side Actions */}
				<div className="flex items-center gap-4">
					{/* Language Switcher */}
					<LanguageSwitcher />

					{/* Github Repository */}
					<Link href={REPOSITORY.GITHUB_URL}>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							aria-label="Github Repository"
						>
							<Github className="h-4 w-4" />
						</Button>
					</Link>
					{/* Theme Changer */}
					<ThemeChanger />
					{/* Search Bar - Visible on medium screens and up */}
					<div className="hidden max-w-md flex-1 md:block">
						<div className="relative">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Search options, descriptions, values..."
								value={currentSearchQuery}
								onChange={(e) => setCurrentSearchQuery(e.target.value)}
								className="pr-10 pl-10"
							/>
							{currentSearchQuery && (
								<button
									onClick={() => setCurrentSearchQuery("")}
									className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
									aria-label="Clear search"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Search Bar - Visible on small screens only */}
			<div className="border-border border-t px-4 py-3 md:hidden">
				<div className="relative">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder="Search options, descriptions, values..."
						value={currentSearchQuery}
						onChange={(e) => setCurrentSearchQuery(e.target.value)}
						className="pr-10 pl-10"
					/>
					{currentSearchQuery && (
						<button
							onClick={() => setCurrentSearchQuery("")}
							className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>
		</header>
	);
}
