"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import options from "@/lib/options";
import { Button } from "@/components/ui/button";
import { PrettierOption } from "@/components/PrettierOption";
import { ConfigModal } from "@/components/ConfigModal";
import { DemoModal } from "@/components/DemoModal";
import { ConfigAside } from "@/components/ConfigAside";
import { RotateCcw, FilePlus, Play } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Footer } from "@/components/section/Footer";
import Header from "@/components/section/Header";

// Type-safe keys from options
type OptionKey = (typeof options)[number]["key"];
type OptionValue = string | number | boolean | string[] | null;
type SelectedOptions = {
	[key in OptionKey]: OptionValue;
};

// Sample code to format - covers most Prettier options
const SAMPLE_CODE = `const user={name:"John",age:30,active:true,hobbies:["coding","reading"]};
const greeting=user.active?\`Hello \${user.name}!\`:"Inactive user";
function process(data){const result=data.filter(item=>item.active).map(item=>({...item,name:item.name.toUpperCase(),}));return result;}
const users=[{id:1,name:"Alice",active:true},{id:2,name:"Bob",active:false}];
export{user,greeting,process};`;

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

// Code formatter hook
function useCodeFormatter(config: string, shouldFormat: boolean = true) {
	const [formattedCode, setFormattedCode] = useState("");
	const [isFormatting, setIsFormatting] = useState(false);
	const [formatError, setFormatError] = useState("");

	const formatCode = useCallback(async () => {
		console.log("formatCode: Starting format with config:", config);
		setIsFormatting(true);
		setFormatError("");

		try {
			// Parse the config
			const prettierOptions = config ? JSON.parse(config) : {};
			console.log("formatCode: Using options:", prettierOptions);

			// Call the API to format the code
			const response = await fetch("/api/format", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: SAMPLE_CODE,
					options: prettierOptions,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to format code");
			}

			const { formatted } = await response.json();
			console.log("formatCode: Successfully formatted code");
			setFormattedCode(formatted);
		} catch (err) {
			console.error("formatCode: Error occurred:", err);
			console.error("Config used:", config);
			setFormatError("Failed to format code. Please check your configuration.");
			setFormattedCode("");
		} finally {
			console.log(
				"formatCode: Finished formatting, setting isFormatting to false"
			);
			setIsFormatting(false);
		}
	}, [config]);

	// Auto-format when config changes and should format
	useEffect(() => {
		if (shouldFormat && config) {
			formatCode();
		}
	}, [config, shouldFormat, formatCode]);

	return {
		formattedCode,
		isFormatting,
		formatError,
		formatCode,
		originalCode: SAMPLE_CODE,
	};
}

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
	const [showDemoModal, setShowDemoModal] = useState(false);
	const [isLargeScreen, setIsLargeScreen] = useState(false);

	// Use the code formatter hook
	const { formatCode, originalCode, formattedCode, isFormatting, formatError } =
		useCodeFormatter(generatedConfig, false);

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

	const handleChange = (
		key: keyof SelectedOptions,
		value: string | number | boolean | string[] | null
	) => {
		setSelected((prev) => {
			const newSelected = { ...prev, [key]: value };

			// Auto-generate config for large screens in real-time
			if (isLargeScreen) {
				const config = generateConfig(newSelected);
				setGeneratedConfig(config);
			}

			return newSelected;
		});
	};

	const handleGenerate = () => {
		const config = generateConfig(selected);
		setGeneratedConfig(config);
		if (!isLargeScreen) {
			setShowConfig(true);
		}
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
								Found {filteredOptions.length} of {options.length} options
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
												aria-label="Generate Config"
											>
												<FilePlus className="h-5 w-5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="left" sideOffset={8}>
											Generate Config
										</TooltipContent>
									</Tooltip>

									{/* Demo Button - only show when has config */}
									{hasSelectedOptions && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													size="icon"
													className="h-12 w-12 rounded-full shadow-md"
													onClick={() => setShowDemoModal(true)}
													aria-label="See Demo"
												>
													<Play className="h-5 w-5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent side="left" sideOffset={8}>
												See Demo
											</TooltipContent>
										</Tooltip>
									)}

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
						)}

						<ConfigModal
							open={showConfig}
							config={generatedConfig}
							onClose={() => setShowConfig(false)}
						/>

						{/* Demo Modal - for small screens */}
						<DemoModal
							open={showDemoModal}
							config={generatedConfig}
							onClose={() => setShowDemoModal(false)}
							formatCode={formatCode}
							originalCode={originalCode}
							formattedCode={formattedCode}
							isFormatting={isFormatting}
							formatError={formatError}
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
										This action cannot be undone. This will clear all your
										selected options and reset the generator to its initial
										state.
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
							formatCode={formatCode}
							originalCode={originalCode}
							formattedCode={formattedCode}
							isFormatting={isFormatting}
							formatError={formatError}
						/>
					</aside>
				)}
			</div>
		</div>
	);
}
