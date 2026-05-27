'use client';

import { Columns2, Rows3 } from 'lucide-react';
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
								aria-label="Unified diff view"
								aria-pressed={!splitView}
							>
								<Rows3 className="h-3.5 w-3.5" />
							</Button>
						}
					/>
					<TooltipContent>Unified</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant={splitView ? 'default' : 'ghost'}
								size="icon"
								className={cn('h-6 w-6')}
								onClick={() => onChange(true)}
								aria-label="Split diff view"
								aria-pressed={splitView}
							>
								<Columns2 className="h-3.5 w-3.5" />
							</Button>
						}
					/>
					<TooltipContent>Split</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
