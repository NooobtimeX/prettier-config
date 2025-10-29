"use client";

import { Github } from "lucide-react";
import ThemeChanger from "@/components/ButtonThemeChanger";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { REPOSITORY } from "@/common/constants";

interface HeaderProps {
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
}

export default function Header({}: HeaderProps) {
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
				</div>
			</div>
		</header>
	);
}
