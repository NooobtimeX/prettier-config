'use client';

import { Columns2, Rows3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DiffViewToggleProps {
	splitView: boolean;
	onChange: (splitView: boolean) => void;
}

/**
 * Compact segmented toggle for Unified vs Split diff layouts, designed to sit
 * inline in a panel header next to the version picker — no popover needed.
 */
export function DiffViewToggle({ splitView, onChange }: DiffViewToggleProps) {
	const t = useTranslations('Page.diff');
	return (
		<TooltipProvider>
			<div className="bg-muted/40 inline-flex items-center gap-0.5 rounded-md border p-0.5">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant={splitView ? 'ghost' : 'default'}
								size="icon"
								className={cn('h-6 w-6')}
								onClick={() => onChange(false)}
								aria-label={t('unifiedAria')}
								aria-pressed={!splitView}
							>
								<Rows3 className="h-3.5 w-3.5" />
							</Button>
						}
					/>
					<TooltipContent>{t('unifiedTooltip')}</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant={splitView ? 'default' : 'ghost'}
								size="icon"
								className={cn('h-6 w-6')}
								onClick={() => onChange(true)}
								aria-label={t('splitAria')}
								aria-pressed={splitView}
							>
								<Columns2 className="h-3.5 w-3.5" />
							</Button>
						}
					/>
					<TooltipContent>{t('splitTooltip')}</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
