"use client";

import { useState, useEffect } from "react";
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
import { Copy, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { toast } from "sonner";
import { sortConfig, type SortOrder } from "@/lib/sortConfig";

interface ConfigModalProps {
	open: boolean;
	config: string;
	onClose: () => void;
}

export function ConfigModal({ open, config, onClose }: ConfigModalProps) {
	const [isMobile, setIsMobile] = useState(false);
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [displayConfig, setDisplayConfig] = useState(config);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Sort the config based on selected order - using shared utility
	useEffect(() => {
		setDisplayConfig(sortConfig(config, sortOrder));
	}, [config, sortOrder]);

	const copyToClipboard = async () => {
		if (displayConfig) {
			await navigator.clipboard.writeText(displayConfig);
			toast.success("Config copied to clipboard!");
		}
	};

	const content = (
		<div className="space-y-4">
			{/* Sort Controls */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-sm font-medium">
						Sort:
					</span>
					<Button
						variant={sortOrder === "asc" ? "default" : "outline"}
						size="sm"
						onClick={() => setSortOrder("asc")}
						className="text-xs"
					>
						<ArrowDownAZ className="mr-1 h-3 w-3" />
						A-Z
					</Button>
					<Button
						variant={sortOrder === "desc" ? "default" : "outline"}
						size="sm"
						onClick={() => setSortOrder("desc")}
						className="text-xs"
					>
						<ArrowUpAZ className="mr-1 h-3 w-3" />
						Z-A
					</Button>
				</div>
				<Button onClick={copyToClipboard} size="sm" disabled={!displayConfig}>
					<Copy className="mr-2 h-4 w-4" />
					Copy
				</Button>
			</div>

			{/* Config Display */}
			{displayConfig && (
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
			)}

			<p className="text-muted-foreground text-center text-xs">
				Copy and paste this into .prettierrc file.
			</p>
		</div>
	);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onClose}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Prettier Configuration</DrawerTitle>
					</DrawerHeader>
					<div className="p-4">{content}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>Prettier Configuration</DialogTitle>
				</DialogHeader>
				<div className="overflow-auto">{content}</div>
			</DialogContent>
		</Dialog>
	);
}
