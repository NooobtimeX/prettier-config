'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRESETS, diffPresetAgainst, type Preset } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Keys valid in the loaded Prettier version (for the diff preview). */
	validKeys: Set<string>;
	/** Loaded Prettier version (shown in the "not supported" message). */
	version: string;
	/** Currently-selected options (for the diff preview). */
	current: Record<string, unknown>;
	/** Called with the preset's options on Apply click. */
	onApply: (next: Record<string, unknown>, presetName: string) => void;
}

/**
 * Lets the user pick a starter config and previews exactly which options
 * would change before applying. Mirrors the ImportConfigDialog layout so the
 * "applied / preserved / ignored" mental model carries over.
 */
export function PresetDialog({
	open,
	onOpenChange,
	validKeys,
	version,
	current,
	onApply,
}: PresetDialogProps) {
	const t = useTranslations('Page.presets');
	const [selectedId, setSelectedId] = useState<string>(PRESETS[0]?.id ?? '');

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setSelectedId(PRESETS[0]?.id ?? '');
		}
		onOpenChange(next);
	};

	const selected = PRESETS.find((p) => p.id === selectedId) ?? PRESETS[0];

	const diff = useMemo(
		() => (selected ? diffPresetAgainst(current, selected, validKeys) : null),
		[current, selected, validKeys],
	);

	const handleApply = () => {
		if (!selected) return;
		onApply(selected.options, t(`items.${selected.id}.name`));
	};

	const addCount = diff ? Object.keys(diff.adds).length : 0;
	const changeCount = diff ? Object.keys(diff.changes).length : 0;
	const removeCount = diff ? diff.removes.length : 0;
	const ignoredCount = diff ? diff.ignored.length : 0;

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="flex max-h-[85vh] w-[95vw] max-w-3xl flex-col overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="shrink-0 border-b p-4">
					<DialogTitle className="text-base">{t('dialogTitle')}</DialogTitle>
					<p className="text-muted-foreground mt-1 text-xs">{t('intro')}</p>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
					<ul className="grid gap-2 sm:grid-cols-2">
						{PRESETS.map((preset) => (
							<li key={preset.id}>
								<PresetCard
									preset={preset}
									selected={preset.id === selectedId}
									onSelect={() => setSelectedId(preset.id)}
									name={t(`items.${preset.id}.name`)}
									description={t(`items.${preset.id}.description`)}
									keyCount={Object.keys(preset.options).length}
								/>
							</li>
						))}
					</ul>

					{diff && (
						<div className="border-success/40 bg-success/10 text-success rounded-md border p-3 text-xs">
							<p className="mb-2 font-medium">{t('changesLabel')}</p>
							<p className="text-muted-foreground mb-2">
								{t('addsLabel', { count: addCount })} ·{' '}
								{t('changesCountLabel', { count: changeCount })} ·{' '}
								{t('removesLabel', { count: removeCount })}
								{ignoredCount > 0
									? ` · ${t('ignoredLabel', { count: ignoredCount, version })}`
									: ''}
							</p>

							{addCount > 0 && (
								<details className="mt-2">
									<summary className="cursor-pointer text-xs font-medium">
										{t('addsLabel', { count: addCount })}
									</summary>
									<ul className="mt-1 ml-4 list-disc font-mono text-[11px]">
										{Object.entries(diff!.adds).map(([k, v]) => (
											<li key={k}>
												<span className="font-semibold">{k}</span>: {JSON.stringify(v)}
											</li>
										))}
									</ul>
								</details>
							)}

							{changeCount > 0 && (
								<details className="mt-2">
									<summary className="cursor-pointer text-xs font-medium">
										{t('changesCountLabel', { count: changeCount })}
									</summary>
									<ul className="mt-1 ml-4 list-disc font-mono text-[11px]">
										{Object.entries(diff!.changes).map(([k, [prev, next]]) => (
											<li key={k}>
												<span className="font-semibold">{k}</span>: {JSON.stringify(prev)} →{' '}
												{JSON.stringify(next)}
											</li>
										))}
									</ul>
								</details>
							)}

							{removeCount > 0 && (
								<details className="mt-2">
									<summary className="text-muted-foreground cursor-pointer text-xs font-medium">
										{t('removesLabel', { count: removeCount })}
									</summary>
									<ul className="text-muted-foreground mt-1 ml-4 list-disc font-mono text-[11px]">
										{diff!.removes.map((k) => (
											<li key={k}>
												<span className="font-semibold">{k}</span>
											</li>
										))}
									</ul>
								</details>
							)}

							{ignoredCount > 0 && (
								<details className="mt-2">
									<summary className="text-muted-foreground cursor-pointer text-xs font-medium">
										{t('ignoredLabel', { count: ignoredCount, version })}
									</summary>
									<ul className="text-muted-foreground mt-1 ml-4 list-disc font-mono text-[11px]">
										{diff!.ignored.map((k) => (
											<li key={k}>
												<span className="font-semibold">{k}</span>
											</li>
										))}
									</ul>
								</details>
							)}
						</div>
					)}
				</div>

				<div className="bg-background/95 sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-t p-3 backdrop-blur">
					<Button
						variant="ghost"
						onClick={() => handleOpenChange(false)}
					>
						{t('cancelButton')}
					</Button>
					<Button
						onClick={handleApply}
						disabled={!selected}
					>
						{t('applyButton')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function PresetCard({
	preset,
	selected,
	onSelect,
	name,
	description,
	keyCount,
}: {
	preset: Preset;
	selected: boolean;
	onSelect: () => void;
	name: string;
	description: string;
	keyCount: number;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			className={cn(
				'group flex w-full flex-col gap-1 rounded-md border p-3 text-left transition',
				'hover:border-primary/60 hover:bg-accent/40',
				selected ? 'border-primary bg-accent/60' : 'border-border',
			)}
		>
			<div className="flex items-center gap-2">
				<Sparkles
					className={cn('h-4 w-4 shrink-0', selected ? 'text-primary' : 'text-muted-foreground')}
				/>
				<span className="text-sm font-medium">{name}</span>
				<span className="text-muted-foreground ml-auto font-mono text-[11px]">
					{keyCount === 0 ? '∅' : `${keyCount}`}
				</span>
			</div>
			<p className="text-muted-foreground text-xs">{description}</p>
			<p
				className="text-muted-foreground/80 font-mono text-[10px]"
				aria-hidden
			>
				{preset.id}
			</p>
		</button>
	);
}
