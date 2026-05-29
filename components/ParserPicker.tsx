'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { PARSERS, type ParserId } from '@/lib/parsers';

interface ParserPickerProps {
	value: ParserId;
	onChange: (parser: ParserId) => void;
	/** Whether the current value came from auto-detect (vs user override). */
	autoDetected?: boolean;
}

/**
 * Compact dropdown matching `VersionPicker`/`TokenModelPicker` — picks the
 * Prettier parser used to format the input in the Your Code tab.
 */
export function ParserPicker({ value, onChange, autoDetected }: ParserPickerProps) {
	return (
		<Select
			value={value}
			onValueChange={(v) => v && onChange(v as ParserId)}
		>
			<SelectTrigger
				className="h-7 w-[150px] text-xs"
				aria-label="Prettier parser"
			>
				<SelectValue placeholder="Parser" />
				{autoDetected && <span className="text-muted-foreground/70 ml-1 text-[10px]">auto</span>}
			</SelectTrigger>
			<SelectContent>
				{PARSERS.map((p) => (
					<SelectItem
						key={p.id}
						value={p.id}
						className="text-xs"
					>
						{p.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
