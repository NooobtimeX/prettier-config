'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { VersionConflict } from '@/lib/versionDiff';

interface VersionSwitchWarningDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The version the user is trying to switch TO. */
	targetVersion: string;
	conflicts: VersionConflict[];
	/**
	 * Called when the user confirms. `drop = true` means strip the listed keys
	 * from `selected` entirely (a clean break); `false` means stash them so
	 * they reappear if the user later switches to a version that supports
	 * them again.
	 */
	onConfirm: (drop: boolean) => void;
}

/**
 * Shown before a Prettier version switch when at least one currently-active
 * selection wouldn't carry over cleanly to the target version. Lists the
 * affected keys with a per-key reason ("missing in 3.0", "value 'X' not
 * valid; choices are [...]"), plus a checkbox letting the user opt to also
 * forget those keys from the saved state.
 */
export function VersionSwitchWarningDialog({
	open,
	onOpenChange,
	targetVersion,
	conflicts,
	onConfirm,
}: VersionSwitchWarningDialogProps) {
	const t = useTranslations('Page.versionSwitch');
	const [dropToo, setDropToo] = useState(false);

	const handleOpenChange = (next: boolean) => {
		if (!next) setDropToo(false);
		onOpenChange(next);
	};

	const reasonFor = (c: VersionConflict): string => {
		if (c.reason === 'missing') return t('missingReason', { version: targetVersion });
		const choices = (c.allowedChoices ?? []).map(String).join(', ');
		return t('invalidValueReason', { version: targetVersion, choices });
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<AlertDialogContent className="max-w-[95vw] data-[size=default]:sm:max-w-xl">
				<AlertDialogHeader>
					<AlertDialogTitle>{t('title', { version: targetVersion })}</AlertDialogTitle>
					<AlertDialogDescription>
						{t('description', { version: targetVersion })}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<ul className="border-border/60 bg-muted/30 max-h-60 overflow-auto rounded-md border p-3 font-mono text-xs">
					{conflicts.map((c) => (
						<li
							key={c.key}
							className="py-1"
						>
							<span className="font-semibold">{c.key}</span>
							<span className="text-muted-foreground">: {JSON.stringify(c.currentValue)}</span>
							<span className="text-muted-foreground/70 ml-2 font-sans text-[11px] italic">
								— {reasonFor(c)}
							</span>
						</li>
					))}
				</ul>

				<label className="text-muted-foreground flex items-center gap-2 text-xs">
					<Checkbox
						checked={dropToo}
						onCheckedChange={(c) => setDropToo(c === true)}
					/>
					{t('dropCheckbox')}
				</label>

				<AlertDialogFooter>
					<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
					<AlertDialogAction onClick={() => onConfirm(dropToo)}>{t('continue')}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
