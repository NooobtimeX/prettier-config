"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { Copy, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { toast } from "sonner";

export function GeneratedModal({
	open,
	config,
	onClose,
}: {
	open: boolean;
	config: string;
	onClose: () => void;
}) {
	const [isMobile, setIsMobile] = useState(false);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [displayConfig, setDisplayConfig] = useState(config);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Sort the config based on selected order
	useEffect(() => {
		try {
			const parsedConfig = JSON.parse(config);
			let sortedConfig: Record<string, unknown>;

			if (sortOrder === "asc") {
				// Sort keys A-Z
				const sortedKeys = Object.keys(parsedConfig).sort();
				sortedConfig = sortedKeys.reduce(
					(acc, key) => {
						acc[key] = parsedConfig[key];
						return acc;
					},
					{} as Record<string, unknown>
				);
			} else if (sortOrder === "desc") {
				// Sort keys Z-A
				const sortedKeys = Object.keys(parsedConfig).sort().reverse();
				sortedConfig = sortedKeys.reduce(
					(acc, key) => {
						acc[key] = parsedConfig[key];
						return acc;
					},
					{} as Record<string, unknown>
				);
			} else {
				// Original order
				sortedConfig = parsedConfig;
			}

			setDisplayConfig(JSON.stringify(sortedConfig, null, 2));
		} catch {
			// If JSON parsing fails, use original config
			setDisplayConfig(config);
		}
	}, [config, sortOrder]);

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(displayConfig);
		toast.success("Copied to clipboard!");
	};

	const Content = (
		<>
			{/* Sort Controls */}
			<div className="flex flex-wrap items-center justify-end gap-2">
				<span className="text-muted-foreground text-sm font-medium">Sort:</span>
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

			<div className="max-h-[300px] overflow-auto rounded-md">
				<SyntaxHighlighter
					language="json"
					style={atomDark}
					customStyle={{ fontSize: "0.875rem", borderRadius: "0.375rem" }}
				>
					{displayConfig}
				</SyntaxHighlighter>
			</div>

			<p className="text-muted-foreground mb-1 text-center text-sm">
				Copy and paste this into <code>.prettierrc</code> file.
			</p>

			<div className="flex flex-wrap justify-end gap-2">
				<Button variant="outline" onClick={copyToClipboard} aria-label="Copy">
					<Copy className="mr-2 h-4 w-4" />
					Copy
				</Button>
			</div>
		</>
	);

	return isMobile ?
			<Drawer open={open} onOpenChange={onClose}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle className="text-center">
							Generated Prettier Config
						</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 pb-4">{Content}</div>
				</DrawerContent>
			</Drawer>
		:	<Dialog open={open} onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-center">
							Generated Prettier Config
						</DialogTitle>
					</DialogHeader>
					{Content}
				</DialogContent>
			</Dialog>;
}
