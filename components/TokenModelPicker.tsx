'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { TOKEN_MODELS, type TokenModelId } from '@/lib/tokenizers';

interface TokenModelPickerProps {
	value: TokenModelId;
	onChange: (model: TokenModelId) => void;
}

/**
 * Compact dropdown for picking which tokenizer drives the `N → M tokens`
 * badge in the diff header. Same h-8 height as `VersionPicker` so the strip
 * stays aligned.
 */
export function TokenModelPicker({ value, onChange }: TokenModelPickerProps) {
	return (
		<Select
			value={value}
			onValueChange={(v) => v && onChange(v as TokenModelId)}
		>
			<SelectTrigger
				className="h-7 w-[150px] text-xs"
				aria-label="Tokenizer model"
			>
				<SelectValue placeholder="Tokenizer" />
			</SelectTrigger>
			<SelectContent>
				{TOKEN_MODELS.map((m) => (
					<SelectItem
						key={m.id}
						value={m.id}
						className="text-xs"
					>
						{m.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
