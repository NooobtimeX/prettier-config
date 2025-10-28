"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PrettierOptionType } from "@/common/interface/PrettierOptionType";
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

interface Props {
	option: PrettierOptionType;
	value: string | number | boolean | string[] | null;
	onChange: (val: string | number | boolean | string[] | null) => void;
}

export function PrettierOption({ option, value, onChange }: Props) {
	const [open, setOpen] = useState(false);
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
