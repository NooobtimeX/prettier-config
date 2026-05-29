'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';

/** Shared id so the `Cmd/Ctrl+K` shortcut can focus the search field. */
export const OPTION_SEARCH_INPUT_ID = 'prettier-option-search';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
	const t = useTranslations('Page.search');
	return (
		<div className={className}>
			<div className="relative">
				<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					id={OPTION_SEARCH_INPUT_ID}
					placeholder={placeholder ?? t('placeholder')}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="h-8 pr-10 pl-10"
				/>
				{value ? (
					<button
						onClick={() => onChange('')}
						className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
						aria-label={t('clearSearch')}
					>
						<X className="h-4 w-4" />
					</button>
				) : (
					<Kbd className="absolute top-1/2 right-2 hidden -translate-y-1/2 sm:inline-flex">⌘K</Kbd>
				)}
			</div>
		</div>
	);
}
