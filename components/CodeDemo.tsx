import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CodeDemoProps {
	originalCode: string;
	formattedCode: string;
	isFormatting: boolean;
	formatError: string;
	layout?: "vertical" | "horizontal";
	compact?: boolean;
}

export function CodeDemo({
	originalCode,
	formattedCode,
	isFormatting,
	formatError,
	layout = "vertical",
	compact = false,
}: CodeDemoProps) {
	const copyOriginalCode = async () => {
		await navigator.clipboard.writeText(originalCode);
		toast.success("Original code copied to clipboard!");
	};

	const copyFormattedCode = async () => {
		if (formattedCode) {
			await navigator.clipboard.writeText(formattedCode);
			toast.success("Formatted code copied to clipboard!");
		}
	};

	const containerClass =
		layout === "horizontal" ? "flex flex-col lg:flex-row gap-4" : "space-y-2";

	const sectionClass =
		layout === "horizontal" ? "flex-1 flex flex-col overflow-hidden" : "";

	const codeHeight =
		compact ? "200px"
		: layout === "horizontal" ? "100%"
		: "200px";
	const fontSize = compact ? "0.65rem" : "0.75rem";

	return (
		<div className={containerClass}>
			{/* Before Code */}
			<div className={sectionClass}>
				<div className="mb-2 flex items-center justify-between">
					<h4 className="text-muted-foreground text-xs font-semibold">
						BEFORE (Original)
					</h4>
					<Button size="sm" variant="outline" onClick={copyOriginalCode}>
						<Copy className="mr-1 h-3 w-3" />
						Copy
					</Button>
				</div>
				<div
					className={
						layout === "horizontal" ?
							"flex-1 overflow-auto rounded-md"
						:	"rounded-md"
					}
				>
					<SyntaxHighlighter
						language="javascript"
						style={atomDark}
						customStyle={{
							fontSize,
							borderRadius: "0.375rem",
							margin: 0,
							height: layout === "horizontal" ? "100%" : undefined,
							maxHeight: layout === "horizontal" ? undefined : codeHeight,
						}}
					>
						{originalCode}
					</SyntaxHighlighter>
				</div>
			</div>

			{/* After Code */}
			<div className={sectionClass}>
				<div className="mb-2 flex items-center justify-between">
					<h4 className="text-muted-foreground text-xs font-semibold">
						AFTER (Formatted)
					</h4>
					<Button
						size="sm"
						variant="outline"
						onClick={copyFormattedCode}
						disabled={!formattedCode}
					>
						<Copy className="mr-1 h-3 w-3" />
						Copy
					</Button>
				</div>
				<div
					className={
						layout === "horizontal" ?
							"flex-1 overflow-auto rounded-md"
						:	"rounded-md"
					}
				>
					{isFormatting ?
						<div className="flex h-32 items-center justify-center rounded-md bg-gray-900">
							<div className="text-xs text-white">Formatting...</div>
						</div>
					: formatError ?
						<div className="flex h-32 items-center justify-center rounded-md border border-red-500 bg-red-900/20">
							<div className="p-4 text-center text-xs text-red-400">
								{formatError}
							</div>
						</div>
					: formattedCode ?
						<SyntaxHighlighter
							language="javascript"
							style={atomDark}
							customStyle={{
								fontSize,
								borderRadius: "0.375rem",
								margin: 0,
								height: layout === "horizontal" ? "100%" : undefined,
								maxHeight: layout === "horizontal" ? undefined : undefined,
								minHeight: compact ? "200px" : undefined,
							}}
						>
							{formattedCode}
						</SyntaxHighlighter>
					:	<div className="flex h-32 items-center justify-center rounded-md bg-gray-900">
							<div className="text-xs text-gray-400">
								No formatted code available
							</div>
						</div>
					}
				</div>
			</div>
		</div>
	);
}
