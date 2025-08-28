"use client";

import { useState, useEffect } from "react";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Github } from "lucide-react";
import ThemeChanger from "@/components/ButtonThemeChanger";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
}

export default function Header({}: HeaderProps) {
	const [showTooltip, setShowTooltip] = useState<boolean | undefined>(
		undefined
	);

	useEffect(() => {
		setShowTooltip(true);
		const timer = setTimeout(() => setShowTooltip(undefined), 10000);
		return () => clearTimeout(timer);
	}, []);
	return (
		<header>
			<div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
				{/* Logo and Title */}
				<Link href="/" className="flex items-center space-x-3">
					<Image
						src="/favicon.ico"
						alt="Prettier Config Generator Logo"
						width={32}
						height={32}
						className="h-8 w-8 rounded-md"
					/>
					<h1 className="text-xl font-semibold tracking-tight">
						Prettier Config Generator
					</h1>
				</Link>

				{/* Right-side Actions */}
				<div className="flex items-center gap-4">
					{/* Github Repository */}
					<TooltipProvider>
						<Tooltip open={showTooltip}>
							<TooltipTrigger asChild>
								<Link href="https://github.com/NooobtimeX/prettier-config-generator">
									<Button
										variant="outline"
										size="icon"
										className="rounded-full"
										aria-label="Github Repository"
									>
										<Github className="h-4 w-4" />
									</Button>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="left" sideOffset={8}>
								Github Repository
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{/* Theme Changer */}
					<TooltipProvider>
						<Tooltip open={showTooltip}>
							<TooltipTrigger asChild>
								<div>
									<ThemeChanger />
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={8}>
								Toggle Theme
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		</header>
	);
}
