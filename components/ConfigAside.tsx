import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
	Copy,
	ArrowUpAZ,
	ArrowDownAZ,
	RotateCcw,
	FileText,
	Play,
} from "lucide-react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodeDemo } from "@/components/CodeDemo";
import { sortConfig, type SortOrder } from "@/lib/sortConfig";

interface ConfigAsideProps {
	config: string;
	onReset: () => void;
	hasConfig: boolean;
	// Code formatter props
	formatCode: () => Promise<void>;
	originalCode: string;
	formattedCode: string;
	isFormatting: boolean;
	formatError: string;
}

export function ConfigAside({
	config,
	onReset,
	hasConfig,
	formatCode,
	originalCode,
	formattedCode,
	isFormatting,
	formatError,
}: ConfigAsideProps) {
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [displayConfig, setDisplayConfig] = useState(config);
	const [activeView, setActiveView] = useState<"config" | "demo">("config");

	// Auto-format when switching to demo view or config changes while in demo view
	useEffect(() => {
		if (activeView === "demo") {
			console.log("ConfigAside: Triggering format for demo view");
			formatCode();
		}
	}, [activeView, config, formatCode]);

	// Sort the config based on selected order
	useEffect(() => {
		setDisplayConfig(sortConfig(config, sortOrder));
	}, [config, sortOrder]);

	const copyToClipboard = async () => {
		if (activeView === "config" && displayConfig) {
			await navigator.clipboard.writeText(displayConfig);
			toast.success("Config copied to clipboard!");
		} else if (activeView === "demo" && formattedCode) {
			await navigator.clipboard.writeText(formattedCode);
			toast.success("Formatted code copied to clipboard!");
		}
	};

	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-lg border-l">
			{/* Sticky Header */}
			<div className="bg-background/95 sticky top-0 z-10 shrink-0 rounded-t-lg border-b backdrop-blur">
				<div className="p-2">
					<h2 className="my-4 text-center text-lg font-semibold">
						Prettier Config
					</h2>
				</div>
			</div>

			{/* Scrollable Content Area */}
			<div className="flex min-h-0 flex-1 flex-col overflow-auto">
				{hasConfig && displayConfig ?
					<>
						{/* Sort Controls */}
						<div className="shrink-0 border-b p-2">
							<div className="flex flex-wrap items-center justify-between gap-2">
								{/* Action Buttons */}
								<div className="flex justify-center gap-2">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													size="sm"
													variant="secondary"
													onClick={onReset}
													aria-label="Reset Config"
												>
													<RotateCcw className="mr-2 h-4 w-4" />
													Reset
												</Button>
											</TooltipTrigger>
											<TooltipContent>Reset Selections</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								{/* Sort buttons - only show when viewing config */}
								{activeView === "config" && (
									<div className="flex flex-1 items-center justify-end gap-2">
										<span className="text-muted-foreground text-sm font-medium">
											Sort:
										</span>
										<div className="flex gap-1">
											<Button
												variant={sortOrder === "asc" ? "default" : "outline"}
												size="sm"
												onClick={() => setSortOrder("asc")}
												className="text-xs"
												aria-label="Sort A to Z"
											>
												<ArrowDownAZ className="mr-1 h-3 w-3" />
												A-Z
											</Button>
											<Button
												variant={sortOrder === "desc" ? "default" : "outline"}
												size="sm"
												onClick={() => setSortOrder("desc")}
												className="text-xs"
												aria-label="Sort Z to A"
											>
												<ArrowUpAZ className="mr-1 h-3 w-3" />
												Z-A
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Action Buttons Row */}
						<div className="shrink-0 border-b p-2">
							<div className="flex gap-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												size="sm"
												variant={
													activeView === "config" ? "default" : "outline"
												}
												onClick={() => setActiveView("config")}
												className="flex-1"
												aria-label="View Config"
											>
												<FileText className="mr-2 h-4 w-4" />
												Config
											</Button>
										</TooltipTrigger>
										<TooltipContent>View generated config</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												size="sm"
												variant={activeView === "demo" ? "default" : "outline"}
												onClick={() => setActiveView("demo")}
												className="flex-1"
												aria-label="View Demo"
											>
												<Play className="mr-2 h-4 w-4" />
												Demo
											</Button>
										</TooltipTrigger>
										<TooltipContent>View formatting demo</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>

						{/* Config Display - Scrollable */}
						<div className="min-h-0 flex-1 overflow-auto p-2">
							{activeView === "config" ?
								<div className="rounded-md">
									<SyntaxHighlighter
										language="json"
										style={atomDark}
										customStyle={{
											fontSize: "0.75rem",
											borderRadius: "0.375rem",
											margin: 0,
										}}
									>
										{displayConfig}
									</SyntaxHighlighter>
								</div>
							:	<CodeDemo
									originalCode={originalCode}
									formattedCode={formattedCode}
									isFormatting={isFormatting}
									formatError={formatError}
									layout="vertical"
								/>
							}
						</div>

						<p className="text-muted-foreground shrink-0 px-4 py-2 text-center text-xs">
							{activeView === "config" ?
								"Copy and paste this into .prettierrc file."
							:	"See how your config formats real code."}
						</p>

						{/* Sticky Bottom Copy Button */}
						<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
							<Button
								variant="outline"
								onClick={copyToClipboard}
								aria-label="Copy"
								className="w-full"
								disabled={
									(activeView === "config" && !displayConfig) ||
									(activeView === "demo" && !formattedCode)
								}
							>
								<Copy className="mr-2 h-4 w-4" />
								Copy {activeView === "config" ? "Config" : "Formatted Code"}
							</Button>
						</div>
					</>
				:	<div className="flex flex-1 items-center justify-center p-2">
						<div className="text-muted-foreground text-center">
							<p className="mb-2 text-sm">No config yet</p>
							<p className="text-xs">
								Select options to see your Prettier config appear automatically
							</p>
						</div>
					</div>
				}
			</div>
		</div>
	);
}
