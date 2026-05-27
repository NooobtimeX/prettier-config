'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

/**
 * Curated list of Prettier 3.x releases offered by the version picker.
 * `'latest'` is resolved by jsDelivr to the latest 3.x release at load time.
 */
export const PRETTIER_VERSIONS = [
	'latest',
	'3.6.2',
	'3.5.3',
	'3.4.2',
	'3.3.3',
	'3.2.5',
	'3.1.1',
	'3.0.3',
] as const;

export const DEFAULT_PRETTIER_VERSION: (typeof PRETTIER_VERSIONS)[number] = 'latest';

interface VersionPickerProps {
	value: string;
	onChange: (version: string) => void;
	disabled?: boolean;
}

export function VersionPicker({ value, onChange, disabled }: VersionPickerProps) {
	return (
		<Select
			value={value}
			onValueChange={(v) => v && onChange(v)}
			disabled={disabled}
		>
			<SelectTrigger
				className="h-8 w-[130px] text-xs"
				aria-label="Prettier version"
			>
				<SelectValue placeholder="Prettier" />
			</SelectTrigger>
			<SelectContent>
				{PRETTIER_VERSIONS.map((v) => (
					<SelectItem
						key={v}
						value={v}
						className="text-xs"
					>
						{v === 'latest' ? 'Prettier latest' : `Prettier ${v}`}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
