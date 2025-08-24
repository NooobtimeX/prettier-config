"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import options from "@/lib/options";
import { Button } from "@/components/ui/button";
import { PrettierOption } from "@/components/PrettierOption";
import { ConfigModal } from "@/components/ConfigModal";
import { ConfigAside } from "@/components/ConfigAside";
import { RotateCcw, FilePlus } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";
import { Footer } from "@/components/section/Footer";
import Header from "@/components/section/Header";

// Type-safe keys from options
type OptionKey = (typeof options)[number]["key"];
type OptionValue = string | number | boolean | string[] | null;
type SelectedOptions = {
	[key in OptionKey]: OptionValue;
};

// Generate config function
function generateConfig(selected: SelectedOptions): string {
	const config: Partial<SelectedOptions> = {};

	for (const [key, value] of Object.entries(selected) as [
		OptionKey,
		OptionValue,
	][]) {
		if (
			value !== null &&
			value !== "" &&
			!(Array.isArray(value) && value.length === 0)
		) {
			config[key] = value;
		}
	}

	return JSON.stringify(config, null, 2);
}

export default function PrettierConfigPage() {
	// The useTranslations hook will use the correct locale context from the provider
	const t = useTranslations("Page");
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
	const [isLargeScreen, setIsLargeScreen] = useState(false);

	const hasSelectedOptions = Object.values(selected).some(
		(value) =>
			value !== null &&
			value !== "" &&
			!(Array.isArray(value) && value.length === 0)
	);

	useEffect(() => {
		const checkScreenSize = () => {
			const newIsLargeScreen = window.innerWidth >= 1024; // lg breakpoint
			setIsLargeScreen(newIsLargeScreen);

			// Auto-generate config when switching to large screen if there are selected options
			if (newIsLargeScreen && !isLargeScreen && hasSelectedOptions) {
				const config = generateConfig(selected);
				setGeneratedConfig(config);
			}
		};
		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);
		return () => window.removeEventListener("resize", checkScreenSize);
	}, [isLargeScreen, hasSelectedOptions, selected]);

	useEffect(() => {
		setShowTooltip(true);
		const timer = setTimeout(() => setShowTooltip(undefined), 10000);
		return () => clearTimeout(timer);
	}, []);

	// Auto-generate config on initial load if large screen and has selections
	useEffect(() => {
		if (isLargeScreen && hasSelectedOptions && !generatedConfig) {
			const config = generateConfig(selected);
			setGeneratedConfig(config);
		}
	}, [isLargeScreen, hasSelectedOptions, selected, generatedConfig]);

	const filteredOptions = useMemo(() => {
		if (!searchQuery.trim()) return options;

		const query = searchQuery.toLowerCase();
		return options.filter((option) => {
			if (option.name.toLowerCase().includes(query)) return true;
			if (option.description.toLowerCase().includes(query)) return true;
			return false;
		});
	}, [searchQuery]);

	/**
	 * Handles option changes and updates config in real-time for large screens.
	 */
	const handleChange = (key: keyof SelectedOptions, value: OptionValue) => {
		setSelected((prev) => {
			const newSelected = { ...prev, [key]: value };
			if (isLargeScreen) {
				setGeneratedConfig(generateConfig(newSelected));
			}
			return newSelected;
		});
	};

	/**
	 * Generates config and shows modal on small screens.
	 */
	const handleGenerate = () => {
		setGeneratedConfig(generateConfig(selected));
		if (!isLargeScreen) {
			setShowConfig(true);
		}
	};

	/**
	 * Resets all selections and config to initial state.
	 */
	const executeReset = () => {
		setSelected(emptyConfig);
		setGeneratedConfig("");
		setShowConfig(false);
		setSearchQuery("");
	};

	return (
		<div className="flex min-h-screen flex-col">
			{/* Main Content Area with Aside */}
			<div className="flex flex-1">
				{/* Main content area */}
				<main className="flex flex-1 flex-col">
					{/* Header - Sticky at top */}
					<div className="bg-background border-border/40 sticky top-0 z-40 rounded-b-3xl border-b px-2 py-2">
						<Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
					</div>

					{/* Scrollable content container */}
					<div className="flex-1 overflow-auto p-2 md:pr-0">
						{/* Search results indicator */}
						{searchQuery && (
							<div className="text-muted-foreground mb-4 text-center text-sm">
								{t("search.found", {
									count: filteredOptions.length,
									total: options.length,
								})}
							</div>
						)}

						{/* Options Grid */}
						<div
							className={cn(
								"grid grid-cols-1 gap-2 pb-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
							)}
						>
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
									{t("search.noOptions")}
								</div>
								<div className="text-muted-foreground text-sm">
									{t("search.tryOtherTerms")}{" "}
									<button
										onClick={() => setSearchQuery("")}
										className="text-primary hover:underline"
									>
										{t("search.clearSearch")}
									</button>
								</div>
							</div>
						)}

						{/* Floating Action Buttons - Only visible on small screens */}
						{!isLargeScreen && (
							<TooltipProvider>
								<div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
									<Tooltip open={showTooltip}>
										<TooltipTrigger asChild>
											<Button
												size="icon"
												variant="default"
												className="h-12 w-12 rounded-full shadow-md"
												onClick={handleGenerate}
												aria-label={t("fab.generateConfig")}
											>
												<FilePlus className="h-5 w-5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="left" sideOffset={8}>
											{t("fab.generateConfig")}
										</TooltipContent>
									</Tooltip>

									<Tooltip open={showTooltip}>
										<TooltipTrigger asChild>
											<Button
												size="icon"
												variant="secondary"
												className="h-12 w-12 rounded-full shadow-md"
												onClick={() => setIsResetDialogOpen(true)}
												aria-label={t("fab.resetSelections")}
											>
												<RotateCcw className="h-5 w-5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="left" sideOffset={8}>
											{t("fab.resetSelections")}
										</TooltipContent>
									</Tooltip>
								</div>
							</TooltipProvider>
						)}

						<ConfigModal
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
									<AlertDialogTitle>{t("resetDialog.title")}</AlertDialogTitle>
									<AlertDialogDescription>
										{t("resetDialog.description")}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										{t("resetDialog.cancel")}
									</AlertDialogCancel>
									<AlertDialogAction onClick={executeReset}>
										{t("resetDialog.continue")}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						{/* Footer - Full Width */}
						<Footer />
					</div>
				</main>

				{/* Aside Panel - Only visible on large screens */}
				{isLargeScreen && (
					<aside className="sticky top-0 h-screen w-80 flex-shrink-0 self-start px-2 xl:w-96">
						<ConfigAside
							config={generatedConfig}
							onReset={() => setIsResetDialogOpen(true)}
							hasConfig={hasSelectedOptions}
						/>
					</aside>
				)}
			</div>
		</div>
	);
}
