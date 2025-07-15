"use client";

import { useEffect, useState } from "react";
import { Check, Info } from "lucide-react";
import { PrettierOptionType } from "@/interface/PrettierOptionType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
	option: PrettierOptionType;
	value: string | number | boolean | string[] | null;
	onChange: (val: string | number | boolean | string[] | null) => void;
}

export function PrettierOption({ option, value, onChange }: Props) {
	const [open, setOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const selectedValues = Array.isArray(value) ? value : [];
	const selectedCount = selectedValues.length;

	const allOptions =
		Array.isArray(option.options) && option.options.length > 0 ?
			option.options.map((o) => o.toString())
		:	[];

	// Get code examples for the current option
	const codeExamples = option.example || [];

	// Inline component to render code examples
	const renderCodeDemo = (before: string, label: string) => (
		<div>
			<div className="text-center text-xs font-medium">{label}</div>
			<div className="mt-1">
				<SyntaxHighlighter
					language="javascript"
					style={atomDark}
					customStyle={{
						fontSize: "0.65rem",
						borderRadius: "0.25rem",
						margin: 0,
						padding: "0.5rem",
						maxHeight: "120px",
						overflow: "auto",
					}}
				>
					{before}
				</SyntaxHighlighter>
			</div>
		</div>
	);

	// Generate tooltip content based on option type
	const getTooltipContent = () => {
		if (option.type === "buttons" && allOptions.length > 0) {
			// For button options, show examples for each possible value
			return (
				<div className="max-w-md space-y-4">
					{allOptions.map((optionValue) => {
						const example = codeExamples.find(
							(ex) => ex.optionValue === optionValue
						);
						if (example) {
							return (
								<div key={optionValue}>
									{renderCodeDemo(example.before, example.label)}
								</div>
							);
						}
						return null;
					})}
					{codeExamples.length === 0 && (
						<div className="text-muted-foreground text-sm">
							{option.recommend || "No examples available for this option."}
						</div>
					)}
				</div>
			);
		} else if (option.type === "select" && allOptions.length > 0) {
			// For select options, show examples for each possible value
			return (
				<div className="max-w-md space-y-4">
					{allOptions.slice(0, 3).map((optionValue) => {
						const example = codeExamples.find(
							(ex) => ex.optionValue === optionValue
						);
						if (example) {
							return (
								<div key={optionValue}>
									{renderCodeDemo(example.before, example.label)}
								</div>
							);
						}
						return null;
					})}
					{allOptions.length > 3 && (
						<div className="text-muted-foreground text-center text-xs">
							...and {allOptions.length - 3} more options
						</div>
					)}
					{codeExamples.length === 0 && (
						<div className="text-muted-foreground text-sm">
							{option.recommend || "No examples available for this option."}
						</div>
					)}
				</div>
			);
		} else if (option.type === "input") {
			// For input options, show multiple examples with different values
			if (codeExamples.length > 0) {
				return (
					<div className="max-w-md space-y-4">
						{codeExamples.map((example, index) => (
							<div key={index}>
								{renderCodeDemo(example.before, example.label)}
							</div>
						))}
					</div>
				);
			}

			return (
				<div className="text-muted-foreground max-w-xs text-sm">
					{option.recommend ||
						"Enter a value to configure this option. Example values will be shown with live formatting."}
				</div>
			);
		} else if (option.type === "multiselect") {
			return (
				<div className="text-muted-foreground max-w-xs text-sm">
					{option.recommend ||
						"Select multiple options to extend Prettier's functionality."}
				</div>
			);
		}

		return (
			<div className="text-muted-foreground max-w-xs text-sm">
				{option.recommend ||
					"This option modifies how Prettier formats your code."}
			</div>
		);
	};

	const handleToggle = (item: string) => {
		const newSelectedValues =
			selectedValues.includes(item) ?
				selectedValues.filter((v) => v !== item)
			:	[...selectedValues, item];
		onChange(newSelectedValues.length > 0 ? newSelectedValues : []);
	};

	const multiSelectContent = (
		<Command>
			<CommandInput placeholder="Search options..." />
			<CommandList>
				<CommandEmpty>No options found.</CommandEmpty>
				<CommandGroup>
					{allOptions.map((item) => {
						const isSelected = selectedValues.includes(item);
						return (
							<CommandItem
								key={item}
								value={item}
								onSelect={() => handleToggle(item)}
							>
								<Check
									className={`mr-2 h-4 w-4 ${
										isSelected ? "opacity-100" : "opacity-0"
									}`}
								/>
								{item}
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandList>
		</Command>
	);

	return (
		<Card className="relative flex h-full min-h-[100px] flex-col justify-between p-4">
			<div className="absolute top-2 right-2">
				{isMobile ?
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground h-6 w-6"
								aria-label="More information"
							>
								<Info className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>{option.name} - Information</DialogTitle>
							</DialogHeader>
							<div className="max-h-96 overflow-y-auto">
								{getTooltipContent()}
							</div>
						</DialogContent>
					</Dialog>
				:	<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-foreground h-6 w-6"
									aria-label="More information"
								>
									<Info className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left" className="max-w-xs text-sm">
								{getTooltipContent()}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				}
			</div>

			<div>
				<h2 className="mb-1 text-center font-bold">{option.name}</h2>
				<p className="text-muted-foreground mb-2 text-center text-sm">
					{option.description}
				</p>
				{option.since && (
					<div className="flex justify-center">
						<Badge variant="destructive">Since Prettier {option.since}</Badge>
					</div>
				)}
			</div>

			{option.type === "select" ?
				<Select
					value={value?.toString() ?? ""}
					onValueChange={(val) => {
						if (val === "__clear__") {
							onChange(null);
						} else if (option.validate === "boolean") {
							onChange(val === "true");
						} else {
							onChange(val);
						}
					}}
					aria-label={`Select ${option.name}`}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select an option" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="__clear__">
							<em className="text-muted-foreground">Clear Selection</em>
						</SelectItem>
						<SelectSeparator />
						{allOptions.map((o) => (
							<SelectItem key={o} value={o}>
								{o}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			: option.type === "buttons" ?
				<div className="flex flex-wrap gap-2">
					{allOptions.map((o) => {
						// Convert string representation to actual value type
						let actualValue: string | boolean = o;
						if (option.validate === "boolean") {
							actualValue = o === "true";
						}

						return (
							<Button
								key={o}
								variant={value === actualValue ? "default" : "outline"}
								onClick={() =>
									onChange(value === actualValue ? null : actualValue)
								}
								className="flex-1"
								aria-label={o}
							>
								{o}
							</Button>
						);
					})}
				</div>
			: option.type === "multiselect" ?
				isMobile ?
					<Drawer open={open} onOpenChange={setOpen}>
						<DrawerTrigger asChild>
							<Button variant="outline" className="w-full justify-between">
								{selectedCount > 0 ?
									`${selectedCount} selected`
								:	"Select options"}
							</Button>
						</DrawerTrigger>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle className="text-center">{option.name}</DrawerTitle>
							</DrawerHeader>
							<div className="border-t p-4">{multiSelectContent}</div>
						</DrawerContent>
					</Drawer>
				:	<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className="w-full justify-between"
								aria-label={`Select ${option.name}`}
							>
								{selectedCount > 0 ?
									`${selectedCount} selected`
								:	"Select options"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[250px] p-0" align="start">
							{multiSelectContent}
						</PopoverContent>
					</Popover>

			:	<Input
					type={option.validate === "integer" ? "number" : "text"}
					value={value?.toString() ?? ""}
					onChange={(e) =>
						onChange(
							option.validate === "integer" ?
								parseInt(e.target.value || "0", 10)
							:	e.target.value
						)
					}
					placeholder="Enter value"
				/>
			}
		</Card>
	);
}
