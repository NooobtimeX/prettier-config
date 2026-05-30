'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plug, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLUGINS, type Plugin } from '@/lib/plugins';
import { cn } from '@/lib/utils';

interface PluginPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Currently-enabled plugin ids. */
	current: readonly string[];
	/** Called with the new id list on Apply. */
	onApply: (next: string[]) => void;
}

/**
 * Multi-select picker for curated third-party Prettier plugins. The internal
 * draft state lives in `PluginPickerBody`, which only mounts while the dialog
 * is open — that means `useState`'s initial value re-reads `current` every
 * time the dialog opens, without a sync-setState-in-effect cascade.
 */
export function PluginPickerDialog({
	open,
	onOpenChange,
	current,
	onApply,
}: PluginPickerDialogProps) {
	const t = useTranslations('Page.plugins');
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="flex max-h-[85vh] w-[95vw] max-w-3xl flex-col overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="shrink-0 border-b p-4">
					<DialogTitle className="text-base">{t('dialogTitle')}</DialogTitle>
					<p className="text-muted-foreground mt-1 text-xs">{t('intro')}</p>
				</DialogHeader>

				{open && (
					<PluginPickerBody
						current={current}
						onApply={onApply}
						onCancel={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function PluginPickerBody({
	current,
	onApply,
	onCancel,
}: {
	current: readonly string[];
	onApply: (next: string[]) => void;
	onCancel: () => void;
}) {
	const t = useTranslations('Page.plugins');
	const [draft, setDraft] = useState<string[]>(() => [...current]);

	const toggle = (id: string) => {
		setDraft((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
	};

	return (
		<>
			<div className="min-h-0 flex-1 space-y-2 overflow-auto p-4">
				<ul className="grid gap-2 sm:grid-cols-2">
					{PLUGINS.map((plugin) => (
						<li key={plugin.id}>
							<PluginCard
								plugin={plugin}
								selected={draft.includes(plugin.id)}
								onToggle={() => toggle(plugin.id)}
								name={t(`items.${plugin.id}.name`)}
								description={t(`items.${plugin.id}.description`)}
								appliesToLabel={t('appliesToLabel')}
							/>
						</li>
					))}
				</ul>
			</div>

			<div className="bg-background/95 sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-2 border-t p-3 backdrop-blur">
				<Button
					variant="ghost"
					onClick={onCancel}
				>
					{t('cancelButton')}
				</Button>
				<Button onClick={() => onApply(draft)}>{t('applyButton')}</Button>
			</div>
		</>
	);
}

function PluginCard({
	plugin,
	selected,
	onToggle,
	name,
	description,
	appliesToLabel,
}: {
	plugin: Plugin;
	selected: boolean;
	onToggle: () => void;
	name: string;
	description: string;
	appliesToLabel: string;
}) {
	return (
		<div
			className={cn(
				'flex w-full flex-col gap-2 rounded-md border p-3 transition',
				selected ? 'border-primary bg-accent/60' : 'border-border',
			)}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-pressed={selected}
				className="flex w-full items-start gap-2 text-left"
			>
				<Plug
					className={cn(
						'mt-0.5 h-4 w-4 shrink-0',
						selected ? 'text-primary' : 'text-muted-foreground',
					)}
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">{name}</span>
						<span className="text-muted-foreground ml-auto font-mono text-[10px]">
							v{plugin.version}
						</span>
					</div>
					<p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
					<p className="text-muted-foreground/80 mt-1 font-mono text-[10px]">{plugin.npm}</p>
				</div>
			</button>
			<div className="text-muted-foreground flex items-center justify-between text-[11px]">
				<span>
					<span className="font-medium">{appliesToLabel}</span> {plugin.parsers.join(', ')}
				</span>
				<a
					href={plugin.homepage}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-primary inline-flex items-center gap-1"
					onClick={(e) => e.stopPropagation()}
				>
					<ExternalLink className="h-3 w-3" />
				</a>
			</div>
		</div>
	);
}
