import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, ArrowUpAZ, ArrowDownAZ, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { sortConfig, type SortOrder } from "@/lib/sortConfig";
import { useTranslations } from "next-intl";
interface ConfigAsideProps {
	config: string;
	onReset: () => void;
	hasConfig: boolean;
}

export function ConfigAside({ config, onReset, hasConfig }: ConfigAsideProps) {
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [displayConfig, setDisplayConfig] = useState(config);

	// Sort the config based on selected order
	useEffect(() => {
		setDisplayConfig(sortConfig(config, sortOrder));
	}, [config, sortOrder]);

	const copyToClipboard = async () => {
		if (displayConfig) {
			await navigator.clipboard.writeText(displayConfig);
			toast.success("Config copied to clipboard!");
		}
	};
	const t = useTranslations("Page.ConfigAside");

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
								{/* Sort buttons */}
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
							</div>
						</div>

						{/* Config Display - Scrollable */}
						<div className="min-h-0 flex-1 overflow-auto p-2">
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
						</div>

						<p className="text-muted-foreground shrink-0 px-4 py-2 text-center text-xs">
							Copy and paste this into .prettierrc file.
						</p>

						{/* Sticky Bottom Copy Button */}
						<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
							<Button
								variant="outline"
								onClick={copyToClipboard}
								aria-label="Copy"
								className="w-full"
								disabled={!displayConfig}
							>
								<Copy className="mr-2 h-4 w-4" />
								{t("copyConfig")}
							</Button>
						</div>
					</>
				:	<div className="flex flex-1 items-center justify-center p-2">
						<div className="text-muted-foreground text-center">
							<p className="mb-2 text-sm">{t("noConfig")}</p>
							<p className="text-xs">{t("selectOptions")}</p>
						</div>
					</div>
				}
			</div>
		</div>
	);
}
