'use client';

import { useTranslations } from 'next-intl';
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
 * stays aligned. Labels come from `Page.tokens.models.{id}` for i18n.
 */
export function TokenModelPicker({ value, onChange }: TokenModelPickerProps) {
	const t = useTranslations('Page.tokens');
	return (
		<Select
			value={value}
			onValueChange={(v) => v && onChange(v as TokenModelId)}
		>
			<SelectTrigger
				className="h-7 w-[150px] text-xs"
				aria-label={t('tokenizerAriaLabel')}
			>
				<SelectValue placeholder={t('tokenizerPlaceholder')} />
			</SelectTrigger>
			<SelectContent>
				{TOKEN_MODELS.map((m) => (
					<SelectItem
						key={m.id}
						value={m.id}
						className="text-xs"
					>
						{t(`models.${m.id}`)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
