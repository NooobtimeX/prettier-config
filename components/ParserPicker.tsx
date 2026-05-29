'use client';

import { useTranslations } from 'next-intl';
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
 * Prettier parser used to format the input in the Your Code tab. Labels come
 * from `Page.parserPicker.parsers.{id}` so the parser names follow the user's
 * locale (technical names like "TypeScript" stay un-translated by convention).
 */
export function ParserPicker({ value, onChange, autoDetected }: ParserPickerProps) {
	const t = useTranslations('Page.parserPicker');
	return (
		<Select
			value={value}
			onValueChange={(v) => v && onChange(v as ParserId)}
		>
			<SelectTrigger
				className="h-7 w-[150px] text-xs"
				aria-label={t('ariaLabel')}
			>
				<SelectValue placeholder={t('placeholder')} />
				{autoDetected && (
					<span className="text-muted-foreground/70 ml-1 text-[10px]">{t('autoHint')}</span>
				)}
			</SelectTrigger>
			<SelectContent>
				{PARSERS.map((p) => (
					<SelectItem
						key={p.id}
						value={p.id}
						className="text-xs"
					>
						{t(`parsers.${p.id}`)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
