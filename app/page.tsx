"use client";

import { useState, useEffect, useMemo } from "react";
import options from "@/lib/options";
import { generateConfig } from "@/lib/generateConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrettierOption } from "@/components/PrettierOption";
import { GeneratedModal } from "@/components/GeneratedModal";
import { RotateCcw, FilePlus, Search, X, Github } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
// ✨ Added: Imports for the AlertDialog component from shadcn/ui
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ThemeChanger from "@/components/ButtonThemeChanger";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import FAQ from "@/components/section/FAQ";
import WhyPrettierConfigGenerator from "@/components/section/WhyPrettierConfigGenerator";

type PrettierOptionKey = (typeof options)[number]["key"];
type SelectedOptions = {
	[key in PrettierOptionKey]: string | number | boolean | string[] | null;
};

export default function PrettierConfigPage() {
	const emptyConfig = Object.fromEntries(
		options.map((opt) => [opt.key, null])
	) as SelectedOptions;

	const [selected, setSelected] = useState<SelectedOptions>(emptyConfig);
	const [showConfig, setShowConfig] = useState(false);
	const [generatedConfig, setGeneratedConfig] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [showTooltip, setShowTooltip] = useState<boolean | undefined>(
		undefined
	);
	// ✨ Added: State to manage the visibility of the reset confirmation dialog
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

	useEffect(() => {
		setShowTooltip(true);
		const timer = setTimeout(() => setShowTooltip(undefined), 10000);
		return () => clearTimeout(timer);
	}, []);

	const filteredOptions = useMemo(() => {
		if (!searchQuery.trim()) return options;

		const query = searchQuery.toLowerCase();
		return options.filter((option) => {
			if (option.name.toLowerCase().includes(query)) return true;
			if (option.description.toLowerCase().includes(query)) return true;
			return false;
		});
	}, [searchQuery]);

	const handleChange = (
		key: keyof SelectedOptions,
		value: string | number | boolean | string[] | null
	) => {
		setSelected((prev) => ({ ...prev, [key]: value }));
	};

	const handleGenerate = () => {
		const config = generateConfig(selected);
		setGeneratedConfig(config);
		setShowConfig(true);
	};

	// ✨ Updated: This function now contains the original reset logic.
	// It is called when the user confirms the action in the dialog.
	const executeReset = () => {
		setSelected(emptyConfig);
		setGeneratedConfig("");
		setShowConfig(false);
		setSearchQuery("");
	};

	return (
		<div>
			<header
				className={cn(
					"border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
				)}
			>
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
						{/* Search Bar - Hidden on small screens, visible on medium and up */}
						<div className="hidden max-w-md flex-1 md:block">
							<div className="relative">
								<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									placeholder="Search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pr-10 pl-10"
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery("")}
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
			</header>

			<main className="mx-auto p-4">
				{/* Search Bar - Visible on small screens only */}
				<section id="generator" className="mx-auto mb-4 max-w-md md:hidden">
					<div className="relative">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							placeholder="Search options, descriptions, values..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pr-10 pl-10"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
								aria-label="Clear search"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				</section>

				{/* Search results indicator */}
				{searchQuery && (
					<div className="text-muted-foreground mb-4 text-center text-sm">
						Found {filteredOptions.length} of {options.length} options
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{filteredOptions.map((opt) => (
						<PrettierOption
							key={opt.key}
							option={opt}
							value={selected[opt.key]}
							onChange={(val) => handleChange(opt.key, val)}
						/>
					))}
				</div>

				{searchQuery && filteredOptions.length === 0 && (
					<div className="py-12 text-center">
						<div className="text-muted-foreground mb-2 text-lg">
							No options found
						</div>
						<div className="text-muted-foreground text-sm">
							Try searching for different terms or{" "}
							<button
								onClick={() => setSearchQuery("")}
								className="text-primary hover:underline"
							>
								clear your search
							</button>
						</div>
					</div>
				)}

				<TooltipProvider>
					<div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
						<Tooltip open={showTooltip}>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="default"
									className="h-12 w-12 rounded-full shadow-md"
									onClick={handleGenerate}
									aria-label="Generate Config"
								>
									<FilePlus className="h-5 w-5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left" sideOffset={8}>
								Generate Config
							</TooltipContent>
						</Tooltip>

						<Tooltip open={showTooltip}>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="secondary"
									className="h-12 w-12 rounded-full shadow-md"
									onClick={() => setIsResetDialogOpen(true)}
									aria-label="Reset Config"
								>
									<RotateCcw className="h-5 w-5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left" sideOffset={8}>
								Reset Selections
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>

				<GeneratedModal
					open={showConfig}
					config={generatedConfig}
					onClose={() => setShowConfig(false)}
				/>

				{/* ✨ Added: The AlertDialog component for reset confirmation */}
				<AlertDialog
					open={isResetDialogOpen}
					onOpenChange={setIsResetDialogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will clear all your selected
								options and reset the generator to its initial state.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={executeReset}>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<WhyPrettierConfigGenerator />
				<FAQ />
			</main>
		</div>
	);
}
