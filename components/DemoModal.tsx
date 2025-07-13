"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CodeDemo } from "@/components/CodeDemo";

interface DemoModalProps {
	open: boolean;
	onClose: () => void;
	config: string;
	// Code formatter props
	formatCode: () => Promise<void>;
	originalCode: string;
	formattedCode: string;
	isFormatting: boolean;
	formatError: string;
}

export function DemoModal({
	open,
	onClose,
	originalCode,
	formattedCode,
	isFormatting,
	formatError,
}: DemoModalProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>Prettier Formatting Demo</DialogTitle>
				</DialogHeader>
				<div className="overflow-auto">
					<CodeDemo
						originalCode={originalCode}
						formattedCode={formattedCode}
						isFormatting={isFormatting}
						formatError={formatError}
						layout="horizontal"
						compact={true}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
