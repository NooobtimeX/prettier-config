'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
	return (
		<div className={className}>
			<div className="relative">
				<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					placeholder={placeholder ?? 'Search options, descriptions, values…'}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="h-8 pr-10 pl-10"
				/>
				{value && (
					<button
						onClick={() => onChange('')}
						className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
}
