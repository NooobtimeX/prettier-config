'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormatError } from '@/components/FormatError';
import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';
import { importPrettierConfig, type ImportResult } from '@/lib/configImporter';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
	ssr: false,
	loading: () => (
		<div className="bg-muted/30 text-muted-foreground flex h-48 items-center justify-center rounded-md border text-xs">
			<Loader2
				className="h-4 w-4 animate-spin"
				aria-hidden
			/>
		</div>
	),
});

interface ImportConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	options: PrettierOptionType[];
	version: string;
	/** Called with the merged `applied + preserved` map on Apply click. */
	onApply: (next: Record<string, unknown>) => void;
}

/**
 * Lets the user paste an existing `.prettierrc` (any common format) and apply
 * it to the form. Drives the form's `setSelected` through `onApply`, so the
 * imported config persists to localStorage and rides into the share URL hash
 * automatically.
 */
export function ImportConfigDialog({
	open,
	onOpenChange,
	options,
	version,
	onApply,
}: ImportConfigDialogProps) {
	const t = useTranslations('Page.import');
	const [pasted, setPasted] = useState('');
	const [result, setResult] = useState<ImportResult | null>(null);
	const [parsing, setParsing] = useState(false);

	// Reset state every time the dialog closes so the next open starts fresh.
	// Done in the change handler (not a useEffect) to avoid cascading renders.
	const handleOpenChange = (next: boolean) => {
		if (!next) {
			setPasted('');
			setResult(null);
			setParsing(false);
		}
		onOpenChange(next);
	};

	const handleParse = () => {
		setParsing(true);
		const r = importPrettierConfig(pasted, options, version);
		setResult(r);
		setParsing(false);
	};

	const canApply =
		result !== null && result.error === null && Object.keys(result.applied).length > 0;

	const handleApply = () => {
		if (!result || !canApply) return;
		onApply({ ...result.applied, ...result.preserved });
	};

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
					<CodeEditor
						value={pasted}
						onChange={setPasted}
						parser="json5"
						placeholder={t('placeholder')}
						minHeight="14rem"
					/>

					{result?.error && <FormatError message={result.error} />}

					{result && result.error === null && (
						<div className="border-success/40 bg-success/10 text-success rounded-md border p-3 text-xs">
							<p className="mb-2 font-medium">
								{t('success', {
									applied: Object.keys(result.applied).length,
									ignored: result.ignored.length,
									preserved: Object.keys(result.preserved).length,
								})}
							</p>

							{Object.keys(result.applied).length > 0 && (
								<details className="mt-2">
									<summary className="cursor-pointer text-xs font-medium">
										{t('appliedListLabel')} ({Object.keys(result.applied).length})
									</summary>
									<ul className="mt-1 ml-4 list-disc font-mono text-[11px]">
										{Object.entries(result.applied).map(([k, v]) => (
											<li key={k}>
												<span className="font-semibold">{k}</span>: {JSON.stringify(v)}
											</li>
										))}
									</ul>
								</details>
							)}

							{result.ignored.length > 0 && (
								<details className="mt-2">
									<summary className="text-muted-foreground cursor-pointer text-xs font-medium">
										{t('ignoredListLabel')} ({result.ignored.length})
									</summary>
									<ul className="text-muted-foreground mt-1 ml-4 list-disc font-mono text-[11px]">
										{result.ignored.map((e) => (
											<li key={e.key}>
												<span className="font-semibold">{e.key}</span> — {e.reason}
											</li>
										))}
									</ul>
								</details>
							)}

							{Object.keys(result.preserved).length > 0 && (
								<details className="mt-2">
									<summary className="text-muted-foreground cursor-pointer text-xs font-medium">
										{t('preservedListLabel')} ({Object.keys(result.preserved).length})
									</summary>
									<ul className="text-muted-foreground mt-1 ml-4 list-disc font-mono text-[11px]">
										{Object.keys(result.preserved).map((k) => (
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
						variant="outline"
						onClick={handleParse}
						disabled={parsing || !pasted.trim()}
					>
						{parsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t('parseButton')}
					</Button>
					<Button
						onClick={handleApply}
						disabled={!canApply}
					>
						{t('applyButton')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
