'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
	/** Runs the copy (clipboard write + any toast). Should resolve when done. */
	onCopy: () => void | Promise<void>;
	/** Visible label (omit for icon-only). */
	label?: string;
	'aria-label': string;
	disabled?: boolean;
	className?: string;
	variant?: React.ComponentProps<typeof Button>['variant'];
	size?: React.ComponentProps<typeof Button>['size'];
}

const FEEDBACK_MS = 1500;

/**
 * Copy button that swaps its icon to a checkmark for ~1.5s after a successful
 * copy, giving immediate inline confirmation on top of the toast. The timer is
 * cleaned up on unmount so a fast unmount can't setState on a dead component.
 */
export function CopyButton({
	onCopy,
	label,
	disabled,
	className,
	variant = 'outline',
	size,
	...rest
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const handleClick = async () => {
		await onCopy();
		setCopied(true);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setCopied(false), FEEDBACK_MS);
	};

	const Icon = copied ? Check : Copy;

	return (
		<Button
			variant={variant}
			size={size ?? (label ? undefined : 'icon')}
			onClick={handleClick}
			disabled={disabled}
			aria-label={rest['aria-label']}
			className={className}
		>
			<Icon className={cn('h-4 w-4', copied && 'text-success', label && 'mr-2')} />
			{label}
		</Button>
	);
}
